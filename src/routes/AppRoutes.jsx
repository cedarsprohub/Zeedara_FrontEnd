import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import Layout from "../layout/Layout";

// Pages
import Home from "../pages/Home";
import Categories from "../pages/Categories";
import Consultation from "../pages/Consultation";
import Skincare from "../pages/Skincare";

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
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/skincare" element={<Skincare />} />
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
