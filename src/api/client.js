import { getTokens, setTokens, clearTokens } from "./tokenStore";

// In dev, requests go through the Vite proxy (see vite.config.js) as
// same-origin relative paths, avoiding the backend's CORS allowlist, which
// doesn't include localhost. Production builds always call the backend
// directly. Set VITE_USE_DEV_PROXY=false once the backend allowlists your
// dev origin, to route dev traffic straight to it instead.
const BASE_URL =
  import.meta.env.DEV && import.meta.env.VITE_USE_DEV_PROXY !== "false"
    ? ""
    : import.meta.env.VITE_API_BASE_URL;

// Query string builder for the catalog/cart/order endpoints. Blank values are
// dropped rather than sent as empty params, and every value goes through
// URLSearchParams so user input (search terms, coupon codes) can't break out of
// the query and forge extra parameters.
export function buildQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// The backend wraps every failure as {"error": {code, message, details,
// trace_id}} — NOT FastAPI's default {"detail": ...}. The fallback below only
// covers a bare FastAPI validation error, in case some endpoint ever bypasses
// the custom exception handler.
function extractMessage(body) {
  const message = body?.error?.message;
  if (message) return message;

  const { detail } = body || {};
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(" ");
  }

  return "Something went wrong. Please try again.";
}

async function rawFetch(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  return { response, data };
}

// De-duped so concurrent 401s trigger a single refresh call, not one per request.
let refreshPromise = null;

function refreshAccessToken() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return Promise.resolve(null);

  if (!refreshPromise) {
    refreshPromise = rawFetch("/api/v1/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    })
      .then(({ response, data }) => {
        if (!response.ok) throw new Error("refresh failed");
        setTokens(data);
        return data;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function request(path, { method = "GET", body, token } = {}) {
  let { response, data } = await rawFetch(path, { method, body, token });

  // Only a request that was already carrying a (now-stale) token is worth
  // retrying after a refresh — an unauthenticated 401 is a real auth failure.
  if (response.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      ({ response, data } = await rawFetch(path, {
        method,
        body,
        token: refreshed.access_token,
      }));
    }
  }

  if (!response.ok) {
    throw new ApiError(
      extractMessage(data),
      response.status,
      data?.error?.code,
      data?.error?.details ?? data?.detail,
    );
  }

  return data;
}
