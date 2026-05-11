import { Meteor } from "meteor/meteor";
import "../imports/api/usersMethods";
import "../imports/api/auctions";
import "../imports/api/auctionMethods";
import { Auctions } from "../imports/api/auctions";

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

Meteor.publish("allAuctions", function () {

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