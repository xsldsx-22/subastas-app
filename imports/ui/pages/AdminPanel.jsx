import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Auctions } from "../../api/Auctions";

export const AdminPanel = () => {
  const { users, auctions, ready } = useTracker(() => {
    const usersSub = Meteor.subscribe("adminUsers");
    const auctionsSub = Meteor.subscribe("adminAuctions");

    return {
      users: Meteor.users.find({}, { sort: { createdAt: -1 } }).fetch(),
      auctions: Auctions.find({}, { sort: { createdAt: -1 } }).fetch(),
      ready: usersSub.ready() && auctionsSub.ready(),
    };
  });

  const removeUser = (userId) => {
    if (!window.confirm("¿Eliminar este usuario y sus subastas?")) return;

    Meteor.call("deleteUser", userId, (error) => {
      if (error) alert(error.reason || "No se pudo eliminar el usuario.");
    });
  };

  const removeAuction = (auctionId) => {
    if (!window.confirm("¿Eliminar esta subasta?")) return;

    Meteor.call("removeAuction", auctionId, (error) => {
      if (error) alert(error.reason || "No se pudo eliminar la subasta.");
    });
  };

  if (!ready) return <section className="admin-container">Cargando…</section>;

  return (
    <section className="admin-container">
      <h1>Panel de administración</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>Usuarios</h2>
          <p>{users.length}</p>
        </div>

        <div className="stat-card">
          <h2>Subastas</h2>
          <p>{auctions.length}</p>
        </div>
      </div>

      <div className="admin-table">
        <h2>Usuarios registrados</h2>

        {users.map((user) => (
          <div className="user-row" key={user._id}>
            <span>
              {user.username ||
                user.profile?.username ||
                user.emails?.[0]?.address ||
                "Sin nombre"}
              {" · "}
              {user.role || "usuario"}
            </span>

            <button
              type="button"
              disabled={user._id === Meteor.userId()}
              onClick={() => removeUser(user._id)}
            >
              Eliminar usuario
            </button>
          </div>
        ))}
      </div>

      <div className="admin-table">
        <h2>Subastas publicadas</h2>

        {auctions.map((auction) => (
          <div className="user-row" key={auction._id}>
            <span>
              {auction.title} — ${auction.price}
            </span>

            <button
              type="button"
              onClick={() => removeAuction(auction._id)}
            >
              Eliminar publicación
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};