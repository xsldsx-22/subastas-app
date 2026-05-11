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

export const Favorites = () => {

  // USER
  const user =
    useTracker(() =>
      Meteor.user()
    );

  // IDS
  const favoriteIds =
    user?.profile?.favorites
    || [];

  // AUCTIONS
  const auctions =
    useTracker(() => {

      Meteor.subscribe(
        "allAuctions"
      );

      return Auctions.find({

        _id: {

          $in: favoriteIds

        }

      }).fetch();

    });

  return (

    <section
      className="catalog-page"
    >

      <h1>
        Favoritos
      </h1>

      {

        auctions.length > 0

        ? (

          auctions.map(
            (item) => (

              <div

                key={item._id}

                className="bid-item"

              >

                <h3>
                  {item.title}
                </h3>

                <p>
                  ${item.price}
                </p>

              </div>

            )
          )

        )

        : (

          <p>
            No tienes favoritos
          </p>

        )

      }

    </section>

  );

};