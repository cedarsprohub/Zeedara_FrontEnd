import { request } from "./client";

// Skincare consultations. All customer routes are token-scoped: there is no way
// to read someone else's consultation by id.

// `{ items: [...] }`, newest first.
export function listMyConsultations(accessToken) {
  return request("/api/v1/skincare-consultations", { token: accessToken });
}

// Saves the full form at `pending_payment` — nothing is lost if checkout is
// abandoned, and the list offers to resume payment.
export function createConsultation(
  { fullName, phoneNumber, skinType, concerns, availability, description },
  accessToken,
) {
  return request("/api/v1/skincare-consultations", {
    method: "POST",
    body: {
      full_name: fullName,
      phone_number: phoneNumber,
      skin_type: skinType,
      concerns,
      availability,
      concern_description: description || null,
    },
    token: accessToken,
  });
}

export function uploadConsultationPhoto(id, file, accessToken) {
  const body = new FormData();
  body.append("file", file);
  return request(
    `/api/v1/skincare-consultations/${encodeURIComponent(id)}/photo`,
    { method: "POST", body, token: accessToken },
  );
}

// Opens a Paystack transaction for the fixed fee (the server sets the amount,
// never the client) and returns `{ authorization_url, reference, amount_ngn }`.
// Paystack sends the customer back to /payment/callback, which verifies.
export function checkoutConsultation(id, accessToken) {
  return request(
    `/api/v1/skincare-consultations/${encodeURIComponent(id)}/checkout`,
    { method: "POST", token: accessToken },
  );
}
