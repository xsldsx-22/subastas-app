import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Auctions } from "../imports/api/Auctions.js";

import "../imports/api/auctionMethods.js";
import "../imports/api/usersMethods.js";


Accounts.onCreateUser((options, user) => ({
  ...user,
  profile: {
    ...(options.profile || {}),
    username:
      user.username ||
      options.profile?.username ||
      "Usuario",
    role: "user",
    favorites: [],
    cart: [],
  },
}));

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

Meteor.publish("myUserData", function () {
  if (!this.userId) {
    return this.ready();
  }

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

Meteor.publish("adminUsers", async function () {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(
    { _id: this.userId },
    { fields: { "profile.role": 1 } }
  );

  if (currentUser?.profile?.role !== "admin") {
    return this.ready();
  }

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

Meteor.publish("adminAuctions", async function () {
  if (!this.userId) {
    return this.ready();
  }

  const currentUser = await Meteor.users.findOneAsync(
    { _id: this.userId },
    { fields: { "profile.role": 1 } }
  );

  if (currentUser?.profile?.role !== "admin") {
    return this.ready();
  }

  return Auctions.find();
});

Meteor.startup(() => {
  Meteor.setInterval(async () => {
    try {
      await Auctions.updateAsync(
        {
          endsAt: { $lte: new Date() },
          status: { $ne: "finalizada" },
        },
        {
          $set: { status: "finalizada" },
        },
        { multi: true }
      );
    } catch (error) {
      console.error(
        "Error al actualizar las subastas:",
        error
      );
    }
  }, 5000);
});

Meteor.startup(async () => {
  try {
    const auctionsWithLegacyBids = await Auctions.find({
      bids: {
        $elemMatch: {
          username: { $exists: false },
          userId: { $exists: true },
        },
      },
    }).fetchAsync();

    for (const auction of auctionsWithLegacyBids) {
      const bids = [];

      for (const bid of auction.bids || []) {
        if (bid.username || !bid.userId) {
          bids.push(bid);
          continue;
        }

        const bidder = await Meteor.users.findOneAsync(
          bid.userId,
          {
            fields: {
              username: 1,
              "profile.username": 1,
              emails: 1,
            },
          }
        );

        bids.push({
          ...bid,
          username:
            bidder?.profile?.username ||
            bidder?.username ||
            bidder?.emails?.[0]?.address ||
            "Usuario",
        });
      }

      await Auctions.updateAsync(auction._id, {
        $set: { bids },
      });
    }
  } catch (error) {
    console.error(
      "No se pudieron completar los nombres de pujas anteriores:",
      error
    );
  }
});

