import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Auctions } from "./Auctions";

async function getCurrentUser(userId) {
  if (!userId) {
    throw new Meteor.Error("no-auth", "Debes iniciar sesión.");
  }

  const user = await Meteor.users.findOneAsync(userId);

  if (!user) {
    throw new Meteor.Error("no-auth", "La cuenta no existe.");
  }

  return user;
}

Meteor.methods({
  async createAuction(data) {
    check(data, {
      title: String,
      price: Number,
      image: String,
      description: String,
      category: String,
      condition: String,
      durationMinutes: Number,
    });

    const user = await getCurrentUser(this.userId);

    const title = data.title.trim();

    if (!title) {
      throw new Meteor.Error("invalid-title", "Escribe un título.");
    }

    if (!Number.isFinite(data.price) || data.price < 0) {
      throw new Meteor.Error("invalid-price", "El precio no es válido.");
    }

    if (
      !Number.isInteger(data.durationMinutes) ||
      data.durationMinutes < 1
    ) {
      throw new Meteor.Error(
        "invalid-duration",
        "La duración debe ser de al menos un minuto."
      );
    }

    const now = new Date();

    await Auctions.insertAsync({
      title,
      price: data.price,
      startingPrice: data.price,
      image: data.image.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      condition: data.condition.trim(),
      createdAt: now,
      endsAt: new Date(now.getTime() + data.durationMinutes * 60 * 1000),
      status: "activa",
      owner: this.userId,
      ownerName:
        user.profile?.username || user.username || "Usuario",
      bids: [],
      lastBidBy: null,
    });

    return true;
  },

  async placeBid(auctionId, amount) {
    check(auctionId, String);
    check(amount, Number);

    const bidder = await getCurrentUser(this.userId);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Meteor.Error("invalid-bid", "La puja no es válida.");
    }

    const now = new Date();

   
    const updatedCount = await Auctions.updateAsync(
      {
        _id: auctionId,
        endsAt: { $gt: now },
        price: { $lt: amount },
      },
      {
        $set: {
          price: amount,
          lastBidBy: this.userId,
        },
        $push: {
          bids: {
            userId: this.userId,
            username:
              bidder.profile?.username ||
              bidder.username ||
              bidder.emails?.[0]?.address ||
              "Usuario",
            amount,
            createdAt: now,
          },
        },
      }
    );

    if (updatedCount === 0) {
      const auction = await Auctions.findOneAsync(auctionId);

      if (!auction) {
        throw new Meteor.Error("not-found", "Subasta no encontrada.");
      }

      if (new Date(auction.endsAt) <= now) {
        throw new Meteor.Error("ended", "La subasta terminó.");
      }

      throw new Meteor.Error(
        "low-bid",
        `La puja debe superar el precio actual de $${auction.price}.`
      );
    }

    return true;
  },

  async toggleFavorite(auctionId) {
    check(auctionId, String);

    const user = await getCurrentUser(this.userId);
    const auction = await Auctions.findOneAsync(auctionId);

    if (!auction) {
      throw new Meteor.Error("not-found", "Subasta no encontrada.");
    }

    const favorites = user.profile?.favorites || [];

    if (favorites.includes(auctionId)) {
      await Meteor.users.updateAsync(this.userId, {
        $pull: { "profile.favorites": auctionId },
      });
    } else {
      await Meteor.users.updateAsync(this.userId, {
        $addToSet: { "profile.favorites": auctionId },
      });
    }

    return true;
  },

  async toggleCart(auctionId) {
    check(auctionId, String);

    const user = await getCurrentUser(this.userId);
    const auction = await Auctions.findOneAsync(auctionId);

    if (!auction) {
      throw new Meteor.Error("not-found", "Subasta no encontrada.");
    }

    const cart = user.profile?.cart || [];

    if (cart.includes(auctionId)) {
      await Meteor.users.updateAsync(this.userId, {
        $pull: { "profile.cart": auctionId },
      });
    } else {
      await Meteor.users.updateAsync(this.userId, {
        $addToSet: { "profile.cart": auctionId },
      });
    }

    return true;
  },

  async removeAuction(auctionId) {
    check(auctionId, String);

    const user = await getCurrentUser(this.userId);
    const auction = await Auctions.findOneAsync(auctionId);

    if (!auction) {
      throw new Meteor.Error("not-found", "Subasta no encontrada.");
    }

    const isAdmin = user.profile?.role === "admin";
    const isOwner = auction.owner === this.userId;

    if (!isAdmin && !isOwner) {
      throw new Meteor.Error(
        "not-authorized",
        "No tienes permiso para eliminar esta subasta."
      );
    }

    await Auctions.removeAsync(auctionId);

    await Meteor.users.updateAsync(
      {},
      {
        $pull: {
          "profile.favorites": auctionId,
          "profile.cart": auctionId,
        },
      },
      { multi: true }
    );

    return true;
  },
});