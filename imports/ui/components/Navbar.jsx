import React from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";

export const Navbar = ({ user }) => {

  const logout = () => {
    Meteor.logout();
  };

  return (
    <header className="navbar">

      <Link to="/" className="navbar-logo">
        🔨 SubastasPro
      </Link>

      <nav className="navbar-links">
        <Link to="/">Inicio</Link>
        <Link to="/catalog">Catálogo</Link>

        {user && (
          <>
            <Link to="/create-auction"> Crear Subasta </Link>
            <Link to="/favorites">Favoritos</Link>
            <Link to="/cart">Carrito</Link>
          </>
        )}

        {user?.profile?.role === "admin" && (
          <Link to="/admin">
            Admin
          </Link>
        )}
      </nav>

      <div className="navbar-actions">

        {user ? (
          <>
            <Link to="/profile" className="navbar-user">
              👤 {user.username}
            </Link>

            <button
              className="btn-navbar logout"
              onClick={logout}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-navbar secondary">
              Iniciar sesión
            </Link>

            <Link to="/register" className="btn-navbar primary">
              Registrarse
            </Link>
          </>
        )}

      </div>

    </header>
  );
};