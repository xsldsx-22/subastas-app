import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Auctions } from "./Auctions";

Meteor.methods({

  async createAuction(data) {
    check(data.title, String);
    check(data.price, Number);
    check(data.image, String);
    check(data.hours, Number);
    check(data.description, String);
    check(data.category, String);
    check(data.condition, String);

    if (!this.userId) {
      throw new Meteor.Error("no-auth", "Debes iniciar sesión");
    }

    await Auctions.insertAsync({
      title: data.title,
      price: data.price,
      startingPrice: data.price,
      image: data.image,
      hours: data.hours,
      description: data.description,
      category: data.category,
      condition: data.condition,

      createdAt: new Date(),
      endsAt: new Date(Date.now() + data.hours * 60 * 60 * 1000),

      status: "activa",

      owner: this.userId,

      bids: []
    });

    return true;
  },

  
  async placeBid(auctionId, amount) {
    check(auctionId, String);
    check(amount, Number);

    if (!this.userId) {
      throw new Meteor.Error("no-auth", "Debes iniciar sesión");
    }

    const auction = await Auctions.findOneAsync({ _id: auctionId });

    if (!auction) {
      throw new Meteor.Error("not-found", "Subasta no encontrada");
    }

    const now = new Date();

    if (now > auction.endsAt) {
      throw new Meteor.Error("ended", "La subasta terminó");
    }

    const currentPrice = auction.price || 0;

    if (amount <= currentPrice) {
      throw new Meteor.Error("low-bid", "Puja demasiado baja");
    }

    await Auctions.updateAsync(
      { _id: auctionId },
      {
        $set: {
          price: amount,
          lastBidBy: this.userId
        },
        $push: {
          bids: {
            userId: this.userId,
            amount,
            createdAt: new Date()
          }
        }
      }
    );

    return true;
  },

  async toggleFavorite(auctionId) {
    check(auctionId, String);

    if (!this.userId) {
      throw new Meteor.Error("no-auth");
    }

    const user = await Meteor.users.findOneAsync(this.userId);

    const favorites = user?.profile?.favorites || [];

    const exists = favorites.includes(auctionId);

    if (exists) {
      await Meteor.users.updateAsync(this.userId, {
        $pull: { "profile.favorites": auctionId }
      });
    } else {
      await Meteor.users.updateAsync(this.userId, {
        $push: { "profile.favorites": auctionId }
      });
    }
  },

  async toggleCart(auctionId) {
    check(auctionId, String);

    if (!this.userId) {
      throw new Meteor.Error("no-auth");
    }

    const user = await Meteor.users.findOneAsync(this.userId);

    const cart = user?.profile?.cart || [];

    const exists = cart.includes(auctionId);

    if (exists) {
      await Meteor.users.updateAsync(this.userId, {
        $pull: { "profile.cart": auctionId }
      });
    } else {
      await Meteor.users.updateAsync(this.userId, {
        $push: { "profile.cart": auctionId }
      });
    }
  },


  async removeAuction(auctionId) {
    check(auctionId, String);

    const user = await Meteor.users.findOneAsync(this.userId);

    const auction = await Auctions.findOneAsync({ _id: auctionId });

    if (!auction) {
      throw new Meteor.Error("not-found");
    }

    if (
      auction.owner !== this.userId &&
      user?.profile?.role !== "admin"
    ) {
      throw new Meteor.Error("not-authorized");
    }

    await Auctions.removeAsync({ _id: auctionId });

    return true;
  }

});
