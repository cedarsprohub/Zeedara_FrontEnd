import { useCallback, useEffect, useState } from "react";
import { AdminAuthContext } from "./AdminAuthContext.js";
import { adminLogout, getAdminMe } from "../api/admin/auth";
import {
  clearAdminTokens,
  getAdminTokens,
  setAdminTokens,
  subscribe,
} from "../api/adminTokenStore";

// Mirrors AuthProvider for the admin session, against the admin token store.
// Kept separate rather than parameterised because the two sessions coexist —
// someone can be signed into the storefront and the console at once.
export function AdminAuthProvider({ children }) {
  const [{ accessToken, refreshToken }, setTokenState] =
    useState(getAdminTokens);
  const [admin, setAdmin] = useState(null);
  // The token whose /users/me check has finished. Loading is derived from it
  // rather than being its own flag — a boolean would have to be flipped
  // synchronously inside the effect for the no-token case, which is exactly
  // the cascading-render pattern React warns about.
  const [checkedToken, setCheckedToken] = useState(null);

  // A token in storage means there's a call to make before we know whether the
  // session is usable, so we're loading until that resolves — rather than
  // flashing the dashboard and yanking it away.
  const isLoading = Boolean(accessToken) && checkedToken !== accessToken;

  // adminTokenStore is the source of truth — a silent refresh in the admin
  // client updates it directly, and this keeps React state in step.
  useEffect(
    () =>
      subscribe((tokens) => {
        setTokenState(tokens);
        if (!tokens.accessToken) setAdmin(null);
      }),
    [],
  );

  useEffect(() => {
    if (!accessToken) return undefined;

    let active = true;

    getAdminMe(accessToken)
      .then((user) => {
        if (!active) return;
        // A valid token for a non-admin account must not open the console. The
        // login endpoint won't issue one, but a storefront token pasted into
        // the admin keys would otherwise sail through a presence-only check.
        if (user?.user_type !== "ADMIN") {
          clearAdminTokens();
          return;
        }
        setAdmin(user);
      })
      .catch(() => {
        // 401 here means the token is dead and the refresh in the admin client
        // already failed, so there's nothing to salvage.
        if (active) clearAdminTokens();
      })
      .finally(() => {
        if (active) setCheckedToken(accessToken);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  const signIn = useCallback(
    (tokens, options) => setAdminTokens(tokens, options),
    [],
  );

  // Clear locally whatever the server says: a revoke that fails (offline, token
  // already expired) must still end the session on this device.
  const signOut = useCallback(async () => {
    const current = getAdminTokens();
    try {
      if (current.refreshToken) {
        await adminLogout(current.refreshToken, current.accessToken);
      }
    } catch {
      // Ignored on purpose — see above.
    } finally {
      setAdmin(null);
      clearAdminTokens();
    }
  }, []);

  const value = {
    admin,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken),
    isLoading,
    signIn,
    signOut,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
