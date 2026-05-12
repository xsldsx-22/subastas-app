import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        alert(error.reason);
      } else {
        navigate("/");
      }
    });
  };

  return (
    <div className="login-page">

      <Link to="/" className="btn-regresar">
        ← Regresar al inicio
      </Link>

      <div className="login-card">

        <div className="login-icono">🔨</div>

        <h2>Iniciar Sesión</h2>

        <p>
          Ingresa tus credenciales para acceder a tu cuenta
        </p>

        <form onSubmit={handleLogin}>

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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-login-submit" type="submit">
            Iniciar Sesión
          </button>

        </form>

        <div className="login-footer">
          <p>
            ¿No tienes cuenta?{" "}
            <Link to="/register">
              Regístrate aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};