import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import {  Link } from "react-router-dom";
import {  Countdown }from "./Countdown";
import { useTracker } from "meteor/react-meteor-data";

export const AuctionCard = ({

  _id,
  image,
  title,
  price,
  hours,
  endsAt,
  lastBidBy

}) => {

  const [bid, setBid] =
    useState("");

 
  const ended =
    new Date() >
    new Date(endsAt);

 
  const winner =
    Meteor.users.findOne(
      lastBidBy
    );

  const currentUser =
  useTracker(() =>
    Meteor.user()
  );

const favorites =
  currentUser?.profile?.favorites || [];

  const isFavorite = favorites.includes(_id);

  const handleBid = (e) => {

    e.preventDefault();

    Meteor.call(

      "placeBid",

      _id,

      Number(bid),

      (error) => {

        if (error) {

          alert(error.reason);

        } else {

          alert(
            "Puja realizada"
          );

          setBid("");

        }

      }

    );

  };

  return (

    <Link
      to={"/auction/" + _id}
      className="card-link"
    >

      <div className="card">

        <img src={image} />
        <div
  className={
    ended
    ? "badge ended"
    : "badge active"
  }
>

  {
    ended
    ? "FINALIZADA"
    : "ACTIVA"
  }

</div>

        {/* TOP */}

        <div className="card-top">

          <h3>
            {title}
          </h3>

          <button

            className="favorite-btn"

            onClick={(e) => {

              e.preventDefault();

              Meteor.call(
                "toggleFavorite",
                _id
              );

            }}

          >

            {
              isFavorite
              ? "❤️"
              : "🤍"
            }

          </button>
          <button

           onClick={(e) => {

            e.preventDefault();

          Meteor.call( "toggleCart", _id

    );

  }}

>

  🛒 Carrito

</button>

        </div>

        {/* PRECIO */}

        <p>
          ${price}
        </p>

        {/* TERMINADA */}

        {ended ? (

          <div>

            <h3>
              🏆 Subasta Finalizada
            </h3>

            <p>

              Ganador:

              {" "}

              {
                winner?.emails?.[0]?.address
                || "Sin ganador"
              }

            </p>

          </div>

        ) : (

          <Countdown
            hours={hours}
          />

        )}

        {/* INPUT */}

        <input

          type="number"

          placeholder="Tu puja"

          value={bid}

          disabled={ended}

          onClick={(e) =>
            e.preventDefault()
          }

          onChange={(e) =>
            setBid(e.target.value)
          }

        />

        {/* BOTÓN */}

        <button

          onClick={handleBid}

          disabled={ended}

        >
          Pujar
        </button>

      </div>

    </Link>

  );

};