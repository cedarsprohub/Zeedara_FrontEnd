import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import Layout from "../layout/Layout";

// Pages
import Home from "../pages/Home";
import Categories from "../pages/Categories";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import OrderReceived from "../pages/OrderReceived";
import CustomWig from "../pages/CustomWig";
import Consultation from "../pages/Consultation";
import Skincare from "../pages/Skincare";
import AccountLayout from "../pages/Account/AccountLayout";
import AccountOverview from "../pages/Account/Overview";
import Orders from "../pages/Account/Orders";
import TrackOrder from "../pages/Account/TrackOrder";

// Auth Pages
import Register from "../pages/Auth/Register";
import Login from "../pages/Auth/Login";
import ConfirmEmail from "../pages/Auth/ConfirmEmail";
import GetStarted from "../pages/Auth/GetStarted";
import CreatePassword from "../pages/Auth/CreatePassword";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import VerifyForgotPassword from "../pages/Auth/VerifyForgotPassword";
import ChangePassword from "../pages/Auth/ChangePassword";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Site Branch (Shares MainLayout navbar) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<OrderReceived />} />
          <Route path="/custom-wig" element={<CustomWig />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/skincare" element={<Skincare />} />
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountOverview />} />
            <Route path="overview" element={<AccountOverview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/track" element={<TrackOrder />} />
          </Route>
        </Route>
        

        {/* Auth pages (standalone, no shared layout) */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/create-password" element={<CreatePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-forgot-password" element={<VerifyForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Catch-all 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
