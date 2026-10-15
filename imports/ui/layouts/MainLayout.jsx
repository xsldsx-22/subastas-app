import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const RequireUser = ({ user, children }) => {
  if (!Meteor.userId()) return <Navigate to="/login" replace />;
  if (!user) return <section className="page-container">Cargando tu sesión…</section>;
  return children;
};

const RequireAdmin = ({ user }) => {
  if (!Meteor.userId()) return <Navigate to="/login" replace />;
  if (!user) return <section className="page-container">Verificando permisos…</section>;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <AdminPanel />;
};

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
            <Route path="/create-auction" element={<RequireUser user={user}><CreateAuction /></RequireUser>} />
            <Route path="/profile" element={<RequireUser user={user}><Profile /></RequireUser>} />
            <Route path="/admin" element={<RequireAdmin user={user} />} />
            <Route path="/favorites" element={<RequireUser user={user}><Favorites /></RequireUser>} />
            <Route path="/cart" element={<RequireUser user={user}><Cart /></RequireUser>} />
            <Route path="/auction/:id" element={<AuctionDetails />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
