import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { CartProvider } from "./context/CartProvider.jsx";

// Browsers default to restoring the previous scroll offset on reload, which
// drops you back where you left off — usually mid-page. Opting out makes a
// reload always start at the top.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      {/* Inside AuthProvider — the cart follows the session's token. */}
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
