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

export const Cart = () => {

  // SUB
  const isLoading =
    useTracker(() => {

      const sub =
        Meteor.subscribe(
          "allAuctions"
        );

      return !sub.ready();

    });

  // USER
  const user =
    useTracker(() =>
      Meteor.user()
    );

  // IDS
  const cartIds =
    user?.profile?.cart
    || [];

  // PRODUCTOS
  const auctions =
    useTracker(() => {

      return Auctions.find({

        _id: {

          $in: cartIds

        }

      }).fetch();

    });

  // TOTAL
  const total =
    auctions.reduce(

      (acc, item) =>

        acc + item.price,

      0

    );

  // LOADING
  if (isLoading) {

    return <h1>Cargando...</h1>;

  }

  return (

    <section
      className="catalog-page"
    >

      <h1>
        Carrito
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

                <button

                  onClick={() => {

                    Meteor.call(

                      "toggleCart",

                      item._id

                    );

                  }}

                >

                  ❌ Quitar

                </button>

              </div>

            )
          )

        )

        : (

          <p>
            Tu carrito está vacío
          </p>

        )

      }

      <h2>

        Total:

        {" "}

        ${total}

      </h2>

    </section>

  );

};