import React, { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Auctions } from "../../api/auctions";
import { AuctionCard } from "../components/AuctionCard";

export const Profile = () => {

  useEffect(() => {

    Meteor.subscribe(
      "allAuctions"
    );

  }, []);

  const user =
    Meteor.user();

  const myAuctions =
    useTracker(() =>

      Auctions.find({

        owner:
          user?._id

      }).fetch()

    );

 const favorites =
    useTracker(() => {

      const favIds =
        user?.profile?.favorites
        || [];

      return Auctions.find({

        _id: {
          $in: favIds
        }

      }).fetch();

    });

  return (

    <section className="profile-page">

      {/* INFO */}

      <div className="profile-box">

        <h1>
          Mi Perfil
        </h1>

        <p>

          Correo:

          {" "}

          {
            user?.emails?.[0]
            ?.address
          }

        </p>

        <p>

          Rol:

          {" "}

          {
            user?.profile?.role || "user"
          }

        </p>

      </div>

      {/* MIS SUBASTAS */}

      <section>

        <h2>
          Mis Subastas
        </h2>

        <div className="grid-productos">

          {myAuctions.map(
            (auction) => (

              <AuctionCard

                key={auction._id}
                _id={auction._id}
                image={auction.image}
                title={auction.title}
                price={auction.price}
                hours={auction.hours}
                endsAt={
                  auction.endsAt
                }

                lastBidBy={
                  auction.lastBidBy
                }

              />

            )
          )}

        </div>

      </section>

      {/* FAVORITOS */}

      <section>

        <h2>
          Favoritos
        </h2>

        <div className="grid-productos">

          {favorites.map(
            (auction) => (

              <AuctionCard

                key={auction._id}
                _id={auction._id}
                image={auction.image}
                title={auction.title}
                price={auction.price}
                hours={auction.hours}
                endsAt={
                  auction.endsAt
                }

                lastBidBy={
                  auction.lastBidBy
                }

              />

            )
          )}

        </div>

      </section>

    </section>

  );

};