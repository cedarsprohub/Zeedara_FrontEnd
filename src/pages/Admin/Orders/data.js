import { TONES } from "../Customers/detail/statusStyles";

export const PAGE_SIZE = 12;

export const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export const PAYMENT_FILTERS = [
  { key: "", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "unpaid", label: "Unpaid" },
  { key: "refunded", label: "Refunded" },
  { key: "voided", label: "Voided" },
];

export { PERIODS } from "../Customers/data";

export const COLUMNS = [
  { key: "number", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "placed", label: "Placed" },
  { key: "fulfilment", label: "Fulfillment" },
  { key: "payment", label: "Payment" },
  { key: "total", label: "Total", align: "right" },
];

// Fulfilment label + tone per real order state.
const STATUS = {
  pending_payment: ["Pending", "amber"],
  payment_failed: ["Payment failed", "red"],
  paid: ["Confirmed", "blue"],
  processing: ["Processing", "violet"],
  packed: ["Packed", "violet"],
  shipped: ["Shipped", "grey"],
  delivery_failed: ["Delivery failed", "red"],
  delivered: ["Delivered", "green"],
  closed: ["Delivered", "green"],
  return_requested: ["Return requested", "amber"],
  return_approved: ["Return approved", "amber"],
  return_rejected: ["Return rejected", "grey"],
  cancelled: ["Cancelled", "red"],
  refund_pending: ["Refund pending", "amber"],
  refunded: ["Refunded", "amber"],
};

const PAYMENT = {
  paid: ["Paid", "green"],
  unpaid: ["Unpaid", "red"],
  refunded: ["Refunded", "amber"],
  voided: ["Cancelled", "grey"],
};

const VIOLET = { bg: "#f4f3ff", border: "#d9d6fe", text: "#5925dc" };
const tone = (name) => (name === "violet" ? VIOLET : TONES[name]);

export function statusPill(status) {
  const [label, name] = STATUS[status] ?? [status, "grey"];
  return { label, ...tone(name) };
}

export function paymentPill(state) {
  const [label, name] = PAYMENT[state] ?? [state, "grey"];
  return { label, ...tone(name) };
}

export const statusLabel = (status) => (STATUS[status] ?? [status])[0];

export const METHOD_LABELS = { paystack: "Paystack" };
export const methodLabel = (method) => (method ? METHOD_LABELS[method] ?? method : null);

// The five-step stepper from the design. Each real state lands on one step.
export const STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];
const STEP_OF = {
  pending_payment: 0,
  payment_failed: 0,
  paid: 1,
  processing: 2,
  packed: 2,
  shipped: 3,
  delivery_failed: 3,
  delivered: 4,
  closed: 4,
  return_requested: 4,
  return_approved: 4,
  return_rejected: 4,
};
// null for cancelled/refunded, which leave the happy path.
export const stepOf = (status) => STEP_OF[status] ?? null;

// "Advance to …" wording for the next hop.
export const ADVANCE_LABEL = {
  processing: "Advance to Processing",
  packed: "Mark as Packed",
  shipped: "Advance to Shipped",
  delivered: "Mark as Delivered",
};

export function itemCountLabel(count) {
  return `${count} item${count === 1 ? "" : "s"}`;
}

export function locationLine(order) {
  return [order.delivery_city, order.delivery_state].filter(Boolean).join(", ");
}

// Store details printed on invoices and packing slips (from the design; move
// to Store Settings when that screen lands).
export const STORE = {
  name: "Zeedara",
  tagline: "Luxury hair & clinic-grade skincare",
  address: ["14B Admiralty Way", "Lekki Phase 1", "Lagos, Lagos", "Nigeria"],
  email: "hello@zeedara.com",
  supportEmail: "support@zeedara.com",
  whatsapp: "+234 803 555 0142",
};
