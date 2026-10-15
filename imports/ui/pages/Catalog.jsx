import React, { useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Auctions } from "../../api/Auctions";
import { Countdown } from "../components/Countdown";

const money = (value) => Number(value ?? 0).toLocaleString("es-MX");

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

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch = auction.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || auction.category === category;
    return matchesSearch && matchesCategory;
  });

  if (sortType === "low") filteredAuctions.sort((a, b) => a.price - b.price);
  if (sortType === "high") filteredAuctions.sort((a, b) => b.price - a.price);
  if (sortType === "recent") {
    filteredAuctions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  const openAuction = (id) => navigate("/auction/" + id);
  const stopCardClick = (event) => event.stopPropagation();

  const toggleItem = (event, method, auctionId) => {
    event.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    Meteor.call(method, auctionId, (error) => {
      if (error) alert(error.reason || "No se pudo actualizar el producto.");
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
            const startingPrice = Number(auction.startingPrice ?? auction.price ?? 0);
            const ended = auction.status === "finalizada" || (auction.endsAt && new Date(auction.endsAt).getTime() <= Date.now());

            return (
              <article
                key={auction._id}
                className="auction-card auction-card-clickable"
                role="link"
                tabIndex={0}
                aria-label={"Ver detalles de " + auction.title}
                onClick={() => openAuction(auction._id)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openAuction(auction._id);
                  }
                }}
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
                  <div className={ended ? "status-finished" : "status-active"}>{ended ? "finalizada" : "activa"}</div>
                  <h3>{auction.title}</h3>
                  <p>{auction.description || "Sin descripción."}</p>
                  <div className="auction-start-price">Precio al publicarse: <span>${money(startingPrice)}</span></div>
                  <div className="auction-price"><span>Precio actual:</span> <strong>${money(auction.price)}</strong></div>
                  <div className="auction-countdown">{ended ? "Subasta finalizada" : <Countdown endsAt={auction.endsAt} />}</div>
                  <div className="auction-actions">
                    <button type="button" className="btn-details" onClick={(event) => { stopCardClick(event); openAuction(auction._id); }}>Ver detalles</button>
                    <button type="button" className="btn-favorite" aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"} onClick={(event) => toggleItem(event, "toggleFavorite", auction._id)}>{isFavorite ? "❤️" : "🤍"}</button>
                    <button type="button" className="btn-cart" aria-label={isInCart ? "Quitar del carrito" : "Agregar al carrito"} onClick={(event) => toggleItem(event, "toggleCart", auction._id)}>{isInCart ? "🛒✓" : "🛒"}</button>
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
