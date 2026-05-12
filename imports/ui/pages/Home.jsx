import React from "react";
import { Link } from "react-router-dom";
import {  useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Auctions } from "../../api/Auctions";
import {  AuctionCard } from "../components/AuctionCard"

export const Home = () => {

  const featured = useTracker(() => {

    Meteor.subscribe(
      "allAuctions"
    );

    return Auctions.find(

      {},

      {

        sort: {

          createdAt: -1

        },

        limit: 3

      }

    ).fetch();

  });

  return (

    <section
      className="home"
    >

      {/* HERO */}

      <div
        className="hero"
      >

        <div
          className="hero-text"
        >

          <h1>

            Compra y vende
            en subastas
            en tiempo real

          </h1>

          <p>

            Descubre productos,
            puja en vivo y gana
            las mejores ofertas.

          </p>

          <Link
            to="/catalog"
          >

            <button>

              Explorar catálogo

            </button>

          </Link>

        </div>

        {/* HERO IMAGE */}

        <div
          className="hero-image"
        >

          <img

            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30"

            alt="hero"

          />

        </div>

      </div>
{/* FEATURED */}

<div
  className="featured"
>

  <div
    className="featured-top"
  >

    <h2>

      Subastas destacadas

    </h2>

    <Link to="/catalog">

      Ver todas

    </Link>

  </div>

  <div
    className="grid-productos"
  >

    {

      featured.map(
        (auction) => (

          <AuctionCard

            key={
              auction._id
            }

            _id={
              auction._id
            }

            image={
              auction.image
            }

            title={
              auction.title
            }

            price={
              auction.price
            }

            endsAt={
              auction.endsAt
            }

            lastBidBy={
              auction.lastBidBy
            }

          />

        )
      )

    }

  </div>

</div>
    </section>

  );

};