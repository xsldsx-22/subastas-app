import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";

Accounts.config({ forbidClientAccountCreation: true });

Accounts.emailTemplates.siteName = "SubastasPro";

if (process.env.MAIL_FROM) {
  Accounts.emailTemplates.from = process.env.MAIL_FROM;
}

Accounts.emailTemplates.verifyEmail.subject = () =>
  "Verifica tu correo electrónico - SubastasPro";

Accounts.emailTemplates.verifyEmail.text = (user, url) =>
  "Hola " +
  (user.profile?.username || user.username || "usuario") +
  ",\n\nPara verificar tu correo electrónico y activar tu cuenta, abre este enlace:\n\n" +
  url +
  "\n\nSi no creaste esta cuenta, puedes ignorar este mensaje.";

Accounts.urls.verifyEmail = (token) =>
  Meteor.absoluteUrl("verify-email/" + token);

Accounts.validateLoginAttempt((attempt) => {
  if (!attempt.allowed) return false;

  const user = attempt.user;
  const verificationRequired =
    user?.profile?.emailVerificationRequired === true;
  const emailVerified =
    user?.emails?.some((address) => address.verified === true) || false;

  // Las cuentas anteriores a la activación de la verificación conservan el acceso.
  if (verificationRequired && !emailVerified) {
    throw new Meteor.Error(
      "email-not-verified",
      "Debes verificar tu correo electrónico antes de iniciar sesión."
    );
  }

  return true;
});

Meteor.methods({
  async registerUser(data) {
    check(data, {
      username: String,
      email: String,
      password: String,
    });

    const username = data.username.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    if (username.length < 3 || username.length > 40) {
      throw new Meteor.Error(
        "invalid-username",
        "El nombre de usuario debe tener entre 3 y 40 caracteres."
      );
    }

    if (password.length < 8) {
      throw new Meteor.Error(
        "weak-password",
        "La contraseña debe tener al menos 8 caracteres."
      );
    }

    if (!email || !email.includes("@")) {
      throw new Meteor.Error("invalid-email", "Escribe un correo válido.");
    }

    if (!process.env.MAIL_URL || !process.env.MAIL_FROM) {
      throw new Meteor.Error(
        "email-not-configured",
        "El envío de correos aún no está configurado en el servidor."
      );
    }

    let userId;

    try {
      userId = Accounts.createUser({
        username,
        email,
        password,
        profile: {
          username,
          emailVerificationRequired: true,
        },
      });
    } catch (error) {
      if (error instanceof Meteor.Error) throw error;

      throw new Meteor.Error(
        "registration-failed",
        "No se pudo crear la cuenta. Comprueba si el correo ya está registrado."
      );
    }

    try {
      await Accounts.sendVerificationEmail(userId);
    } catch (error) {
      console.error("No se pudo enviar el correo de verificación:", error);
      throw new Meteor.Error(
        "verification-email-failed",
        "La cuenta se creó, pero no se pudo enviar el correo de verificación. Revisa la configuración SMTP del servidor."
      );
    }

    return true;
  },
});
