// Placeholder figures lifted from the Figma dashboard. There is no admin API
// yet, so every panel reads from here — one module to delete once the real
// endpoints land, rather than fixtures scattered through the components.

export const KPIS = [
  {
    label: "Revenue",
    value: "₦51.4M",
    delta: "+100.0%",
    icon: "revenue",
    // Per-card icon tints from the design; they don't map to a shared token.
    tint: "rgba(255,105,0,0.1)",
    iconColor: "#ff6900",
  },
  {
    label: "Orders",
    value: "200",
    delta: "+100.0%",
    icon: "orders",
    tint: "rgba(43,127,255,0.1)",
    iconColor: "#2b7fff",
  },
  {
    label: "Average order value",
    value: "₦233,585",
    delta: "+100.0%",
    icon: "aov",
    tint: "rgba(43,127,255,0.1)",
    iconColor: "#2b7fff",
  },
];

// Monthly revenue in Naira. The design's curve is flat through the back half of
// the year and climbs sharply from February; April carries the tooltip at ₦5.9M.
export const REVENUE_TREND = [
  { month: "Aug", revenue: 60_000 },
  { month: "Sep", revenue: 90_000 },
  { month: "Oct", revenue: 70_000 },
  { month: "Nov", revenue: 110_000 },
  { month: "Dec", revenue: 140_000 },
  { month: "Jan", revenue: 320_000 },
  { month: "Feb", revenue: 520_000 },
  { month: "Mar", revenue: 3_600_000 },
  { month: "Apr", revenue: 5_900_000 },
  { month: "May", revenue: 6_400_000 },
  { month: "Jun", revenue: 7_600_000 },
  { month: "Jul", revenue: 9_200_000 },
];

export const CATEGORY_SHARE = {
  total: "₦43.4M",
  slices: [
    { name: "Wigs", amount: "₦24.9M", share: 57, color: "#ca9949" },
    { name: "Bundles", amount: "₦10.2M", share: 23, color: "#262626" },
    { name: "Skincare", amount: "₦3.3M", share: 8, color: "#e3caa1" },
    { name: "Fragrance", amount: "₦2.8M", share: 6, color: "#828a9b" },
    { name: "Makeup", amount: "₦1.4M", share: 3, color: "#f0e0c4" },
    { name: "Tools & Accessories", amount: "₦826K", share: 2, color: "#dadde2" },
  ],
};

export const QUEUES = [
  {
    label: "Orders to process",
    value: "37",
    caption: "pending, confirmed or processing",
    icon: "orders",
    tint: "rgba(255,105,0,0.1)",
    iconColor: "#ff6900",
    to: "/admin/orders",
  },
  {
    label: "Custom wig briefs",
    value: "3",
    caption: "New or in-review",
    icon: "wig",
    tint: "rgba(43,127,255,0.1)",
    iconColor: "#2b7fff",
    to: "/admin/custom-hair",
  },
  {
    label: "Skin Clinic Bookings",
    value: "19",
    caption: "Upcoming Appointments",
    icon: "clinic",
    tint: "rgba(43,127,255,0.1)",
    iconColor: "#2b7fff",
    to: "/admin/skincare-clinic",
  },
];

// The design renders these totals with a "$" while the rest of the page is in
// Naira — treated as a mock-data slip and shown in ₦ for consistency.
export const RECENT_ORDERS = [
  {
    id: "ZD-10474",
    initials: "TB",
    name: "Temitope Balogun",
    email: "temitope.balogun65@outlook.com",
    status: "Processing",
    total: "₦68.61",
    placed: "Yesterday",
  },
  {
    id: "ZD-10472",
    initials: "FN",
    name: "Funmi Nwosu",
    email: "funmi.nwosu@icloud.com",
    status: "Confirmed",
    total: "₦211.64",
    placed: "Yesterday",
  },
  {
    id: "ZD-10458",
    initials: "FN",
    name: "Funmi Nwosu",
    email: "funmi.nwosu@icloud.com",
    status: "Pending",
    total: "₦176.75",
    placed: "Yesterday",
  },
  {
    id: "ZD-10436",
    initials: "ZB",
    name: "Zainab Boateng",
    email: "zainab.boateng@gmail.com",
    status: "Processing",
    total: "₦121.56",
    placed: "Yesterday",
  },
];

export const ORDER_STATUS_STYLES = {
  Processing: { dot: "#7f56d9", bg: "#f4f3ff", text: "#5925dc" },
  Confirmed: { dot: "#2b7fff", bg: "#eff8ff", text: "#175cd3" },
  Pending: { dot: "#f79009", bg: "#fffaeb", text: "#b54708" },
};

export const TOP_PRODUCTS = [
  { rank: 1, emoji: "🌸", name: "4x4 Closure Kinky Curly Wig", units: 32, revenue: "₦4M" },
  { rank: 2, emoji: "🎐", name: "Silk Base 5x5 Closure Wig", units: 22, revenue: "₦3.9M" },
  { rank: 3, emoji: "💫", name: "Glueless U-Part Wig Beginner Frie…", units: 28, revenue: "₦3.7M" },
  { rank: 4, emoji: "🌊", name: "Deep Wave 13x4 Frontal Unit", units: 22, revenue: "₦3.1M" },
  { rank: 5, emoji: "🌊", name: "Deep Wave 13x4 Frontal Unit", units: 22, revenue: "₦3.1M" },
];

export const LOW_STOCK = [
  {
    product: "Bare Lace 13x6 Wig Lacefr…",
    sku: "ZD-001-16PLA",
    variant: '16" · Platinum 60 · Deep Wa…',
    stock: null,
  },
  {
    product: "Bare Lace 13x6 Wig Lacefr…",
    sku: "ZD-001-16HIG",
    variant: '16" · Highlight P4/27 · Afr…',
    stock: 367,
  },
  {
    product: "Bare Lace 13x6 Wig Lacefr…",
    sku: "ZD-001-18HIG",
    variant: '18" · Highlight P4/27 · Bon…',
    stock: null,
  },
  {
    product: "Bare Lace 13x6 Wig Lacefr…",
    sku: "ZD-001-20CHE",
    variant: '20" · Chestnut 4 · Straight',
    stock: 24,
  },
];

export const LOW_STOCK_COUNT = 29;

export const DATE_RANGES = ["7 days", "30 days", "90 days", "12 months"];
