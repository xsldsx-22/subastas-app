import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Auctions } from "../imports/api/Auctions";

import "../imports/api/auctionMethods";
import "../imports/api/usersMethods";

const configuredAdminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

// Enlaces de verificación absolutos; en Render, ROOT_URL debe ser el dominio público.
Accounts.urls.verifyEmail = (token) =>
  Meteor.absoluteUrl(`verify-email/${token}`);

Accounts.emailTemplates.siteName = "SubastasPro";
if (process.env.MAIL_FROM) {
  Accounts.emailTemplates.from = process.env.MAIL_FROM;
}
Accounts.emailTemplates.verifyEmail.subject = () =>
  "Verifica tu correo electrónico en SubastasPro";
Accounts.emailTemplates.verifyEmail.text = (user, url) =>
  `Hola ${user.profile?.username || user.username || "Usuario"},\n\nConfirma tu correo electrónico abriendo este enlace:\n${url}\n\nSi no creaste esta cuenta, puedes ignorar este mensaje.`;

// Los usuarios se crean como user. Solo la cuenta cuyo correo coincide
// con ADMIN_EMAIL configurado exclusivamente en el servidor recibe el rol admin.
Accounts.onCreateUser((options, user) => {
  const actualEmail = user.emails?.[0]?.address?.trim().toLowerCase();
  const isConfiguredAdmin = Boolean(
    configuredAdminEmail && actualEmail === configuredAdminEmail
  );

  return {
    ...user,
    profile: {
      ...(options.profile || {}),
      username:
        user.username ||
        options.profile?.username ||
        "Usuario",
      role: isConfiguredAdmin ? "admin" : "user",
      favorites: Array.isArray(options.profile?.favorites)
        ? options.profile.favorites
        : [],
      cart: Array.isArray(options.profile?.cart) ? options.profile.cart : [],
    },
  };
});

// Promueve una cuenta existente al arrancar. Esto permite configurar un admin
// incluso si esa cuenta ya existía en la base de datos de producción.
Meteor.startup(async () => {
  if (!configuredAdminEmail) {
    console.warn("ADMIN_EMAIL no está configurado; no se promoverá ninguna cuenta.");
    return;
  }

  try {
    const admin = await Meteor.users.findOneAsync(
      { "emails.address": configuredAdminEmail },
      { fields: { _id: 1, "profile.role": 1 } }
    );

    if (!admin) {
      console.warn(
        "ADMIN_EMAIL todavía no coincide con ninguna cuenta. Registra esa cuenta y vuelve a desplegar/reiniciar el servicio."
      );
      return;
    }

    if (admin.profile?.role !== "admin") {
      await Meteor.users.updateAsync(admin._id, {
        $set: { "profile.role": "admin" },
      });
      console.info("Se asignó el rol admin a la cuenta configurada en ADMIN_EMAIL.");
    }
  } catch (error) {
    console.error("No se pudo inicializar la cuenta administradora:", error);
  }
});

// Publicación del catálogo de subastas.
Meteor.publish("allAuctions", function () {
  return Auctions.find(
    {},
    {
      fields: {
        title: 1,
        price: 1,
        startingPrice: 1,
        image: 1,
        description: 1,
        category: 1,
        condition: 1,
        createdAt: 1,
        endsAt: 1,
        status: 1,
        owner: 1,
        ownerName: 1,
        lastBidBy: 1,
        bids: 1,
      },
    }
  );
});

// Datos de la cuenta actualmente conectada; nunca publica los campos services/tokens.
Meteor.publish("myUserData", function () {
  if (!this.userId) return this.ready();

  return Meteor.users.find(
    { _id: this.userId },
    {
      fields: {
        username: 1,
        emails: 1,
        profile: 1,
      },
    }
  );
});

// Usuarios visibles solo para administradores.
Meteor.publish("adminUsers", async function () {
  if (!this.userId) return this.ready();

  const currentUser = await Meteor.users.findOneAsync(
    { _id: this.userId },
    { fields: { "profile.role": 1 } }
  );

  if (currentUser?.profile?.role !== "admin") return this.ready();

  return Meteor.users.find(
    {},
    {
      fields: {
        username: 1,
        emails: 1,
        profile: 1,
      },
    }
  );
});

// Subastas visibles en administración solo para administradores.
Meteor.publish("adminAuctions", async function () {
  if (!this.userId) return this.ready();

  const currentUser = await Meteor.users.findOneAsync(
    { _id: this.userId },
    { fields: { "profile.role": 1 } }
  );

  if (currentUser?.profile?.role !== "admin") return this.ready();

  return Auctions.find();
});

// Finaliza las subastas cuyo plazo terminó.
Meteor.startup(() => {
  Meteor.setInterval(async () => {
    try {
      await Auctions.updateAsync(
        {
          endsAt: { $lte: new Date() },
          status: { $ne: "finalizada" },
        },
        { $set: { status: "finalizada" } },
        { multi: true }
      );
    } catch (error) {
      console.error("Error al actualizar las subastas:", error);
    }
  }, 5000);
});
