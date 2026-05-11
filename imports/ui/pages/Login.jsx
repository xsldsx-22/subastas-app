import React, { useState } from "react";

import { Meteor } from "meteor/meteor";

export const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {

    Meteor.loginWithPassword(
      email,
      password,
      (error) => {

        if (error) {
          alert("Datos incorrectos");
        } else {
          alert("Bienvenido");
        }

      }
    );

  };

  return (

    <section className="auth-container">

      <div className="auth-box">

        <h2>
          Iniciar Sesión
        </h2>

        <input
          type="email"
          placeholder="Correo"

          value={email}

          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Contraseña"

          value={password}

          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button onClick={handleLogin}>
          Entrar
        </button>

      </div>

    </section>

  );

};