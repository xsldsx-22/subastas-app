import React, { useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Auctions } from "../../api/Auctions";
import { useState, useEffect } from "react";

export const Catalog = () => {

const getTimeLeft = (endsAt) => {
  const total = new Date(endsAt) - new Date();

  if (total <= 0) return "Finalizada";

  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
};

  const [search, setSearch] =
    useState("");

  const [sortType, setSortType] =
    useState("recent");

  const [category, setCategory] =
    useState("all");

  const user =
    useTracker(() => {
      return Meteor.user();
    });

  const auctions =
    useTracker(() => {

      Meteor.subscribe(
        "auctions"
      );

      return Auctions.find().fetch();

    });

  let filteredAuctions =
    auctions.filter((auction) => {

      const matchesSearch =

        auction.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =

        category === "all"
          ||
        auction.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );

    });

  if (sortType === "low") {

    filteredAuctions.sort(
      (a, b) =>
        a.price - b.price
    );

  }

  if (sortType === "high") {

    filteredAuctions.sort(
      (a, b) =>
        b.price - a.price
    );

  }

  if (sortType === "recent") {

    filteredAuctions.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

  }

  const toggleFavorite = (
    auctionId
  ) => {

    if (!user) {

      alert(
        "Debes iniciar sesión"
      );

      return;

    }

    Meteor.call(
      "toggleFavorite",
      auctionId
    );

  };

  const toggleCart = (
    auctionId
  ) => {

    if (!user) {

      alert(
        "Debes iniciar sesión"
      );

      return;

    }

    Meteor.call(
      "toggleCart",
      auctionId
    );

  };

  return (

    <div className="catalog-page">

      <div className="catalog-header">

        <h1>
          Catálogo de Subastas
        </h1>

        <input
          type="text"
          placeholder="Buscar subasta..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="search-input"
        />

      </div>

      <div className="catalog-filters">

        <select
          value={sortType}
          onChange={(e) =>
            setSortType(
              e.target.value
            )
          }
        >

          <option value="recent">
            Más recientes
          </option>

          <option value="low">
            Menor precio
          </option>

          <option value="high">
            Mayor precio
          </option>

        </select>

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
        >

          <option value="all">
            Todas las categorías
          </option>

          <option value="Tecnología">
            Tecnología
          </option>

          <option value="Gaming">
            Gaming
          </option>

          <option value="Ropa">
            Ropa
          </option>

          <option value="Hogar">
            Hogar
          </option>

          <option value="Coleccionables">
            Coleccionables
          </option>

        </select>

      </div>

      <div className="auction-grid">

        {

          filteredAuctions.length === 0

            ? (

              <p>
                No se encontraron
                subastas
              </p>

            )

            : (

              filteredAuctions.map(
                (auction) => {

                  const useCountdown = (endsAt) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const total = new Date(endsAt) - new Date();

      if (total <= 0) {
        setTimeLeft("Finalizada");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(total / (1000 * 60 * 60));
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const seconds = Math.floor((total / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  return timeLeft;
};
                  const isFavorite =

                    user?.profile
                      ?.favorites
                      ?.includes(
                        auction._id
                      );

                  const isInCart =

                    user?.profile
                      ?.cart
                      ?.includes(
                        auction._id
                      );

                  return (

                    <div
                      key={auction._id}
                      className="auction-card"
                    >

                      <img
                        src={
                          auction.image ||
                          "https://via.placeholder.com/300"
                        }
                        alt={
                          auction.title
                        }
                      />

                      <div className="auction-info">
                        <div
  className={
    auction.status === "finalizada"
      ? "status-finished"
      : "status-active"
  }
>
  {auction.status || "activa"}
</div>

                        <h3>
                          {auction.title}
                        </h3>

                        <p>
                          {auction.description}
                        </p>

                        <div className="auction-price">

                          <span>
                            Precio actual:
                          </span>

                          <strong>
                            $
                            {auction.price?.toLocaleString()}
                          </strong>

                        </div>

                        <div className="auction-actions">

                          <Link
                            to={`/auction/${auction._id}`}
                            className="btn-details"
                          >
                            Ver detalles
                          </Link>

                          <button
                            onClick={() =>
                              toggleFavorite(
                                auction._id
                              )
                            }
                            className="btn-favorite"
                          >

                            {
                              isFavorite
                                ? "❤️"
                                : "🤍"
                            }

                          </button>

                          <button
                            onClick={() =>
                              toggleCart(
                                auction._id
                              )
                            }
                            className="btn-cart"
                          >

                            {
                              isInCart
                                ? "🛒✓"
                                : "🛒"
                            }

                          </button>

                        </div>

                      </div>

                    </div>

                  );

                }
              )

            )

        }

      </div>

    </div>

  );

};