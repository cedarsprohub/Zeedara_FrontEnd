import { request } from "./client";

// Custom wig ("custom hair") requests. All customer routes are token-scoped.

// `{ items: [...], counts: { all, under_review, quoted, completed } }`, newest
// first. `under_review` includes just-submitted requests and `quoted` includes
// ones whose checkout has been opened but not yet paid.
export function listMyRequests(accessToken) {
  return request("/api/v1/custom-wig-requests", { token: accessToken });
}

export function getMyRequest(id, accessToken) {
  return request(`/api/v1/custom-wig-requests/${encodeURIComponent(id)}`, {
    token: accessToken,
  });
}

export function createRequest(
  { fullName, whatsappNumber, hairPreference, budgetRange, notes },
  accessToken,
) {
  return request("/api/v1/custom-wig-requests", {
    method: "POST",
    body: {
      full_name: fullName,
      whatsapp_number: whatsappNumber,
      hair_preference: hairPreference,
      budget_range: budgetRange,
      notes: notes || null,
    },
    token: accessToken,
  });
}

export function uploadInspirationImage(id, file, accessToken) {
  const body = new FormData();
  body.append("file", file);
  return request(
    `/api/v1/custom-wig-requests/${encodeURIComponent(id)}/image`,
    { method: "POST", body, token: accessToken },
  );
}

// Charges the quoted amount — set by Zeedara, never by the client. Returns
// `{ authorization_url, reference, amount_ngn }`; Paystack sends the customer
// back to /payment/callback. Safe to call again after an abandoned payment: the
// server checks the earlier transaction first and, if it did go through, hands
// back the callback for that one instead of charging twice.
export function checkoutRequest(id, accessToken) {
  return request(
    `/api/v1/custom-wig-requests/${encodeURIComponent(id)}/checkout`,
    { method: "POST", token: accessToken },
  );
}
