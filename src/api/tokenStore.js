const ACCESS_TOKEN_KEY = "zeedara_access_token";
const REFRESH_TOKEN_KEY = "zeedara_refresh_token";

let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || null;
let refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || null;
const listeners = new Set();

function notify() {
  const tokens = getTokens();
  listeners.forEach((listener) => listener(tokens));
}

export function getTokens() {
  return { accessToken, refreshToken };
}

export function setTokens(tokens) {
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  notify();
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  notify();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
