import { createClient } from "../client";
import {
  clearAdminTokens,
  getAdminTokens,
  setAdminTokens,
} from "../adminTokenStore";

// Same request logic as the storefront client, bound to the admin token store.
// The adapter exists because adminTokenStore names its exports for the admin
// session; the factory just wants get/set/clear.
export const adminRequest = createClient({
  getTokens: getAdminTokens,
  setTokens: setAdminTokens,
  clearTokens: clearAdminTokens,
});
