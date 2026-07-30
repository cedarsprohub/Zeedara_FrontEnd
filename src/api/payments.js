import { request } from "./client";

// Paystack, driven entirely by the backend.
//
// The client never sees a secret key, never states an amount, and never decides
// that a payment succeeded. It asks the server to open a transaction for an
// order number, sends the customer to the authorization URL the server returns,
// and on the way back asks the server to verify the reference. `paid` in that
// response is the only thing that may be treated as payment.

export function initializePayment(orderNumber) {
  return request("/api/v1/payments/paystack/initialize", {
    method: "POST",
    body: { order_number: orderNumber },
  });
}

export function verifyPayment(reference) {
  return request(
    `/api/v1/payments/paystack/verify/${encodeURIComponent(reference)}`,
  );
}
