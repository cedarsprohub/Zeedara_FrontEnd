export function formatCurrency(amount) {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

// The API sends money as decimal strings ("122000.00") so no precision is lost
// in transit. Parse defensively: a missing or malformed amount must render as
// ₦0 rather than "₦NaN".
export function toAmount(value) {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(amount) ? amount : 0;
}

// Formats an amount straight off an API response.
export function formatAmount(value) {
  return formatCurrency(toAmount(value));
}
