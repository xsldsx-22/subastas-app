import React
from "react";

import {
  useTracker
}
from "meteor/react-meteor-data";

import { Meteor }
from "meteor/meteor";

export const AdminPanel = () => {

  const users =
    useTracker(() => {

      Meteor.subscribe(
        "allUsers"
      );

      return Meteor.users
        .find()
        .fetch();

    });

  return (

    <section
      className="catalog-page"
    >

      <h1>
        Panel Admin
      </h1>

      {

        users.map(
          (user) => (

            <div

              key={user._id}

              className="bid-item"

            >

              <p>

                {

                  user.profile?.username
                }

              </p>

              <p>

                Rol:

                {" "}

                {

                  user.profile
                  ?.role
                  || "usuario"

                }

              </p>
              <p>

  {

    user.emails?.[0]
    ?.address

  }

</p>

            </div>

          )
        )

      }

    </section>

  );

};