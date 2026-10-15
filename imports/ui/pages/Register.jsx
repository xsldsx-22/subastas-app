import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";

export const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleRegister = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    if (password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setEnviando(true);
    Meteor.call(
      "registerUser",
      { username: normalizedUsername, email: normalizedEmail, password },
      (error, result) => {
        setEnviando(false);

        if (error) {
          alert(error.reason || "No se pudo crear la cuenta.");
          return;
        }

        if (result?.emailSent) {
          alert("Cuenta creada. Te enviamos un correo de verificación. Abre el enlace antes de pujar o publicar subastas.");
        } else {
          alert("La cuenta se creó, pero no se pudo enviar el correo. El administrador debe configurar el servicio de correo en Render; después puedes usar el botón de reenvío en Iniciar sesión.");
        }
        navigate("/login", { replace: true });
      }
    );
  };

  return (
    <div className="login-page">
      <Link to="/" className="btn-regresar">← Regresar al inicio</Link>

      <div className="login-card">
        <div className="login-icono register-icon">🔨</div>
        <h2>Crear cuenta</h2>
        <p>Regístrate para comenzar a pujar y crear subastas.</p>

        <form onSubmit={handleRegister}>
          <div className="login-campo">
            <label htmlFor="register-username">Nombre de usuario</label>
            <input
              id="register-username"
              type="text"
              placeholder="Usuario123"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              minLength={3}
              maxLength={40}
              required
            />
          </div>

          <div className="login-campo">
            <label htmlFor="register-email">Correo electrónico</label>
            <input
              id="register-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-campo">
            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button className="btn-login-submit" type="submit" disabled={enviando}>
            {enviando ? "Creando cuenta…" : "Registrarse"}
          </button>
        </form>

        <div className="login-footer">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
};
