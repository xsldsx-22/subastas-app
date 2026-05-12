import React, { useState } from "react";
import { Accounts } from "meteor/accounts-base";
import { Link, useNavigate } from "react-router-dom";

export const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    Accounts.createUser(
      {
        username,
        email,
        password,
      },
      (error) => {
        if (error) {
          alert(error.reason);
        } else {
          navigate("/");
        }
      }
    );
  };

  return (
    <div className="login-page">

      <Link to="/" className="btn-regresar">
        ← Regresar al inicio
      </Link>

      <div className="login-card">

        <div className="login-icono register-icon">
          🔨
        </div>

        <h2>Crear Cuenta</h2>

        <p>
          Regístrate para comenzar a pujar y crear subastas
        </p>

        <form onSubmit={handleRegister}>

          <div className="login-campo">
            <label>Nombre de Usuario</label>

            <input
              type="text"
              placeholder="Karen123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-campo">
            <label>Correo Electrónico</label>

            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-campo">
            <label>Contraseña</label>

            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-login-submit" type="submit">
            Registrarse
          </button>

        </form>

        <div className="login-footer">
          <p>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};