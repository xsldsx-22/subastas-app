import React, { useEffect, useState } from "react";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { Link, useParams } from "react-router-dom";

export const VerifyEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Verificando tu correo electrónico…");
  const [correcto, setCorrecto] = useState(false);

  useEffect(() => {
    let activo = true;

    Accounts.verifyEmail(token, (error) => {
      if (!activo) return;

      if (error) {
        setCorrecto(false);
        setMessage(
          error.reason ||
            "El enlace de verificación no es válido o ya venció. Solicita un nuevo enlace desde Iniciar sesión."
        );
        return;
      }

      // Si este correo coincide con ADMIN_EMAIL y ya quedó verificado,
      // el servidor puede asignar de forma segura el rol administrador.
      Meteor.call("promoteConfiguredAdmin", (roleError, promoted) => {
        if (!activo) return;

        setCorrecto(true);
        if (roleError) {
          console.error("No se pudo comprobar el rol administrador:", roleError);
          setMessage("¡Correo verificado! Ya puedes iniciar sesión.");
        } else if (promoted) {
          setMessage("¡Correo verificado! Tu cuenta administradora ya está habilitada.");
        } else {
          setMessage("¡Correo verificado! Ya puedes iniciar sesión.");
        }
      });
    });

    return () => {
      activo = false;
    };
  }, [token]);

  return (
    <section className="login-page">
      <div className="login-card">
        <div className="login-icono">{correcto ? "✓" : "✉️"}</div>
        <h2>Verificación de correo</h2>
        <p role="status">{message}</p>
        <Link className="btn-login-submit verify-email-link" to="/login">
          Ir a iniciar sesión
        </Link>
      </div>
    </section>
  );
};
