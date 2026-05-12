import { Meteor } from "meteor/meteor";
import "../imports/api/usersMethods";
import "../imports/api/auctions";
import "../imports/api/auctionMethods";
import { Auctions } from "../imports/api/Auctions.js";

Meteor.publish("allUsers", function () {

  return Meteor.users.find(
    {},
    {
      fields: {
        emails: 1,
        profile: 1
      }
    }
  );

});

Meteor.publish("auctions", function () {

  return Auctions.find();

});
Meteor.publish( "allUsers", function () {

    return Meteor.users.find(

      {},

      {

        fields: {

          emails: 1

        }

      }

    );

  }

);
Meteor.startup(async () => {

  const admin =
    await Meteor.users.findOneAsync({

      "emails.address":
        "admin@admin.com"

    });

  if (!admin) {

    Accounts.createUser({

      email:
        "admin@admin.com",

      password:
        "admin123",

      profile: {

        username:
          "Administrador",

        role:
          "admin"

      }

    });

  }

});
Meteor.methods({

  deleteUser(userId) {

    const user =
      Meteor.user();

    if (
      user?.profile
      ?.role !== "admin"
    ) {

      throw new Meteor.Error(
        "No autorizado"
      );

    }

    Meteor.users.remove(
      userId
    );

  }

});
Meteor.startup(() => {

  Meteor.setInterval(async () => {

    const now = new Date();

    await Auctions.updateAsync(

      {
        endsAt: { $lt: now },
        status: { $ne: "finalizada" }
      },

      {
        $set: {
          status: "finalizada"
        }
      },

      { multi: true }

    );

  }, 5000);

});
import { Meteor } from "meteor/meteor";

Meteor.publish("userData", function () {
  if (!this.userId) return this.ready();

  return Meteor.users.find(
    { _id: this.userId },
    {
      fields: {
        profile: 1,
        username: 1,
        emails: 1
      }
    }
  );
});