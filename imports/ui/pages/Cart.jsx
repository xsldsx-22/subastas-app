import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Auctions } from "../../api/Auctions";

const money = (value) =>
  Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const Cart = () => {
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { user, auctions, ready } = useTracker(() => {
    const userSub = Meteor.subscribe("myUserData");
    const auctionSub = Meteor.subscribe("allAuctions");
    const currentUser = Meteor.user();
    const ids = currentUser?.profile?.cart || [];

    return {
      user: currentUser,
      auctions: Auctions.find({ _id: { $in: ids } }).fetch(),
      ready: userSub.ready() && auctionSub.ready(),
    };
  });

  const total = auctions.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!auctions.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    setCheckoutLoading(true);
    Meteor.call("createMercadoPagoPreference", (error, result) => {
      setCheckoutLoading(false);
      if (error) {
        alert(error.reason || "No se pudo iniciar el pago.");
        return;
      }
      if (!result?.checkoutUrl) {
        alert("Mercado Pago no devolvió una dirección de pago.");
        return;
      }
      window.location.assign(result.checkoutUrl);
    });
  };

  if (!ready) {
    return <section className="cart-page"><h1>Cargando carrito…</h1></section>;
  }

  if (!user) {
    return (
      <section className="cart-page cart-empty-state">
        <h1>Mi carrito</h1>
        <p>Inicia sesión para consultar tu carrito.</p>
        <Link className="btn-details" to="/login">Iniciar sesión</Link>
      </section>
    );
  }

  return (
    <section className="cart-page cart-page-new">
      <h1>Mi carrito</h1>
      {auctions.length ? (
        <>
          <div className="cart-grid">
            {auctions.map((item) => (
              <article className="cart-card" key={item._id}>
                <Link className="cart-image-link" to={`/auction/${item._id}`} aria-label={`Ver ${item.title}`}>
                  <img
                    src={item.image || "/images/laptop.jpg"}
                    alt={item.title || "Imagen de la subasta"}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/images/laptop.jpg";
                    }}
                  />
                </Link>
                <div className="cart-card-content">
                  <Link to={`/auction/${item._id}`}><h3>{item.title}</h3></Link>
                  <p className="cart-item-price">Precio actual: ${money(item.price)}</p>
                  <p className="cart-item-status">Estado: {item.status || "activa"}</p>
                  <div className="cart-card-actions">
                    <Link className="btn-details" to={`/auction/${item._id}`}>Ver subasta</Link>
                    <button
                      type="button"
                      onClick={() => Meteor.call("toggleCart", item._id, (error) => {
                        if (error) alert(error.reason || "No se pudo quitar el producto.");
                      })}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="cart-total">
            <div>
              <h2>Total: ${money(total)}</h2>
              <p>Para pagar, todos los artículos deben ser subastas finalizadas que hayas ganado.</p>
            </div>
            <button className="btn-checkout" type="button" onClick={handleCheckout} disabled={checkoutLoading}>
              {checkoutLoading ? "Conectando con Mercado Pago…" : "Pagar con Mercado Pago"}
            </button>
          </div>
        </>
      ) : (
        <div className="cart-empty-state">
          <p>Tu carrito está vacío.</p>
          <Link className="btn-details" to="/catalog">Explorar subastas</Link>
        </div>
      )}
    </section>
  );
};
