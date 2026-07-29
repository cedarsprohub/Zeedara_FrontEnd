import { request } from "./client";

export function registerEmail(email) {
  return request("/api/v1/auth/register/email", {
    method: "POST",
    body: { email },
  });
}

export function verifyOtp(email, event, code) {
  return request("/api/v1/auth/otp/verify", {
    method: "POST",
    body: { email, event, code },
  });
}

export function resendOtp(email, event) {
  return request("/api/v1/auth/otp/send", {
    method: "POST",
    body: { email, event },
  });
}

export function completeProfile(profile, registrationToken) {
  return request("/api/v1/auth/register/profile", {
    method: "POST",
    body: profile,
    token: registrationToken,
  });
}

export function createPassword(password, registrationToken) {
  return request("/api/v1/auth/register/password", {
    method: "POST",
    body: { password },
    token: registrationToken,
  });
}

export function login(email, password) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function googleAuth(idToken) {
  return request("/api/v1/auth/google", {
    method: "POST",
    body: { id_token: idToken },
  });
}

export function completeGoogleProfile(phoneNumber, registrationToken, address) {
  return request("/api/v1/auth/google/complete", {
    method: "POST",
    body: { phone_number: phoneNumber, address },
    token: registrationToken,
  });
}

export function forgotPassword(email) {
  return request("/api/v1/auth/password/forgot", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(password, resetToken) {
  return request("/api/v1/auth/password/reset", {
    method: "POST",
    body: { password, reset_token: resetToken },
  });
}

export function refreshTokens(refreshToken) {
  return request("/api/v1/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export function logout(refreshToken, accessToken) {
  return request("/api/v1/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
    token: accessToken,
  });
}

export function getMe(accessToken) {
  return request("/api/v1/users/me", {
    method: "GET",
    token: accessToken,
  });
}

// PATCH is partial — only send the keys that changed. Accepts first_name,
// last_name, phone_number and address (see UserProfileUpdate in the API docs);
// returns the full updated UserPublic.
export function updateMe(profile, accessToken) {
  return request("/api/v1/users/me", {
    method: "PATCH",
    body: profile,
    token: accessToken,
  });
}
