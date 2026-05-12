import React from "react";

import {
  useTracker
} from "meteor/react-meteor-data";

import { Meteor } from "meteor/meteor";

export const AdminPanel = () => {

  const users = useTracker(() => {

    Meteor.subscribe("allUsers");

    return Meteor.users
      .find()
      .fetch();

  });

  const handleDelete = (userId) => {

    const confirmDelete = window.confirm(
      "¿Eliminar usuario?"
    );

    if (!confirmDelete) return;

    Meteor.call(
      "deleteUser",
      userId,
      (error) => {

        if (error) {
          alert(error.reason);
        } else {
          alert("Usuario eliminado");
        }

      }
    );

  };

  return (

    <section className="catalog-page">

      <h1>
        Panel Admin
      </h1>

      {

        users.map((user) => (

          <div
            key={user._id}
            className="bid-item"
          >

            <p>
              <strong>
                Usuario:
              </strong>

              {" "}

              {
                user.username ||
                user.profile?.username ||
                "Sin nombre"
              }
            </p>

            <p>

              <strong>
                Rol:
              </strong>

              {" "}

              {
                user.profile?.role ||
                "usuario"
              }

            </p>

            <p>

              <strong>
                Correo:
              </strong>

              {" "}

              {
                user.emails?.[0]?.address
              }

            </p>

            <button
              onClick={() =>
                handleDelete(user._id)
              }
            >
              Eliminar usuario
            </button>

          </div>

        ))

      }

    </section>

  );

};