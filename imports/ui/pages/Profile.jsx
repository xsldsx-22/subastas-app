import React from "react";
import { Link } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Auctions } from "../../api/Auctions";

const money = (value) =>
  Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const dateText = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-MX");
};

export const Profile = () => {
  const { user, auctions, ready } = useTracker(() => {
    const userSub = Meteor.subscribe("myUserData");
    const auctionSub = Meteor.subscribe("allAuctions");
    return {
      user: Meteor.user(),
      auctions: Auctions.find().fetch(),
      ready: userSub.ready() && auctionSub.ready(),
    };
  });

  if (!Meteor.userId()) {
    return (
      <section className="profile-page profile-empty">
        <h1>Inicia sesión para ver tu perfil</h1>
        <Link className="btn-details" to="/login">Iniciar sesión</Link>
      </section>
    );
  }

  if (!ready || !user) {
    return <section className="profile-page"><h1>Cargando tu perfil…</h1></section>;
  }

  const userId = user._id;
  const auctionsBidOn = auctions
    .filter((auction) => auction.bids?.some((bid) => bid.userId === userId))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const wonAuctions = auctions
    .filter((auction) => auction.status === "finalizada" && auction.lastBidBy === userId)
    .sort((a, b) => new Date(b.endsAt || 0) - new Date(a.endsAt || 0));

  const verified = user.emails?.some((entry) => entry.verified) || false;

  const AuctionRow = ({ auction, won = false }) => {
    const myBids = (auction.bids || []).filter((bid) => bid.userId === userId);
    const myHighestBid = myBids.reduce((highest, bid) => Math.max(highest, Number(bid.amount || 0)), 0);

    return (
      <article className="profile-auction-row" key={auction._id}>
        <img
          src={auction.image || "/images/laptop.jpg"}
          alt={auction.title || "Subasta"}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/images/laptop.jpg";
          }}
        />
        <div className="profile-auction-info">
          <h3>{auction.title}</h3>
          <p>Precio actual/final: <strong>${money(auction.price)}</strong></p>
          {!won && <p>Tu puja más alta: <strong>${money(myHighestBid)}</strong></p>}
          <p>Estado: <strong>{auction.status || "activa"}</strong></p>
          <p>Fecha de cierre: {dateText(auction.endsAt)}</p>
          {won && <span className="profile-won-label">Subasta ganada</span>}
          <Link className="btn-details" to={`/auction/${auction._id}`}>Ver detalles</Link>
        </div>
      </article>
    );
  };

  return (
    <section className="profile-page profile-page-new">
      <header className="profile-header">
        <div className="profile-avatar">
          {(user.profile?.username || user.username || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <h1>{user.profile?.username || user.username || "Mi perfil"}</h1>
          <p>{user.emails?.[0]?.address || "Correo no disponible"}</p>
          <p className={verified ? "profile-email-verified" : "profile-email-pending"}>
            {verified ? "Correo verificado" : "Correo pendiente de verificar"}
          </p>
        </div>
      </header>

      <section className="profile-section-new">
        <div className="profile-section-heading">
          <h2>Productos por los que has pujado</h2>
          <span>{auctionsBidOn.length}</span>
        </div>
        {auctionsBidOn.length ? (
          <div className="profile-auction-list">
            {auctionsBidOn.map((auction) => <AuctionRow key={auction._id} auction={auction} />)}
          </div>
        ) : (
          <p className="profile-empty-message">Todavía no has pujado en ninguna subasta.</p>
        )}
      </section>

      <section className="profile-section-new">
        <div className="profile-section-heading">
          <h2>Subastas ganadas</h2>
          <span>{wonAuctions.length}</span>
        </div>
        {wonAuctions.length ? (
          <div className="profile-auction-list">
            {wonAuctions.map((auction) => <AuctionRow key={auction._id} auction={auction} won />)}
          </div>
        ) : (
          <p className="profile-empty-message">Aquí aparecerán las subastas que ganes cuando finalicen.</p>
        )}
      </section>
    </section>
  );
};
