// Carries the order number and Paystack reference across the redirect to the
// payment page and back.
//
// This is a breadcrumb, not a source of truth: it says which reference to ask
// the server to verify. Whether that payment succeeded is decided solely by the
// verify response, so nothing here can be edited into a paid order.
const KEY = "zeedara_pending_payment";

export function savePendingPayment({ orderNumber, reference }) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ orderNumber, reference }));
  } catch {
    // Without storage the callback falls back to the reference Paystack puts in
    // the return URL.
  }
}

export function readPendingPayment() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingPayment() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clean up.
  }
}
