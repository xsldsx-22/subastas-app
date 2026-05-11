import React, { useState } from "react";
import { Accounts } from "meteor/accounts-base";

export const Register = () => {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const handleRegister = () => {

    Accounts.createUser({

  email,

  password,

  profile: {

    username,

    role: "user",

    favorites: [],

    cart: []

  }

},
(error) => {

  if (error) {

    toast.error(
      error.reason
    );

    return;

  }

  toast.success(
    "Cuenta creada"
  );

});

  };

  return (

    <section className="auth-container">

      <div className="auth-box">

        <h2>
          Crear Cuenta
        </h2>

        <input

          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) =>

    setUsername(
      e.target.value
    )

  }

/>

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

        <button onClick={handleRegister}>
          Registrarse
        </button>

      </div>

    </section>

  );

};