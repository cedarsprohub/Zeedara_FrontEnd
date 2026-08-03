import { request } from "../client";

// Admin auth is its own surface — it issues tokens that are unrelated to the
// storefront's /api/v1/auth/*. Held in one constant because the exact prefix is
// still to be confirmed with the backend; changing it is a one-line edit.
const ADMIN_AUTH_BASE = "/api/v1/admin/auth";

// Unauthenticated, so the shared client is safe here: its 401-refresh path only
// runs for requests that carried a token. Authenticated admin calls will need a
// client bound to adminTokenStore, or they'd refresh against the customer's
// refresh token — see the note in adminTokenStore.js.
export function adminLogin(email, password) {
  return request(`${ADMIN_AUTH_BASE}/login`, {
    method: "POST",
    body: { email, password },
  });
}
