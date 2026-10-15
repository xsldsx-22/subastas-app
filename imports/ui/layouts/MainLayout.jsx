import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { VerifyEmail } from "../pages/VerifyEmail";
import { Catalog } from "../pages/Catalog";
import { CreateAuction } from "../pages/CreateAuction";
import { Profile } from "../pages/Profile";
import { AuctionDetails } from "../pages/AuctionDetails";
import { AdminPanel } from "../pages/AdminPanel";
import { Favorites } from "../pages/Favorites";
import { Cart } from "../pages/Cart";
import { PaymentResult } from "../pages/PaymentResult";
import { Footer } from "../components/Footer";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

export const MainLayout = () => {
  const user = useTracker(() => {
    Meteor.subscribe("myUserData");
    return Meteor.user();
  });

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar user={user} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/create-auction" element={<CreateAuction />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auction/:id" element={<AuctionDetails />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
