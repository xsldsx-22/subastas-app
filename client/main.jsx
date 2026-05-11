import React from "react";
import { createRoot } from "react-dom/client";
import { Meteor } from "meteor/meteor";
import "./Main.css";
import { MainLayout } from "../imports/ui/layouts/MainLayout";
import { Toaster } from "react-hot-toast";

Meteor.startup(() => {

  const container = document.getElementById("app");
  const root = createRoot(container);
  root.render(

  <>

    <Toaster
      position="top-right"
    />

    <MainLayout />

  </>

);

});