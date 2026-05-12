import React
from "react";

export const Footer = () => {

  return (

    <footer
      className="footer"
    >

      <div
        className="
        footer-content
        "
      >

        {/* BRAND */}

        <div>

          <h2>
            Subastas Pro
          </h2>

          <p>

            Plataforma de
            subastas en
            tiempo real.

          </p>

        </div>

        {/* LINKS */}

        <div>

          <h3>
            Navegación
          </h3>

          <p>
            Catálogo
          </p>

          <p>
            Perfil
          </p>

          <p>
            Favoritos
          </p>

        </div>

        {/* CONTACT */}

        <div>

          <h3>
            Contacto
          </h3>

          <p>
            soporte.subastasapp@gmail.com
          </p>

          <p>
            México
          </p>

        </div>

      </div>

      <p
        className="
        footer-copy
        "
      >

        © 2026 Subastas Pro.
        Todos los derechos
        reservados.

      </p>

    </footer>

  );

};