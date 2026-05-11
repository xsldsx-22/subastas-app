import React
from "react";

import {
  Link
}
from "react-router-dom";

import { Meteor }
from "meteor/meteor";

import {
  useTracker
}
from "meteor/react-meteor-data";

export const Navbar = () => {
  
  const toggleDarkMode =
  () => {

    document.body
    .classList.toggle(
      "dark-mode"
    );

  };

  // USER
  const user =
    useTracker(() => {

      Meteor.subscribe(
        "allUsers"
      );

      return Meteor.user();

    });

  // LOGOUT
  const handleLogout = () => {

    Meteor.logout();

  };

  return (

    <nav className="navbar">

      {/* LOGO */}

      <Link to="/">

        <h2>
          Subastas Pro
        </h2>

      </Link>

      {/* LINKS */}

      <div
        className="nav-links"
      >

        {/* CATÁLOGO */}

        <Link to="/catalog">

          Catálogo

        </Link>
        {user && (

  <Link to="/cart">

    🛒

    {" "}

    {

      user?.profile?.cart
      ?.length || 0

    }

  </Link>

)}

        {/* CREAR */}

        {user && (

          <Link
            to="/create-auction"
          >

            Crear

          </Link>

        )}

        {/* PERFIL */}

        {user && (

          <Link to="/profile">

            Perfil

          </Link>

        )}

        {/* ADMIN */}

        {user?.profile?.role ===
          "admin" && (

          <Link to="/admin">

            Panel Admin

          </Link>

        )}

        {/* LOGIN / LOGOUT */}

        {!user ? (

          <>

            <Link to="/login">

              Login

            </Link>

            <Link to="/register">

              Registro

            </Link>

          </>

        ) : (

          <>

            <span>

              {
                user.emails?.[0]
                ?.address
              }

            </span>

            <button
              onClick={
                handleLogout
              }
            >

              Cerrar sesión

            </button>

          </>

        )}

      </div>

    </nav>

  );

};