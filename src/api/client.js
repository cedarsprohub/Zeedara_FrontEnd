import * as customerTokenStore from "./tokenStore";

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

// Pydantic/FastAPI validation errors, wherever they show up: either the raw
// `[{ loc: ["body", "category_id"], msg, type }, ...]` list FastAPI's default
// 422 handler returns, or that same list passed through as `error.details` by
// the backend's own wrapper (see extractMessage below). `loc` is what actually
// says which field failed — dropping it (a bare .msg join) leaves several
// fields' messages run together with no way to tell them apart.
function formatValidationDetails(details) {
  if (!Array.isArray(details)) return "";
  return details
    .map((item) => {
      if (typeof item === "string") return item;
      const field = Array.isArray(item.loc)
        ? item.loc.filter((part) => part !== "body").join(".")
        : "";
      return field ? `${field}: ${item.msg}` : item.msg;
    })
    .filter(Boolean)
    .join("; ");
}

// The backend wraps every failure as {"error": {code, message, details,
// trace_id}} — NOT FastAPI's default {"detail": ...}. `message` alone is
// often a generic line ("One or more fields are invalid.") with the actual
// per-field breakdown sitting unread in `details`, so it's appended here
// rather than dropped. The `detail` fallback below only covers a bare
// FastAPI validation error, in case some endpoint ever bypasses the custom
// exception handler entirely.
function extractMessage(body) {
  const message = body?.error?.message;
  if (message) {
    const details = formatValidationDetails(body.error.details);
    return details ? `${message} ${details}` : message;
  }

  const { detail } = body || {};
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return formatValidationDetails(detail) || "Something went wrong. Please try again.";

  return "Something went wrong. Please try again.";
}

async function rawFetch(path, { method = "GET", body, token } = {}) {
  // A FormData body (product media upload) needs the browser's own
  // multipart Content-Type with its boundary — setting one here, or
  // JSON.stringify-ing the body, would break the upload.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  // Non-JSON success bodies (a CSV export) are still worth returning — read
  // as text rather than silently discarded as null.
  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  return { response, data };
}

// Builds a request function bound to one token store. Storefront and admin
// sessions live under different keys and can be signed in at the same time, so
// each needs its own refresh — otherwise an expired admin token would be
// refreshed using the customer's refresh token (and vice versa). The refresh
// de-dupe is per client for the same reason.
export function createClient(store) {
  let refreshPromise = null;

  function refreshAccessToken() {
    const { refreshToken } = store.getTokens();
    if (!refreshToken) return Promise.resolve(null);

    // De-duped so concurrent 401s trigger a single refresh call, not one per
    // request.
    if (!refreshPromise) {
      refreshPromise = rawFetch("/api/v1/auth/refresh", {
        method: "POST",
        body: { refresh_token: refreshToken },
      })
        .then(({ response, data }) => {
          if (!response.ok) throw new Error("refresh failed");
          store.setTokens(data);
          return data;
        })
        .catch(() => {
          store.clearTokens();
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }
    return refreshPromise;
  }

  return async function request(path, { method = "GET", body, token } = {}) {
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
  };
}

// The storefront client. Signature is unchanged, so every existing caller in
// src/api/* keeps working untouched.
export const request = createClient(customerTokenStore);
