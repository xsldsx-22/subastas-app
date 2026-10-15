import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Auctions } from "../../api/Auctions";

const money = (value) =>
  Number(value ?? 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "No disponible";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "No disponible"
    : date.toLocaleString("es-MX");
};

export const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bidAmount, setBidAmount] = useState("");
  const [sendingBid, setSendingBid] = useState(false);

  const { auction, ready } = useTracker(() => {
    const subscription = Meteor.subscribe("allAuctions");

    return {
      auction: Auctions.findOne({ _id: id }),
      ready: subscription.ready(),
    };
  });

  if (!ready) {
    return (
      <div className="details-page">
        <h2>Cargando detalles de la subasta...</h2>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="details-page">
        <h2>No se encontró esta subasta.</h2>
        <Link to="/catalog" className="btn-details">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const bids = [...(auction.bids || [])].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  const currentPrice = Number(auction.price ?? 0);

  const startingPrice = Number(
    auction.startingPrice ?? auction.price ?? 0
  );

  const ended =
    auction.status === "finalizada" ||
    (auction.endsAt &&
      new Date(auction.endsAt).getTime() <= Date.now());

  const submitBid = (event) => {
    event.preventDefault();

    if (!Meteor.userId()) {
      navigate("/login");
      return;
    }

    const amount = Number(bidAmount);

    if (!Number.isFinite(amount) || amount <= currentPrice) {
      alert(
        `La puja debe superar el precio actual de $${money(
          currentPrice
        )}.`
      );
      return;
    }

    if (ended) {
      alert("Esta subasta ya finalizó.");
      return;
    }

    setSendingBid(true);

    Meteor.call("placeBid", auction._id, amount, (error) => {
      setSendingBid(false);

      if (error) {
        alert(error.reason || "No se pudo registrar la puja.");
        return;
      }

      setBidAmount("");
    });
  };

  return (
    <div className="details-page">
      <div className="details-topbar">
    <Link to="/catalog" className="btn-back">
      ← Volver al catálogo
    </Link>
  </div>


      <div className="details-grid">
        <section className="details-left">
          <div className="details-image-wrap">
            <img
              src={auction.image || "/images/laptop.jpg"}
              alt={auction.title || "Imagen de la subasta"}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/images/laptop.jpg";
              }}
            />
          </div>

          <div className="details-description">
            <h3>Descripción del producto</h3>
            <p>{auction.description || "Sin descripción."}</p>

            <div className="details-meta">
              <div className="meta-row">
                <span>Categoría</span>
                <strong>{auction.category || "Sin categoría"}</strong>
              </div>

              <div className="meta-row">
                <span>Estado del producto</span>
                <strong>{auction.condition || "No especificado"}</strong>
              </div>

              <div className="meta-row">
                <span>Vendedor</span>
                <strong>{auction.ownerName || "Usuario"}</strong>
              </div>

              <div className="meta-row">
                <span>Fecha de publicación</span>
                <strong>{formatDate(auction.createdAt)}</strong>
              </div>

              <div className="meta-row">
                <span>Precio al publicarse</span>
                <strong>${money(startingPrice)}</strong>
              </div>

              <div className="meta-row">
                <span>Precio actual</span>
                <strong>${money(currentPrice)}</strong>
              </div>

              <div className="meta-row">
                <span>Estado de la subasta</span>
                <strong>{ended ? "Finalizada" : "Activa"}</strong>
              </div>

              <div className="meta-row">
                <span>Fecha de cierre</span>
                <strong>{formatDate(auction.endsAt)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="details-right">
          <h1 className="details-title">{auction.title}</h1>

          <div className="price-box">
            <div>Precio actual</div>

            <div className="price-value">
              ${money(currentPrice)}
            </div>

            <p>
              Precio de publicación:{" "}
              <strong>${money(startingPrice)}</strong>
            </p>

            <p>Publicada: {formatDate(auction.createdAt)}</p>
            <p>Termina: {formatDate(auction.endsAt)}</p>
          </div>

          <div className="bid-card">
            <h3>Realizar una puja</h3>

            {ended ? (
              <p>
                Esta subasta ya finalizó. Puedes consultar el
                historial de pujas.
              </p>
            ) : (
              <form onSubmit={submitBid}>
                <label htmlFor="bid-amount">
                  Tu oferta (debe superar el precio actual)
                </label>

                <div className="bid-section">
                  <input
                    id="bid-amount"
                    type="number"
                    min={currentPrice + 0.01}
                    step="0.01"
                    placeholder={`Mínimo $${money(
                      currentPrice + 0.01
                    )}`}
                    value={bidAmount}
                    onChange={(event) =>
                      setBidAmount(event.target.value)
                    }
                    required
                  />

                  <button type="submit" disabled={sendingBid}>
                    {sendingBid ? "Enviando..." : "Pujar"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="history-card">
            <h3>Historial de pujas ({bids.length})</h3>

            {bids.length === 0 ? (
              <p className="empty-history">
                Aún no se han realizado pujas.
              </p>
            ) : (
              <div className="history-list">
                {bids.map((bid, index) => (
                  <div
                    className="history-item"
                    key={`${bid.userId || "bid"}-${
                      bid.createdAt || index
                    }-${index}`}
                  >
                    <div>
                      <strong className="history-user">
                        {bid.username || "Usuario"}
                      </strong>

                      <div className="history-date">
                        {formatDate(bid.createdAt)}
                      </div>
                    </div>

                    <strong className="history-price">
                      ${money(bid.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
