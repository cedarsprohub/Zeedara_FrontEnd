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

        {/* Catch-all 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
