import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";

const normalizeEmail = (email) => email.trim().toLowerCase();

Meteor.methods({
  async registerUser(data) {
    check(data, {
      username: String,
      email: String,
      password: String,
    });

    const username = data.username.trim();
    const email = normalizeEmail(data.email);
    const password = data.password;

    if (username.length < 3 || username.length > 40) {
      throw new Meteor.Error(
        "invalid-username",
        "El usuario debe tener entre 3 y 40 caracteres."
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Meteor.Error("invalid-email", "Escribe un correo válido.");
    }

    if (password.length < 8) {
      throw new Meteor.Error(
        "weak-password",
        "La contraseña debe tener al menos 8 caracteres."
      );
    }

    const existingUser = await Meteor.users.findOneAsync({
      $or: [{ username }, { "emails.address": email }],
    }, { fields: { _id: 1 } });

    if (existingUser) {
      throw new Meteor.Error(
        "already-exists",
        "Ya existe una cuenta con ese usuario o correo."
      );
    }

    let userId;

    try {
      userId = Accounts.createUser({ username, email, password });
    } catch (error) {
      console.error("Error creando cuenta:", error);
      throw new Meteor.Error(
        "register-failed",
        error?.reason || "No se pudo crear la cuenta. Revisa los datos."
      );
    }

    let emailSent = false;
    try {
      await Accounts.sendVerificationEmail(userId, email);
      emailSent = true;
    } catch (error) {
      // La cuenta ya quedó creada; el usuario puede volver a solicitar el correo.
      console.error("No se pudo enviar el correo de verificación:", error);
    }

    return { emailSent };
  },

  async resendVerificationEmail(emailInput) {
    check(emailInput, String);
    const email = normalizeEmail(emailInput);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Meteor.Error("invalid-email", "Escribe un correo válido.");
    }

    const user = await Meteor.users.findOneAsync(
      { "emails.address": email },
      { fields: { _id: 1, emails: 1 } }
    );

    // Responder igual si el correo no existe evita revelar cuentas registradas.
    if (!user) return true;

    const emailRecord = user.emails?.find(
      (entry) => entry.address?.toLowerCase() === email
    );
    if (!emailRecord || emailRecord.verified) return true;

    try {
      await Accounts.sendVerificationEmail(user._id, email);
    } catch (error) {
      console.error("No se pudo reenviar el correo de verificación:", error);
      throw new Meteor.Error(
        "email-send-failed",
        "No se pudo enviar el correo. Revisa la configuración de correo del servidor."
      );
    }

    return true;
  },

  async deleteUser(userId) {
    check(userId, String);

    if (!this.userId) {
      throw new Meteor.Error("no-auth", "Debes iniciar sesión.");
    }

    if (this.userId === userId) {
      throw new Meteor.Error(
        "self-delete",
        "No puedes eliminar tu propia cuenta."
      );
    }

    const currentUser = await Meteor.users.findOneAsync(
      { _id: this.userId },
      { fields: { "profile.role": 1 } }
    );

    if (currentUser?.profile?.role !== "admin") {
      throw new Meteor.Error(
        "not-authorized",
        "Solo un administrador puede eliminar usuarios."
      );
    }

    const targetUser = await Meteor.users.findOneAsync(userId);
    if (!targetUser) {
      throw new Meteor.Error("not-found", "Usuario no encontrado.");
    }

    const { Auctions } = await import("./Auctions");
    await Auctions.removeAsync({ owner: userId });
    await Meteor.users.removeAsync(userId);

    return true;
  },
});
