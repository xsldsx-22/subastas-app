import React
from "react";

import {
  useTracker
}
from "meteor/react-meteor-data";

import { Meteor }
from "meteor/meteor";

import {
  Auctions
}
from "../../api/auctions";

export const Profile = () => {

  // USER
  const user =
    useTracker(() => {

      Meteor.subscribe(
        "allUsers"
      );

      Meteor.subscribe(
        "allAuctions"
      );

      return Meteor.user();

    });

  // MIS SUBASTAS
  const myAuctions =
    useTracker(() => {

      return Auctions.find({

        owner:
          user?._id

      }).fetch();

    });

  // FAVORITOS
  const favorites =
    user?.profile
    ?.favorites
    || [];

  // CARRITO
  const cart =
    user?.profile
    ?.cart
    || [];

  if (!user) {

    return <h1>
      Inicia sesión
    </h1>;

  }

  return (

    <section
      className="profile-page"
    >

      {/* TOP */}

      <div
        className="
        profile-header
        "
      >

        <div
          className="
          profile-avatar
          "
        >

          {

            user.profile
            ?.username?.[0]

          }

        </div>

        <div>

          <h1>

            {

              user.profile
              ?.username

            }

          </h1>

          <p>

            {

              user.emails?.[0]
              ?.address

            }

          </p>

          <p>

            Rol:

            {" "}

            {

              user.profile
              ?.role

            }

          </p>

        </div>

      </div>

      {/* STATS */}

      <div
        className="
        profile-stats
        "
      >

        <div
          className="
          stat-card
          "
        >

          <h2>

            {
              myAuctions.length
            }

          </h2>

          <p>
            Subastas
          </p>

        </div>

        <div
          className="
          stat-card
          "
        >

          <h2>

            {
              favorites.length
            }

          </h2>

          <p>
            Favoritos
          </p>

        </div>

        <div
          className="
          stat-card
          "
        >

          <h2>

            {
              cart.length
            }

          </h2>

          <p>
            Carrito
          </p>

        </div>

      </div>

      {/* MIS SUBASTAS */}

      <div
        className="
        my-auctions
        "
      >

        <h2>

          Mis Subastas

        </h2>

        {

          myAuctions.length > 0

          ? (

            myAuctions.map(
              (auction) => (

                <div

                  key={
                    auction._id
                  }

                  className="
                  bid-item
                  "

                >

                  <h3>

                    {
                      auction.title
                    }

                  </h3>

                  <p>

                    $
                    {auction.price}

                  </p>

                </div>

              )
            )

          )

          : (

            <p>

              No tienes
              subastas

            </p>

          )

        }

      </div>

    </section>

  );

};