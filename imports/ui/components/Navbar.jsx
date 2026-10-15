import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Meteor } from "meteor/meteor";

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  const usuario = Meteor.user();
  const estaLogueado = Boolean(usuario);
  const esAdmin = usuario?.profile?.role === "admin";

  const cerrarMenu = () => setMenuAbierto(false);

  const cerrarSesion = () => {
    cerrarMenu();

    Meteor.logout((error) => {
      if (error) {
        alert(error.reason || "No se pudo cerrar la sesión.");
      }
    });
  };

  const enlaces = [
    { texto: "Inicio", ruta: "/" },
    { texto: "Catálogo", ruta: "/catalog" },

    ...(estaLogueado
      ? [
          { texto: "Favoritos", ruta: "/favorites" },
          { texto: "Mi carrito", ruta: "/cart" },
          { texto: "Crear subasta", ruta: "/create-auction" },

          ...(esAdmin
            ? [{ texto: "Administración", ruta: "/admin" }]
            : []),
        ]
      : []),
  ];

  const enlaceActivo = (ruta) =>
    location.pathname === ruta ? "enlace-activo" : "";

  return (
    <header className="navbar-principal">
      {/* LOGO */}
      <Link to="/" className="navbar-logo" onClick={cerrarMenu}>
        Subastas<span>Pro</span>
      </Link>

      {/* NAVEGACIÓN HORIZONTAL PARA COMPUTADORA */}
      <nav className="navbar-desktop" aria-label="Navegación principal">
        {enlaces.map((enlace) => (
          <Link
            key={enlace.ruta}
            to={enlace.ruta}
            className={enlaceActivo(enlace.ruta)}
          >
            {enlace.texto}
          </Link>
        ))}
      </nav>

      {/* BOTONES DE LA PARTE SUPERIOR DERECHA */}
      <div className="navbar-acciones">
        {estaLogueado ? (
          <>
            <Link
              to="/profile"
              className="navbar-perfil"
              onClick={cerrarMenu}
            >
              Mi perfil
            </Link>

            <button
              type="button"
              className="navbar-login navbar-cerrar-sesion"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="navbar-login"
            onClick={cerrarMenu}
          >
            Iniciar sesión
          </Link>
        )}

        <button
          type="button"
          className="menu-hamburguesa"
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

          <nav id="menu-principal" className="menu-desplegable">
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
                className={enlaceActivo(enlace.ruta)}
                onClick={cerrarMenu}
              >
                {enlace.texto}
              </Link>
            ))}

            {estaLogueado ? (
              <>
                <Link to="/profile" onClick={cerrarMenu}>
                  Mi perfil
                </Link>

                <button
                  type="button"
                  className="menu-cerrar-sesion"
                  onClick={cerrarSesion}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
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
