import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import Layout from "../layout/Layout";
import ScrollToTop from "../components/ScrollToTop";

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
import RequireAuth from "../components/auth/RequireAuth";
import TrackOrder from "../pages/Account/TrackOrder";
import CustomHair from "../pages/Account/CustomHair";
import CustomHairNewRequest from "../pages/Account/CustomHair/NewRequest";
import SkincareConsultations from "../pages/Account/Skincare";
import AddressBook from "../pages/Account/AddressBook";
import NewAddress from "../pages/Account/AddressBook/NewAddress";
import Settings from "../pages/Account/Settings";
import BasicDetails from "../pages/Account/Settings/BasicDetails";
import ChangeEmail from "../pages/Account/Settings/ChangeEmail";
import AccountChangePassword from "../pages/Account/Settings/ChangePassword";

// Auth Pages
import Register from "../pages/Auth/Register";
import Login from "../pages/Auth/Login";
import ConfirmEmail from "../pages/Auth/ConfirmEmail";
import GetStarted from "../pages/Auth/GetStarted";
import CreatePassword from "../pages/Auth/CreatePassword";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import VerifyForgotPassword from "../pages/Auth/VerifyForgotPassword";
import ChangePassword from "../pages/Auth/ChangePassword";
import GoogleComplete from "../pages/Auth/GoogleComplete";

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
          <Route path="/skincare-clinic" element={<Skincare />} />

          {/* Every account screen needs a session — they all read `user` from
              AuthContext and call the account API. */}
          <Route element={<RequireAuth />}>
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<AccountOverview />} />
              <Route path="overview" element={<AccountOverview />} />
              <Route path="orders" element={<Orders />} />
              <Route
                path="orders/track"
                element={<TrackOrder status="shipped" />}
              />
              <Route
                path="orders/delivered"
                element={<TrackOrder status="delivered" />}
              />
              <Route
                path="orders/cancelled"
                element={<TrackOrder status="cancelled" />}
              />
              <Route path="custom-hair" element={<CustomHair />} />
              <Route
                path="custom-hair/new"
                element={<CustomHairNewRequest />}
              />
              <Route
                path="skincare-consultations"
                element={<SkincareConsultations />}
              />
              <Route path="address-book" element={<AddressBook />} />
              <Route path="address-book/new" element={<NewAddress />} />
              <Route path="settings" element={<Settings />} />
              <Route
                path="settings/basic-details"
                element={<BasicDetails />}
              />
              <Route
                path="settings/change-email"
                element={<ChangeEmail />}
              />
              <Route
                path="settings/change-password"
                element={<AccountChangePassword />}
              />
            </Route>
          </Route>
        </Route>

        {/* Auth pages (standalone, no shared layout) */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/create-password" element={<CreatePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/verify-forgot-password"
          element={<VerifyForgotPassword />}
        />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/complete-google-profile" element={<GoogleComplete />} />

        {/* Catch-all 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
