import React, { useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Link, useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Auctions } from "../../api/Auctions";
import { Countdown } from "../components/Countdown";

export const Catalog = () => {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("recent");
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  const user = useTracker(() => Meteor.user());
  const auctions = useTracker(() => {
    Meteor.subscribe("allAuctions");
    return Auctions.find().fetch();
  });

  let filteredAuctions = auctions.filter((auction) => {
    const matchesSearch = auction.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || auction.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sortType === "low") filteredAuctions.sort((a, b) => a.price - b.price);
  if (sortType === "high") filteredAuctions.sort((a, b) => b.price - a.price);
  if (sortType === "recent") {
    filteredAuctions.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }

  const openAuction = (auctionId) => navigate(`/auction/${auctionId}`);

  const handleCardKeyDown = (event, auctionId) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAuction(auctionId);
    }
  };

  const toggleFavorite = (event, auctionId) => {
    event.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    Meteor.call("toggleFavorite", auctionId, (error) => {
      if (error) alert(error.reason || "No se pudo actualizar favoritos.");
    });
  };

  const toggleCart = (event, auctionId) => {
    event.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    Meteor.call("toggleCart", auctionId, (error) => {
      if (error) alert(error.reason || "No se pudo actualizar el carrito.");
    });
  };

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1>Catálogo de Subastas</h1>
        <input
          type="search"
          placeholder="Buscar subasta…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="search-input"
          aria-label="Buscar subastas"
        />
      </div>

      <div className="catalog-filters">
        <select value={sortType} onChange={(event) => setSortType(event.target.value)} aria-label="Ordenar subastas">
          <option value="recent">Más recientes</option>
          <option value="low">Menor precio</option>
          <option value="high">Mayor precio</option>
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar por categoría">
          <option value="all">Todas las categorías</option>
          <option value="Tecnología">Tecnología</option>
          <option value="Gaming">Gaming</option>
          <option value="Ropa">Ropa</option>
          <option value="Hogar">Hogar</option>
          <option value="Coleccionables">Coleccionables</option>
        </select>
      </div>

      <div className="auction-grid">
        {filteredAuctions.length === 0 ? (
          <p className="empty-catalog">No se encontraron subastas.</p>
        ) : (
          filteredAuctions.map((auction) => {
            const isFavorite = user?.profile?.favorites?.includes(auction._id);
            const isInCart = user?.profile?.cart?.includes(auction._id);
            const initialPrice = Number(auction.startingPrice ?? auction.price ?? 0);

            return (
              <article
                key={auction._id}
                className="auction-card auction-card-clickable"
                role="link"
                tabIndex={0}
                aria-label={`Ver detalles de ${auction.title}`}
                onClick={() => openAuction(auction._id)}
                onKeyDown={(event) => handleCardKeyDown(event, auction._id)}
              >
                <img
                  src={auction.image || "/images/laptop.jpg"}
                  alt={auction.title || "Subasta"}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/laptop.jpg";
                  }}
                />

                <div className="auction-info">
                  <div className={auction.status === "finalizada" ? "status-finished" : "status-active"}>
                    {auction.status || "activa"}
                  </div>
                  <h3>{auction.title}</h3>
                  <p>{auction.description || "Sin descripción."}</p>

                  <div className="auction-start-price">
                    Precio inicial: <span>${initialPrice.toLocaleString("es-MX")}</span>
                  </div>
                  <div className="auction-price">
                    <span>Precio actual:</span>
                    <strong>${Number(auction.price || 0).toLocaleString("es-MX")}</strong>
                  </div>
                  <div className="auction-countdown">
                    <Countdown endsAt={auction.endsAt} />
                  </div>

                  <div className="auction-actions">
                    <Link
                      to={`/auction/${auction._id}`}
                      className="btn-details"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Ver detalles
                    </Link>
                    <button
                      type="button"
                      onClick={(event) => toggleFavorite(event, auction._id)}
                      className="btn-favorite"
                      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                      {isFavorite ? "❤️" : "🤍"}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => toggleCart(event, auction._id)}
                      className="btn-cart"
                      aria-label={isInCart ? "Quitar del carrito" : "Agregar al carrito"}
                    >
                      {isInCart ? "🛒✓" : "🛒"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
