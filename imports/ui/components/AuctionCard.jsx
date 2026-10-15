import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Countdown } from "./Countdown";

const money = (value) =>
  Number(value ?? 0).toLocaleString("es-MX");

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
  const user = useTracker(() => Meteor.user());

  const isFavorite = (
    user?.profile?.favorites || []
  ).includes(_id);

  const isInCart = (
    user?.profile?.cart || []
  ).includes(_id);

  const ended =
    status === "finalizada" ||
    (endsAt && new Date(endsAt).getTime() <= Date.now());

  const toggleItem = (event, method) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    Meteor.call(method, _id, (error) => {
      if (error) {
        alert(error.reason || "No se pudo actualizar el producto.");
      }
    });
  };

  return (
    <article className="card auction-home-card">
      <Link to={"/auction/" + _id} className="card-link">
        <img
          src={image || "/images/laptop.jpg"}
          alt={title || "Imagen de la subasta"}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/images/laptop.jpg";
          }}
        />

        <div className={ended ? "badge ended" : "badge active"}>
          {ended ? "FINALIZADA" : "ACTIVA"}
        </div>

        <div className="card-top">
          <h3>{title}</h3>
        </div>

        <p>{description || "Consulta los detalles del producto."}</p>

        <p className="auction-start-price">
          Precio al publicarse:{" "}
          <strong>${money(startingPrice ?? price)}</strong>
        </p>

        <p className="auction-price">
          Precio actual: <strong>${money(price)}</strong>
        </p>

        {!ended && <Countdown endsAt={endsAt} />}

        <p>
          Selecciona para consultar todos los detalles y el
          historial de pujas.
        </p>
      </Link>

      <div className="auction-actions">
        <button
          type="button"
          className="favorite-btn"
          onClick={(event) => toggleItem(event, "toggleFavorite")}
          aria-label={
            isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
          }
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>

        <button
          type="button"
          className="btn-cart"
          onClick={(event) => toggleItem(event, "toggleCart")}
          aria-label={
            isInCart ? "Quitar del carrito" : "Agregar al carrito"
          }
        >
          {isInCart ? "🛒✓" : "🛒"}
        </button>

        <Link to={"/auction/" + _id} className="btn-details">
          Ver detalles
        </Link>
      </div>
    </article>
  );
};
