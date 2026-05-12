import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Auctions } from "../../api/Auctions";
import { useState, useEffect } from "react";

export const AuctionDetails = () => {

  const getTimeLeft = (endsAt) => {
  const total = new Date(endsAt) - new Date();

  if (total <= 0) return "Finalizada";

  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
};

  const { id } = useParams();

  const [bidAmount, setBidAmount] =
    useState("");

  const auction =
    useTracker(() => {

      Meteor.subscribe(
        "auctions"
      );

      return Auctions.findOne({_id: id});

    });

  if (!auction) {

    return (

      <div className="page-container">

        <h2>
          Cargando subasta...
        </h2>

      </div>

    );

  }

  const bids =
    auction.bids || [];

  const currentPrice =
    auction.price || 0;

  const handleBid = () => {

    if (!Meteor.user()) {

      alert(
        "Debes iniciar sesión"
      );

      return;

    }

    const amount =
      Number(bidAmount);

    if (
      amount <= currentPrice
    ) {

      alert("La puja debe ser mayor a $" + currentPrice);

      return;

    }

    Meteor.call(

      "placeBid",

      auction._id,

      amount,

      (error) => {

        if (error) {

          alert(
            error.reason
          );

        }

        else {

          setBidAmount("");

        }

      }

    );

  };

  return (

    <div className="details-page">

      <Link
        to="/catalog"
        className="btn-back"
      >

        ← Regresar

      </Link>

      <div className="details-grid">

        <div className="details-left">

          <div className="details-image-wrap">

            <img
              src={
                auction.image ||
                "https://via.placeholder.com/500"
              }
              alt={
                auction.title
              }
            />

          </div>

          <div className="details-description">

            <h3>
              Descripción
            </h3>

            <p>
              {auction.description}
            </p>

            <div className="details-meta">

              <div className="meta-row">

                <span>
                  Categoría:
                </span>

                <span className="badge-category">

                  {auction.category}

                </span>

              </div>

              <div className="meta-row">

                <span>
                  Vendedor:
                </span>

                <strong>

                  {
                    auction.ownerName ||
                    "Usuario"
                  }

                </strong>

              </div>

              <div className="meta-row">

                <span>
                  Precio actual:
                </span>

                <strong>

                  $
                  {
                    auction.price?.toLocaleString()
                  }

                </strong>

              </div>

            </div>

          </div>

        </div>

        <div className="details-right">

          <h1 className="details-title">

            {auction.title}

          </h1>

          <div className="price-box">

            <div>
              💲 Precio Actual
            </div>

            <div className="price-value">

              $
              {
                currentPrice.toLocaleString()
              }

            </div>

          </div>

          <div className="bid-card">

            <label>
              Tu Puja
            </label>

            <div className="bid-section">

              <input
                type="number"
                placeholder={"Mínimo $" + (currentPrice + 1)}
                value={bidAmount}
                onChange={(e) =>
                  setBidAmount(
                    e.target.value
                  )
                }
              />

              <button
                onClick={handleBid}
              >

                🔨 Pujar

              </button>

            </div>

          </div>

          <div className="history-card">

            <h3>

              Historial de Pujas
              ({bids.length})

            </h3>

            {

              bids.length === 0

              ? (

                <p className="empty-history">

                  Aún no hay pujas

                </p>

              )

              : (

                bids.map(
                  (bid, index) => (

                    <div
                      key={index}
                      className="history-item"
                    >

                      <span className="history-user">

                        {
                          bid.username ||
                          "Usuario"
                        }

                      </span>

                      <span className="history-price">

                        $
                        {
                          bid.amount.toLocaleString()
                        }

                      </span>

                    </div>

                  )
                )

              )

            }

          </div>

        </div>

      </div>

    </div>

  );

};