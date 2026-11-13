// Pill tones used across the Customer details tabs.
export const TONES = {
  green: { bg: "#eefeec", border: "#c5e7d7", text: "#0f9959" },
  blue: { bg: "#eff8ff", border: "#b2ddff", text: "#175cd3" },
  amber: { bg: "#fffaeb", border: "#fedf89", text: "#b54708" },
  red: { bg: "#fff4f4", border: "#fae9e9", text: "#cf251f" },
  grey: { bg: "#fcfcfc", border: "#f0f1f3", text: "#667085" },
};

const humanise = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ") : "—";

// [label, tone] for each status the API returns.
const ORDER = {
  pending_payment: ["Pending", "amber"],
  paid: ["Confirmed", "blue"],
  processing: ["Processing", "blue"],
  packed: ["Packed", "blue"],
  shipped: ["Shipped", "grey"],
  delivered: ["Delivered", "green"],
  closed: ["Delivered", "green"],
  cancelled: ["Cancelled", "red"],
  payment_failed: ["Payment failed", "red"],
  delivery_failed: ["Delivery failed", "red"],
  return_requested: ["Return requested", "amber"],
  return_approved: ["Return approved", "amber"],
  return_rejected: ["Return rejected", "grey"],
  refund_pending: ["Refund pending", "amber"],
  refunded: ["Refunded", "grey"],
};

const PAYMENT = {
  paid: ["Paid", "green"],
  pending: ["Pending", "amber"],
  failed: ["Failed", "red"],
  refunded: ["Refunded", "grey"],
};

const CLINIC = {
  pending_payment: ["Awaiting payment", "amber"],
  pending_review: ["Pending", "amber"],
  scheduled: ["Confirmed", "blue"],
  completed: ["Completed", "green"],
  cancelled: ["Cancelled", "red"],
};

const WIG = {
  submitted: ["Submitted", "grey"],
  under_review: ["Under review", "amber"],
  quoted: ["Quoted", "blue"],
  payment_pending: ["Payment pending", "amber"],
  confirmed: ["Confirmed", "blue"],
  completed: ["Completed", "green"],
  cancelled: ["Cancelled", "red"],
};

const lookup = (table) => (status) => {
  const [label, tone] = table[status] ?? [humanise(status), "grey"];
  return { label, ...TONES[tone] };
};

export const orderStatus = lookup(ORDER);
export const paymentStatus = lookup(PAYMENT);
export const clinicStatus = lookup(CLINIC);
export const wigStatus = lookup(WIG);
