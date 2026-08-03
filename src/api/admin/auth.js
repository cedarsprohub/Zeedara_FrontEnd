import { adminRequest } from "./client";

// Admin sign-in is a three-call flow, deliberately separate from the customer
// one so the console's contract can change without touching the storefront.
//
//   1. /auth/admin/login        → AdminChallengeResponse (never tokens)
//   1b. /auth/admin/resend-otp  → a *rotated* challenge token
//   2. /auth/admin/verify-otp   → TokenPair

// Step 1. Returns { challenge_token, message, mfa_required }. Non-admin
// credentials come back as the same generic 401 as a wrong password, so this
// endpoint can't be used to discover which accounts are admins — don't add
// handling that would distinguish the two.
export function adminLogin(email, password) {
  return adminRequest("/api/v1/auth/admin/login", {
    method: "POST",
    body: { email, password },
  });
}

// Step 1b. Re-sends the code for an in-flight challenge without asking for the
// password again. The response carries a NEW challenge token that replaces the
// old one — verifying against the previous token after a resend will fail.
// Subject to a server-side cooldown, which surfaces as a 429.
export function adminResendOtp(challengeToken) {
  return adminRequest("/api/v1/auth/admin/resend-otp", {
    method: "POST",
    body: { challenge_token: challengeToken },
  });
}

// Step 2. Returns a TokenPair: { access_token, refresh_token, token_type,
// expires_in }.
export function adminVerifyOtp(challengeToken, code) {
  return adminRequest("/api/v1/auth/admin/verify-otp", {
    method: "POST",
    body: { challenge_token: challengeToken, code },
  });
}

// Revokes the refresh token server-side. Callers should clear the local store
// regardless of the outcome — a failed revoke must not leave someone stuck in
// a session they've asked to end.
export function adminLogout(refreshToken, accessToken) {
  return adminRequest("/api/v1/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
    token: accessToken,
  });
}

// The signed-in admin. `user_type` is "ADMIN" | "USER" and `roles` is a list of
// { name, description }.
export function getAdminMe(accessToken) {
  return adminRequest("/api/v1/users/me", {
    method: "GET",
    token: accessToken,
  });
}
