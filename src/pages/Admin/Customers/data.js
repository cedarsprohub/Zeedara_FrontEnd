export const PAGE_SIZE = 12;

// Tabs, in the design's order. `key` is the API's `segment`; All sends none.
export const SEGMENTS = [
  { key: "all", label: "All" },
  { key: "vip", label: "VIP" },
  { key: "repeat", label: "Repeat" },
  { key: "new", label: "New" },
  { key: "lapsed", label: "Lapsed" },
];

// The row badge next to a customer's name.
export const SEGMENT_BADGES = {
  vip: { label: "VIP", bg: "#fffaeb", border: "#fedf89", text: "#b54708" },
  repeat: { label: "Repeat", bg: "#eff8ff", border: "#b2ddff", text: "#175cd3" },
  new: { label: "New", bg: "#eefeec", border: "#c5e7d7", text: "#0f9959" },
  lapsed: { label: "Lapsed", bg: "#fcfcfc", border: "#f0f1f3", text: "#667085" },
  blocked: { label: "Blocked", bg: "#fef3f2", border: "#f3d3d2", text: "#cf251f" },
};

// Join-date window for the whole page ("All time" menu).
export const PERIODS = [
  { key: "all", label: "All time" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
];

// `key` is the API sort field.
export const COLUMNS = [
  { key: "name", label: "Customer" },
  { key: "location", label: "Location" },
  { key: "orders", label: "Orders" },
  { key: "spend", label: "Lifetime spend", align: "right" },
  { key: "aov", label: "AOV", align: "right" },
  { key: "last_order", label: "Last Order" },
  { key: "joined", label: "Joined" },
];

export function fullName(customer) {
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ");
  return name || customer.email.split("@")[0];
}

export function initialsFor(customer) {
  const parts = [customer.first_name, customer.last_name].filter(Boolean);
  const source = parts.length ? parts : [customer.email];
  return source
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function locationOf(customer) {
  return [customer.city, customer.country].filter(Boolean).join(", ") || "—";
}

const DAY = 24 * 60 * 60 * 1000;

// "Today", "Yesterday", "2 days ago", "3 weeks ago", "2 months ago", "1 year ago".
export function relativeTime(value, now = Date.now()) {
  if (!value) return "—";
  const days = Math.floor((now - new Date(value).getTime()) / DAY);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  const unit = (count, word) => `${count} ${word}${count === 1 ? "" : "s"} ago`;
  if (days < 14) return unit(days, "day");
  if (days < 60) return unit(Math.floor(days / 7), "week");
  if (days < 365) return unit(Math.floor(days / 30), "month");
  return unit(Math.floor(days / 365), "year");
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Rows the page already holds → CSV, for "Export selected".
export function rowsToCsv(rows) {
  const header = ["Name", "Email", "Phone", "City", "Country", "Orders", "Lifetime spend", "AOV", "Last order", "Joined", "Segment", "Status"];
  const escape = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = rows.map((row) =>
    [
      fullName(row), row.email, row.phone_number, row.city, row.country, row.orders,
      row.lifetime_spend, row.aov, row.last_order_at, row.joined_at, row.segment,
      row.is_active ? "active" : "blocked",
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
