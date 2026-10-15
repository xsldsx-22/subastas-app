import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Countdown } from "./Countdown";

const money = (value) => Number(value || 0).toLocaleString("es-MX");

export const AuctionCard = ({
  _id,
  image,
  title,
  price,
  startingPrice,
  description,
  endsAt,
  status,
}) => {
  const navigate = useNavigate();
  const currentUser = useTracker(() => Meteor.user());
  const favorites = currentUser?.profile?.favorites || [];
  const cart = currentUser?.profile?.cart || [];
  const isFavorite = favorites.includes(_id);
  const isInCart = cart.includes(_id);
  const ended = status === "finalizada" || (endsAt && new Date(endsAt).getTime() <= Date.now());

  const toggleItem = (method) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    Meteor.call(method, _id, (error) => {
      if (error) alert(error.reason || "No se pudo actualizar el producto.");
    });
  };

  return (
    <article className="card auction-home-card">
      <Link to={`/auction/${_id}`} className="card-link">
        <img
          src={image || "/images/laptop.jpg"}
          alt={title || "Imagen de la subasta"}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/images/laptop.jpg";
          }}
        />
        <div className="badge-row">
          <span className={ended ? "badge ended" : "badge active"}>
            {ended ? "FINALIZADA" : "ACTIVA"}
          </span>
        </div>
        <div className="card-top">
          <h3>{title}</h3>
        </div>
        <p className="home-card-description">{description || "Consulta los detalles del producto."}</p>
        <p className="home-card-start-price">
          Precio inicial: <strong>${money(startingPrice ?? price)}</strong>
        </p>
        <p className="home-card-current-price">
          Precio actual: <strong>${money(price)}</strong>
        </p>
        {!ended && <div className="home-card-countdown"><Countdown endsAt={endsAt} /></div>}
      </Link>

      <div className="card-actions">
        <button
          type="button"
          className="favorite-btn"
          onClick={() => toggleItem("toggleFavorite")}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
        <button
          type="button"
          className="home-card-cart-button"
          onClick={() => toggleItem("toggleCart")}
          aria-label={isInCart ? "Quitar del carrito" : "Agregar al carrito"}
        >
          {isInCart ? "🛒✓" : "🛒"}
        </button>
        <Link to={`/auction/${_id}`} className="btn-details">Ver detalles</Link>
      </div>
    </article>
  );
};
