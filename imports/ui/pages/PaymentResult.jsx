import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Meteor } from "meteor/meteor";

const statusLabels = {
  pending: "Esperando el pago",
  checkout_created: "El pago está pendiente de confirmación",
  paid: "Pago aprobado",
  rejected: "Pago rechazado",
  cancelled: "Pago cancelado",
  preference_error: "No se pudo crear el pago",
};

const money = (value, currency = "MXN") =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(Number(value || 0));

export const PaymentResult = () => {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const refreshStatus = useCallback(() => {
    if (!orderId) {
      setErrorText("No encontramos el identificador de la orden.");
      return;
    }
    setLoading(true);
    setErrorText("");
    Meteor.call("getMyPaymentStatus", orderId, (error, result) => {
      setLoading(false);
      if (error) {
        setErrorText(error.reason || "No se pudo consultar el estado del pago.");
        return;
      }
      setOrder(result);
    });
  }, [orderId]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const isPaid = order?.status === "paid";

  return (
    <section className="payment-result-page">
      <div className="payment-result-card">
        <div className={isPaid ? "payment-result-icon payment-result-success" : "payment-result-icon"}>
          {isPaid ? "✓" : "💳"}
        </div>
        <h1>{isPaid ? "¡Pago confirmado!" : "Estado de tu pago"}</h1>
        {errorText ? <p role="alert">{errorText}</p> : (
          <>
            <p>{loading && !order ? "Consultando la orden…" : statusLabels[order?.status] || "Esperando confirmación de Mercado Pago."}</p>
            {order && <p className="payment-result-total">Total: <strong>{money(order.total, order.currency)}</strong></p>}
            {!isPaid && (
              <p className="payment-result-note">
                La confirmación puede tardar unos momentos. El pedido solo se marca como pagado después de que el servidor verifica el pago con Mercado Pago.
              </p>
            )}
          </>
        )}
        <div className="payment-result-actions">
          <button type="button" onClick={refreshStatus} disabled={loading}>
            {loading ? "Actualizando…" : "Actualizar estado"}
          </button>
          <Link className="btn-details" to="/cart">Volver al carrito</Link>
          <Link className="payment-secondary-link" to="/profile">Ir a mi perfil</Link>
        </div>
      </div>
    </section>
  );
};
