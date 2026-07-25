import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { getMe } from "../api/auth";

const ACCESS_TOKEN_KEY = "zeedara_access_token";
const REFRESH_TOKEN_KEY = "zeedara_refresh_token";

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem(ACCESS_TOKEN_KEY) || null,
  );
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem(REFRESH_TOKEN_KEY) || null,
  );
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() =>
    Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)),
  );

  useEffect(() => {
    if (!accessToken) return;

    getMe(accessToken)
      .then(setUser)
      .catch(() => {
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  const login = (tokens) => {
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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
