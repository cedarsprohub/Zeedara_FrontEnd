// The API's `OrderStatus` enum, in the order an order moves through it.

export const ORDER_STATUS_LABEL = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  closed: "Closed",
  cancelled: "Cancelled",
  payment_failed: "Payment failed",
  delivery_failed: "Delivery failed",
  return_requested: "Return requested",
  return_approved: "Return approved",
  return_rejected: "Return rejected",
  refund_pending: "Refund pending",
  refunded: "Refunded",
};

// Badge colours, borrowed from the design tokens already used on the orders
// screen: amber in progress, green settled, red failed, grey closed out.
const AMBER = { text: "text-[#d99116]", bg: "bg-[#fbf4e8]" };
const GREEN = { text: "text-[#298d1c]", bg: "bg-[#eefeec]" };
const RED = { text: "text-[#cf251f]", bg: "bg-[#fae9e9]" };
const GREY = { text: "text-[#667085]", bg: "bg-[#f0f1f3]" };

export const ORDER_STATUS_TONE = {
  pending_payment: AMBER,
  paid: GREEN,
  processing: AMBER,
  packed: AMBER,
  shipped: AMBER,
  delivered: GREEN,
  closed: GREY,
  cancelled: RED,
  payment_failed: RED,
  delivery_failed: RED,
  return_requested: GREY,
  return_approved: GREY,
  return_rejected: RED,
  refund_pending: GREY,
  refunded: GREY,
};

// Anything past `pending_payment`/`payment_failed` has been paid for.
const UNPAID = new Set(["pending_payment", "payment_failed", "cancelled"]);

export function isPaidStatus(status) {
  return !UNPAID.has(status);
}

export function statusTone(status) {
  return ORDER_STATUS_TONE[status] ?? GREY;
}

// Tab groupings for the order history screen.
export const ORDER_TABS = [
  { label: "All", statuses: null },
  { label: "Pending", statuses: ["pending_payment", "payment_failed"] },
  {
    label: "Processing",
    statuses: ["paid", "processing", "packed"],
  },
  { label: "Shipped", statuses: ["shipped", "delivery_failed"] },
  { label: "Delivered", statuses: ["delivered", "closed"] },
  { label: "Cancelled", statuses: ["cancelled"] },
  {
    label: "Returned",
    statuses: [
      "return_requested",
      "return_approved",
      "return_rejected",
      "refund_pending",
      "refunded",
    ],
  },
];
