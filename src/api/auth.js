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

// Email change, as designed: verify the current inbox first, then the new one.
// Step 1 — mail a code to the address already on the account.
export function sendCurrentEmailCode(accessToken) {
  return request("/api/v1/users/me/email/verify-current", {
    method: "POST",
    token: accessToken,
  });
}

// Step 2 — check that code. Returns `{ email_change_token }`, valid for 15
// minutes, which authorises step 3 in place of the account password.
export function confirmCurrentEmailCode(code, accessToken) {
  return request("/api/v1/users/me/email/verify-current/confirm", {
    method: "POST",
    body: { code },
    token: accessToken,
  });
}

// Step 3 — mail an EMAIL_CHANGE code to the new address. The account isn't
// touched until that code is confirmed. Re-authenticate with either the token
// from step 2 or the current password.
export function requestEmailChange(
  newEmail,
  { currentPassword = null, emailChangeToken = null } = {},
  accessToken,
) {
  return request("/api/v1/users/me/email/request", {
    method: "POST",
    body: {
      new_email: newEmail,
      current_password: currentPassword,
      email_change_token: emailChangeToken,
    },
    token: accessToken,
  });
}

// Close the account. Accounts with a password confirm with it; Google-only
// accounts (`user.has_password === false`) send `confirm: "DELETE"`. The
// server clears the profile, frees the email and revokes every session, so
// the caller should clear its local session afterwards.
export function deleteAccount({ currentPassword = null, confirm = null }, accessToken) {
  return request("/api/v1/users/me", {
    method: "DELETE",
    body: { current_password: currentPassword, confirm },
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

// The four counts behind the Account Overview "Pending Actions" card, scoped to
// the caller: delivered products not yet reviewed, returns awaiting a decision,
// custom hair requests quoted but not acted on, and skincare consultations the
// clinic has scheduled.
export function getPendingActions(accessToken) {
  return request("/api/v1/users/me/pending-actions", { token: accessToken });
}
