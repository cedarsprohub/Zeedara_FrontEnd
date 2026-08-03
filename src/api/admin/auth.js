import { request } from "../client";

// Admins sign in through the same endpoint as customers. The backend branches
// on the account: customers get a TokenPair straight back, admins get an
// ADMIN_LOGIN OTP challenge instead (mandatory MFA, SEC-02) and have to finish
// at /auth/admin/verify-otp. So there is deliberately no admin-only login call.
export function adminLogin(email, password) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

// Step 2. Returns a TokenPair: { access_token, refresh_token, token_type,
// expires_in }.
export function adminVerifyOtp(challengeToken, code) {
  return request("/api/v1/auth/admin/verify-otp", {
    method: "POST",
    body: { challenge_token: challengeToken, code },
  });
}

// The login 200 is untyped in the OpenAPI schema, so the challenge field name
// isn't pinned down there. `challenge_token` is what /auth/admin/verify-otp
// asks for, so that's the primary; the fallbacks cost nothing and save a
// round trip if the response nests it.
export function readChallengeToken(response) {
  return (
    response?.challenge_token ??
    response?.challenge?.token ??
    response?.challenge?.challenge_token ??
    null
  );
}
