import React from "react";
import { AuctionCard } from "../components/AuctionCard";

export const Home = () => {

  return (

    <>

      {/* HERO */}

      <section className="hero">

        <h1>
          Encuentra las mejores subastas
        </h1>

        <p>
          Compra y vende productos en tiempo real
        </p>

        <div className="buscador">

          <input
            type="text"
            placeholder="Buscar subastas..."
          />

          <button>
            Buscar
          </button>

        </div>

      </section>

      {/* SUBASTAS DESTACADAS */}

      <section className="productos">

        <h2>
          Subastas Destacadas
        </h2>

        <div className="grid-productos">

          <AuctionCard
            image="/images/audifonos.jpg"
            title="Audífonos Gamer"
            price="2500"
            hours={3}
          />

          <AuctionCard
            image="/images/laptop.jpg"
            title="Laptop Gamer"
            price="15000"
            hours={5}
          />

        </div>

      </section>

      {/* TERMINAN PRONTO */}

      <section className="terminan-pronto">

        <h2>
          Subastas que Terminan Pronto
        </h2>

        <div className="grid-productos">

          <AuctionCard
            image="/images/reloj.jpg"
            title="Reloj Inteligente"
            price="4500"
            hours={2}
          />

          <AuctionCard
            image="/images/tenis.jpg"
            title="Tenis Nike"
            price="3200"
            hours={1}
          />

        </div>

      </section>

    </>

  );

};