// Admin tokens live under their own keys, separate from the storefront's
// `zeedara_*` pair in tokenStore.js. Someone signed in as a customer and as an
// admin in the same browser would otherwise overwrite one session with the
// other, since both go through the same origin's storage.
const ACCESS_TOKEN_KEY = "zeedara_admin_access_token";
const REFRESH_TOKEN_KEY = "zeedara_admin_refresh_token";

// "Remember me" picks which storage backs the session: localStorage survives a
// browser restart, sessionStorage is dropped when the tab closes. Reads check
// both, because on load we don't yet know which one the last sign-in used.
function readToken(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
}

let accessToken = readToken(ACCESS_TOKEN_KEY);
let refreshToken = readToken(REFRESH_TOKEN_KEY);
const listeners = new Set();

function notify() {
  const tokens = getAdminTokens();
  listeners.forEach((listener) => listener(tokens));
}

export function getAdminTokens() {
  return { accessToken, refreshToken };
}

export function setAdminTokens(tokens, { remember = true } = {}) {
  accessToken = tokens.access_token;
  refreshToken = tokens.refresh_token;

  // Clear the store we're *not* using first — otherwise switching "remember me"
  // off would leave the previous long-lived pair behind for readToken to find.
  const target = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  other.removeItem(ACCESS_TOKEN_KEY);
  other.removeItem(REFRESH_TOKEN_KEY);
  target.setItem(ACCESS_TOKEN_KEY, accessToken);
  target.setItem(REFRESH_TOKEN_KEY, refreshToken);

  notify();
}

export function clearAdminTokens() {
  accessToken = null;
  refreshToken = null;
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(ACCESS_TOKEN_KEY);
    store.removeItem(REFRESH_TOKEN_KEY);
  }
  notify();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
