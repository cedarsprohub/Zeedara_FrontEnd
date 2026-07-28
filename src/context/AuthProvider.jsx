import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { getMe } from "../api/auth";
import {
  getTokens,
  setTokens,
  clearTokens,
  subscribe,
} from "../api/tokenStore";

export function AuthProvider({ children }) {
  const [{ accessToken, refreshToken }, setTokenState] = useState(getTokens);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getTokens().accessToken));

  // tokenStore is the source of truth — a silent refresh in client.js (after
  // a 401) updates it directly, and this keeps React state in sync with that.
  useEffect(
    () =>
      subscribe((tokens) => {
        setTokenState(tokens);
        if (!tokens.accessToken) setUser(null);
      }),
    [],
  );

  useEffect(() => {
    if (!accessToken) return;

    getMe(accessToken)
      .then(setUser)
      .catch(() => {
        clearTokens();
      })
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  const login = (tokens) => setTokens(tokens);

  const logout = () => {
    setUser(null);
    clearTokens();
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(accessToken),
    isLoading,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
