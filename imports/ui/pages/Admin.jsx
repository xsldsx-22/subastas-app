import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { useEffect } from "react";

export const Admin = () => {

  useEffect(() => {

  Meteor.subscribe("allUsers");

}, []);

  const users = useTracker(() =>
  Meteor.users.find().fetch()
);
  return (

    <section className="admin-container">

      <h1>
         Panel Administrador
      </h1>

      {/* ESTADÍSTICAS */}

      <div className="stats-grid">

        <div className="stat-card">
          <h2>Usuarios</h2>
          <p>{users.length}</p>
        </div>

        <div className="stat-card">
          <h2>Subastas</h2>
          <p>12</p>
        </div>

        <div className="stat-card">
          <h2>Pujas</h2>
          <p>53</p>
        </div>

      </div>

      {/* TABLA USUARIOS */}

      <div className="admin-table">

        <h2>
          Usuarios Registrados
        </h2>

        {users.map((user) => (

          <div
            key={user._id}
            className="user-row"
          >

            <p>
              {user.emails?.[0]?.address}
            </p>

          <button
  onClick={() => {

    Meteor.call(
      "removeUser",
      user._id,

      (error) => {

        if (error) {

          alert(error.reason);

        } else {

          alert("Usuario eliminado");

        }

      }
    );

  }}
>
  Eliminar
</button>
          </div>
      

        ))}

      </div>

    </section>

  );

};