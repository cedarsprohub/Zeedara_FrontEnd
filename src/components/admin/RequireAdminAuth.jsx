import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext.js";

function RequireAdminAuth() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  // The provider is still confirming the token against /users/me. Rendering
  // nothing beats flashing the dashboard and then bouncing to the login.
  if (isLoading) return null;

  // `isAuthenticated` tracks the token store, which the provider clears when
  // /users/me fails or comes back as a non-ADMIN account — so a valid-looking
  // token for the wrong kind of account lands here too, not just a missing one.
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default RequireAdminAuth;
