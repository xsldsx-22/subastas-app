import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { WebApp } from "meteor/webapp";
import { Auctions } from "./Auctions";
import { Orders } from "./Orders";

const MP_API = "https://api.mercadopago.com";

function getAccessToken() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Meteor.Error(
      "payment-not-configured",
      "Mercado Pago todavía no está configurado en el servidor."
    );
  }
  return token;
}

Meteor.methods({
  async createMercadoPagoPreference() {
    if (!this.userId) {
      throw new Meteor.Error("no-auth", "Inicia sesión antes de pagar.");
    }

    const token = getAccessToken();
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) {
      throw new Meteor.Error("no-auth", "No se encontró tu cuenta.");
    }

    const cartIds = user.profile?.cart || [];
    if (!cartIds.length) {
      throw new Meteor.Error("empty-cart", "Tu carrito está vacío.");
    }

    const auctions = await Auctions.find({ _id: { $in: cartIds } }).fetchAsync();
    if (!auctions.length || auctions.length !== cartIds.length) {
      throw new Meteor.Error(
        "invalid-cart",
        "Hay productos de tu carrito que ya no están disponibles. Actualiza el carrito e inténtalo otra vez."
      );
    }

    const now = new Date();
    const ineligible = auctions.find((auction) => {
      const ended = auction.status === "finalizada" ||
        (auction.endsAt && new Date(auction.endsAt).getTime() <= now.getTime());
      return !ended || auction.lastBidBy !== this.userId;
    });

    if (ineligible) {
      throw new Meteor.Error(
        "auction-not-won",
        "Solo puedes pagar subastas que hayan terminado y en las que hayas sido el ganador. Quita del carrito las subastas activas o que no ganaste."
      );
    }

    if (auctions.some((auction) => !Number.isFinite(Number(auction.price)) || Number(auction.price) <= 0)) {
      throw new Meteor.Error("invalid-total", "El total del carrito no es válido.");
    }

    const email = user.emails?.find((entry) => entry.verified)?.address ||
      user.emails?.[0]?.address;

    const orderItems = auctions.map((auction) => ({
      id: auction._id,
      title: String(auction.title || "Artículo de subasta").slice(0, 250),
      quantity: 1,
      unit_price: Number(Number(auction.price).toFixed(2)),
      currency_id: "MXN",
    }));

    const total = Number(
      orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0).toFixed(2)
    );

    const orderId = await Orders.insertAsync({
      buyerId: this.userId,
      auctionIds: auctions.map((auction) => auction._id),
      items: orderItems,
      total,
      currency: "MXN",
      status: "pending",
      createdAt: new Date(),
    });

    const publicBase = Meteor.absoluteUrl();
    const notificationUrl = process.env.MP_NOTIFICATION_URL ||
      Meteor.absoluteUrl("api/mercadopago/webhook");

    const preferenceBody = {
      items: orderItems,
      external_reference: orderId,
      notification_url: notificationUrl,
      back_urls: {
        success: `${publicBase}payment-result?orderId=${encodeURIComponent(orderId)}`,
        pending: `${publicBase}payment-result?orderId=${encodeURIComponent(orderId)}`,
        failure: `${publicBase}payment-result?orderId=${encodeURIComponent(orderId)}`,
      },
      ...(email ? { payer: { email } } : {}),
      statement_descriptor: "SUBASTASPRO",
      metadata: { order_id: orderId, buyer_id: this.userId },
    };

    let response;
    let preference;
    try {
      response = await fetch(`${MP_API}/checkout/preferences`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferenceBody),
      });
      preference = await response.json();
    } catch (error) {
      console.error("Error de conexión con Mercado Pago:", error);
      await Orders.updateAsync(orderId, {
        $set: { status: "preference_error", updatedAt: new Date() },
      });
      throw new Meteor.Error("payment-connection", "No se pudo conectar con Mercado Pago. Inténtalo nuevamente.");
    }

    if (!response.ok || !preference.id) {
      console.error("Mercado Pago rechazó la preferencia:", preference);
      await Orders.updateAsync(orderId, {
        $set: { status: "preference_error", updatedAt: new Date() },
      });
      throw new Meteor.Error(
        "preference-failed",
        "Mercado Pago no pudo generar el enlace de pago. Revisa las variables de producción."
      );
    }

    await Orders.updateAsync(orderId, {
      $set: {
        preferenceId: preference.id,
        status: "checkout_created",
        updatedAt: new Date(),
      },
    });

    const checkoutUrl = preference.init_point || preference.sandbox_init_point;
    if (!checkoutUrl) {
      throw new Meteor.Error("missing-checkout-url", "Mercado Pago no devolvió la URL de pago.");
    }

    return { orderId, checkoutUrl };
  },

  async getMyPaymentStatus(orderId) {
    check(orderId, String);
    if (!this.userId) {
      throw new Meteor.Error("no-auth", "Inicia sesión para consultar el pago.");
    }

    const order = await Orders.findOneAsync({
      _id: orderId,
      buyerId: this.userId,
    });

    if (!order) {
      throw new Meteor.Error("not-found", "No se encontró esa orden de pago.");
    }

    return {
      status: order.status,
      total: order.total,
      currency: order.currency,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    };
  },
});

// El webhook nunca confía en el JSON entrante como prueba de pago.
// Consulta el pago directamente a Mercado Pago y valida orden, monto, moneda y estado.
WebApp.connectHandlers.use("/api/mercadopago/webhook", (req, res) => {
  const send = (status, body = "ok") => {
    res.statusCode = status;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(body);
  };

  const processNotification = async () => {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk.toString("utf8");

    let body = {};
    if (rawBody) {
      try { body = JSON.parse(rawBody); } catch { body = {}; }
    }

    const requestUrl = new URL(req.url || "/", "http://localhost");
    const paymentId =
      requestUrl.searchParams.get("data.id") ||
      requestUrl.searchParams.get("id") ||
      body.data?.id ||
      body.id;

    if (!paymentId) {
      send(200, "notification received");
      return;
    }

    const token = getAccessToken();
    const response = await fetch(
      `${MP_API}/v1/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      console.error("No se pudo verificar el pago de Mercado Pago:", response.status);
      send(500, "payment verification failed");
      return;
    }

    const payment = await response.json();
    const orderId = payment.external_reference;
    if (!orderId) {
      send(200, "payment has no order reference");
      return;
    }

    const order = await Orders.findOneAsync(orderId);
    if (!order) {
      send(200, "order not found");
      return;
    }

    const correctAmount =
      Number(Number(payment.transaction_amount).toFixed(2)) === Number(Number(order.total).toFixed(2));
    const correctCurrency = payment.currency_id === order.currency;
    const correctReference = payment.external_reference === order._id;

    if (!correctAmount || !correctCurrency || !correctReference) {
      console.error("Pago recibido con datos que no coinciden con la orden:", orderId);
      send(200, "payment details do not match order");
      return;
    }

    if (payment.status === "approved" && order.status !== "paid") {
      await Orders.updateAsync(order._id, {
        $set: {
          status: "paid",
          paymentId: String(payment.id),
          paymentStatus: payment.status,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Ya cobrada la orden: quitar solo sus artículos del carrito del comprador.
      await Meteor.users.updateAsync(order.buyerId, {
        $pull: { "profile.cart": { $in: order.auctionIds } },
      });
    } else if (["rejected", "cancelled"].includes(payment.status)) {
      await Orders.updateAsync(order._id, {
        $set: {
          status: payment.status,
          paymentId: String(payment.id),
          paymentStatus: payment.status,
          updatedAt: new Date(),
        },
      });
    }

    send(200, "ok");
  };

  processNotification().catch((error) => {
    console.error("Error procesando webhook de Mercado Pago:", error);
    if (!res.writableEnded) send(500, "webhook processing error");
  });
});
