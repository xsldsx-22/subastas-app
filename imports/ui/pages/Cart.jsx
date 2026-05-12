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

  
  const isLoading =
    useTracker(() => {

      const sub =
        Meteor.subscribe(
          "allAuctions"
        );

      return !sub.ready();

    });

  const user =
    useTracker(() =>
      Meteor.user()
    );

  const cartIds =
    user?.profile?.cart
    || [];

  const auctions =
    useTracker(() => {

      return Auctions.find({

        _id: {

          $in: cartIds

        }

      }).fetch();

    });

  
  const total =
    auctions.reduce(

      (acc, item) =>

        acc + item.price,

      0

    );

  if (isLoading) {

    return <h1>Cargando...</h1>;

  }

 return (

  <section
    className="cart-page"
  >

    <h1>

      Mi Carrito

    </h1>

    {

      auctions.length > 0

      ? (

        <>

          <div
            className="
            cart-grid
            "
          >

            {

              auctions.map(
                (item) => (

                  <div

                    key={
                      item._id
                    }

                    className="
                    cart-card
                    "

                  >

                    <img

                      src={
                        item.image
                      }

                    />

                    <div>

                      <h3>

                        {
                          item.title
                        }

                      </h3>

                      <p>

                        $
                        {item.price}

                      </p>

                      <button

                        onClick={() => {

                          Meteor.call(

                            "toggleCart",

                            item._id

                          );

                        }}

                      >

                        Quitar

                      </button>

                    </div>

                  </div>

                )
              )

            }

          </div>

          <div
            className="
            cart-total
            "
          >

            <h2>

              Total:

              {" "}

              ${total}

            </h2>

            <button
  className="btn-checkout"
  onClick={() => {
    alert("Pago realizado correctamente 💳");
  }}
>
  Proceder con el pago
</button>

          </div>

        </>

      )

      : (

        <p>

          Tu carrito
          está vacío

        </p>

      )

    }

  </section>

);
}