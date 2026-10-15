import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";

export default function Navbar({ user }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const usuario = user;
  const estaLogueado = Boolean(usuario);
  const esAdmin = usuario?.role === "admin";

  const cerrarMenu = () => setMenuAbierto(false);

  const enlaces = [
    { texto: "Inicio", ruta: "/" },
    { texto: "Subastas", ruta: "/catalog" },
    ...(estaLogueado
      ? [
          { texto: "Mi perfil", ruta: "/profile" },
          { texto: "Favoritos", ruta: "/favorites" },
          { texto: "Crear subasta", ruta: "/create-auction" },
          ...(esAdmin ? [{ texto: "Administración", ruta: "/admin" }] : []),
        ]
      : []),
  ];

  const handleLogout = () => {
    if (cerrandoSesion) return;

    cerrarMenu();
    setCerrandoSesion(true);

    Meteor.logout((error) => {
      setCerrandoSesion(false);

      if (error) {
        alert(error.reason || "No se pudo cerrar la sesión. Inténtalo de nuevo.");
        return;
      }

      navigate("/login", { replace: true });
    });
  };

  return (
    <header className="navbar-principal">
      <Link to="/" className="navbar-logo" onClick={cerrarMenu}>
        Subastas<span>Pro</span>
      </Link>

      <nav className="navbar-links-horizontal" aria-label="Navegación principal">
        {enlaces.map((enlace) => (
          <Link
            key={enlace.ruta}
            to={enlace.ruta}
            className={location.pathname === enlace.ruta ? "enlace-activo" : ""}
          >
            {enlace.texto}
          </Link>
        ))}
      </nav>

      <div className="navbar-acciones">
        {estaLogueado ? (
          <>
            <Link
              to="/cart"
              className="navbar-carrito"
              aria-label="Abrir carrito"
              onClick={cerrarMenu}
            >
              <span aria-hidden="true">🛒</span>
              <span>Carrito</span>
            </Link>
            <button
              type="button"
              className="navbar-sesion-cerrar"
              onClick={handleLogout}
              disabled={cerrandoSesion}
            >
              {cerrandoSesion ? "Cerrando…" : "Cerrar sesión"}
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-login" onClick={cerrarMenu}>
            Iniciar sesión
          </Link>
        )}

        <button
          type="button"
          className={menuAbierto ? "menu-hamburguesa activo" : "menu-hamburguesa"}
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuAbierto && (
        <>
          <button
            type="button"
            className="menu-fondo"
            aria-label="Cerrar menú"
            onClick={cerrarMenu}
          />

          <nav id="menu-principal" className="menu-desplegable" aria-label="Menú">
            <div className="menu-encabezado">
              <span>Menú</span>
              <button
                type="button"
                onClick={cerrarMenu}
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>

            {enlaces.map((enlace) => (
              <Link
                key={enlace.ruta}
                to={enlace.ruta}
                className={location.pathname === enlace.ruta ? "enlace-activo" : ""}
                onClick={cerrarMenu}
              >
                {enlace.texto}
              </Link>
            ))}

            {!estaLogueado && (
              <Link to="/register" onClick={cerrarMenu}>
                Crear cuenta
              </Link>
            )}
          </nav>
        </>
      )}
    </header>
  );
}
