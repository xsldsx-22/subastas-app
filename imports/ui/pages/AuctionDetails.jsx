import React from "react"; import { useParams } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Auctions } from "../../api/auctions";

export const AuctionDetails = () => {

  const { id } = useParams();

  const isLoading = useTracker(() => {

      const sub =
        Meteor.subscribe(
          "allAuctions"
        );
        Meteor.subscribe(
          "allUsers"
        );

      return !sub.ready();

    });

  const auction =
    useTracker(() => {

      return Auctions.findOne(id);

    });

  if (isLoading) {

    return <h1>Cargando...</h1>;

  }

  if (!auction) {

    return (
      <h1>
        Subasta no encontrada
      </h1>
    );

  }

  return (

    <section className="details-page">

      {/* IMAGEN */}

      <div className="details-image">

        <img
          src={auction.image || ""}
          alt={auction.title || ""}
        />

      </div>

      {/* INFO */}

      <div className="details-info">

        <h1>
          {auction.title || "Sin título"}
        </h1>

        <h2>
          ${auction.price || 0}
        </h2>

        <p>

          <strong>
            Categoría:
          </strong>

          {" "}

          {
            auction.category
            || "Sin categoría"
          }

        </p>

        <p>

          <strong>
            Estado:
          </strong>

          {" "}

          {
            auction.condition
            || "No especificado"
          }

        </p>

        <p>

          <strong>
            Descripción:
          </strong>

          {" "}

          {
            auction.description
            || "Sin descripción"
          }

        </p>
        {/* BOTÓN ELIMINAR */}

{(Meteor.userId() ===
  auction.owner ||

  Meteor.user()?.profile
  ?.role === "admin") && (

  <button

    onClick={() => {

      Meteor.call(

        "removeAuction",

        auction._id,

        () => {

          alert(
            "Subasta eliminada"
          );

          window.location.href =
            "/catalog";

        }

      );

    }}

  >

    🗑️ Eliminar

  </button>

)}
{/* HISTORIAL */}

<div
  className="bids-history"
>

  <h2>
    Historial de Pujas
  </h2>

  {

    auction.bids?.length > 0

    ? (

      auction.bids
      .slice()
      .reverse()
      .map((bid, index) => (

        <div
          key={index}
          className="bid-item"
        >

          <p>

            💰 ${bid.amount}

          </p>

          <p>

            Usuario:

            {" "}

            {
              Meteor.users.findOne(
                bid.userId
                      )?.emails?.[0]
                      ?.address || "Usuario"
            }

          </p>

        </div>

      ))

    )

    : (

      <p>
        Sin pujas aún
      </p>

    )

  }

</div>
      </div>

    </section>

  );

};