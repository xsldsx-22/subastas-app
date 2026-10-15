import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();
    setEnviando(true);

    Meteor.loginWithPassword(email.trim().toLowerCase(), password, (error) => {
      setEnviando(false);
      if (error) {
        alert(error.reason || "No se pudo iniciar sesión. Revisa tus credenciales.");
        return;
      }
      navigate("/", { replace: true });
    });
  };

  const handleResendVerification = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      alert("Escribe tu correo electrónico primero.");
      return;
    }

    setReenviando(true);
    Meteor.call("resendVerificationEmail", normalizedEmail, (error) => {
      setReenviando(false);
      if (error) {
        alert(error.reason || "No se pudo reenviar el correo. Inténtalo más tarde.");
        return;
      }
      alert("Si la cuenta existe y el correo aún no está verificado, recibirás un enlace. Revisa también la carpeta de spam.");
    });
  };

  return (
    <div className="login-page">
      <Link to="/" className="btn-regresar">← Regresar al inicio</Link>

      <div className="login-card">
        <div className="login-icono">🔨</div>
        <h2>Iniciar sesión</h2>
        <p>Ingresa tus credenciales para acceder a tu cuenta.</p>

        <form onSubmit={handleLogin}>
          <div className="login-campo">
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-campo">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button className="btn-login-submit" type="submit" disabled={enviando}>
            {enviando ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </form>

        <button
          className="btn-verificacion-reenvio"
          type="button"
          onClick={handleResendVerification}
          disabled={reenviando}
        >
          {reenviando ? "Enviando…" : "No recibí el correo de verificación"}
        </button>

        <div className="login-footer">
          <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
};
