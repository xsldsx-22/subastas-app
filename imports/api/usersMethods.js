import { Meteor } from "meteor/meteor";

import { check } from "meteor/check";

Meteor.methods({

  async removeUser(userId) {

    check(userId, String);

    // NO BORRARSE A SI MISMO
    if (this.userId === userId) {

      throw new Meteor.Error(
        "no-permitido",
        "No puedes eliminarte a ti mismo"
      );

    }

    // SOLO EN SERVIDOR
    if (Meteor.isServer) {

      const user =
        await Meteor.users.findOneAsync(userId);

      if (!user) {

        throw new Meteor.Error(
          "no-encontrado",
          "Usuario no encontrado"
        );

      }

      await Meteor.users.removeAsync(userId);

      return true;

    }

  }

});