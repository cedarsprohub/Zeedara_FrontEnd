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

// Authenticated change — proves possession of the current password rather than
// an emailed code. The backend revokes every refresh token on success (SEC-04),
// so the caller has to sign in again afterwards.
export function changePassword(currentPassword, newPassword, accessToken) {
  return request("/api/v1/users/me/password", {
    method: "POST",
    body: { current_password: currentPassword, new_password: newPassword },
    token: accessToken,
  });
}

// Step 1 of an email change — mails an EMAIL_CHANGE code to the new address.
// The account isn't touched until the code is confirmed. `currentPassword`
// re-authenticates the caller and is required for any account that has one;
// Google-only accounts pass null.
export function requestEmailChange(newEmail, currentPassword, accessToken) {
  return request("/api/v1/users/me/email/request", {
    method: "POST",
    body: { new_email: newEmail, current_password: currentPassword ?? null },
    token: accessToken,
  });
}

// Step 2 — confirms the code and moves the account over. Returns the updated
// UserPublic. Revokes every refresh token (SEC-04), so the caller has to sign
// in again afterwards.
export function confirmEmailChange(newEmail, code, accessToken) {
  return request("/api/v1/users/me/email/confirm", {
    method: "POST",
    body: { new_email: newEmail, code },
    token: accessToken,
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
