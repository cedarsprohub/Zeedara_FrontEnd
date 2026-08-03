// Static presentation config for the dashboard. The figures themselves come
// from the API (see useDashboardData) — nothing here is a stand-in for real
// data, so an empty panel reads as "no data" rather than showing numbers an
// admin might act on.

export const DATE_RANGES = ["7 days", "30 days", "90 days", "12 months"];

// Per-card icon tints from the design; they don't map to a shared token.
export const KPI_CARDS = [
  {
    key: "revenue",
    label: "Revenue",
    icon: "revenue",
    tint: "rgba(255,105,0,0.1)",
    iconColor: "#ff6900",
  },
  {
    key: "orders",
    label: "Orders",
    icon: "orders",
    tint: "rgba(43,127,255,0.1)",
    iconColor: "#2b7fff",
  },
  {
    key: "aov",
    label: "Average order value",
    icon: "aov",
    tint: "rgba(43,127,255,0.1)",
    iconColor: "#2b7fff",
  },
];

// The donut has no colours of its own in the API response, so slices are
// coloured by position from the brand palette.
export const CATEGORY_COLORS = [
  "#ca9949",
  "#262626",
  "#e3caa1",
  "#828a9b",
  "#f0e0c4",
  "#dadde2",
];

// OrderStatus values that mean "someone still has to do something".
export const ACTIONABLE_ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "packed",
];

// Chips for the order statuses the recent-orders table can show.
export const ORDER_STATUS_STYLES = {
  pending_payment: { dot: "#f79009", bg: "#fffaeb", text: "#b54708" },
  paid: { dot: "#2b7fff", bg: "#eff8ff", text: "#175cd3" },
  processing: { dot: "#7f56d9", bg: "#f4f3ff", text: "#5925dc" },
  packed: { dot: "#7f56d9", bg: "#f4f3ff", text: "#5925dc" },
  shipped: { dot: "#0f9959", bg: "#eefeec", text: "#0f9959" },
  delivered: { dot: "#0f9959", bg: "#eefeec", text: "#0f9959" },
  closed: { dot: "#667085", bg: "#fcfcfc", text: "#667085" },
  cancelled: { dot: "#cf251f", bg: "#fdf2f2", text: "#cf251f" },
  payment_failed: { dot: "#cf251f", bg: "#fdf2f2", text: "#cf251f" },
  delivery_failed: { dot: "#cf251f", bg: "#fdf2f2", text: "#cf251f" },
  refunded: { dot: "#667085", bg: "#fcfcfc", text: "#667085" },
};

export const DEFAULT_STATUS_STYLE = {
  dot: "#667085",
  bg: "#fcfcfc",
  text: "#667085",
};

// "pending_payment" → "Pending payment"
export function humaniseStatus(status) {
  if (!status) return "Unknown";
  const words = status.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Two initials for the row avatar.
export function initialsFor(name) {
  if (!name) return "??";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
