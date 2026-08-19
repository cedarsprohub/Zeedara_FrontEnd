// Static seed data for the staff roles screen. There's no staff-management API
// yet, so this stands in for it the same way the dashboard's early mock data
// did — swap for a real fetch once one exists.

export const TABS = [
  { key: "team", label: "Team" },
  { key: "roles", label: "Roles" },
  { key: "activity", label: "Activity log" },
];

export const STAFF_MEMBERS = [
  {
    id: "amaka-obi",
    name: "Amaka Obi",
    email: "amaka@zeedara.com",
    role: "Super-admin",
    lastActive: "Yesterday",
    joined: "14 June 2025",
    twoFactorEnabled: true,
  },
  {
    id: "desmond-james",
    name: "Desmond James",
    email: "james@zeedara.com",
    role: "Admin",
    lastActive: "Yesterday",
    joined: "14 June 2025",
    twoFactorEnabled: true,
  },
  {
    id: "harry-stokes",
    name: "Harry Stokes",
    email: "stokes@zeedara.com",
    role: "Admin",
    lastActive: "3 days ago",
    joined: "14 June 2025",
    twoFactorEnabled: true,
    isCurrentUser: true,
  },
  {
    id: "ify-nwachukwu",
    name: "Ify Nwachukwu",
    email: "ify@zeedara.com",
    role: "Admin",
    lastActive: "22 July 2026",
    joined: "14 June 2025",
    twoFactorEnabled: false,
  },
  {
    id: "kelechi-umeh",
    name: "Kelechi Umeh",
    email: "kelechi@zeedara.com",
    role: "Admin",
    lastActive: "56 minutes ago",
    joined: "14 June 2025",
    twoFactorEnabled: false,
  },
];

// Anyone flagged without 2FA who can also refund or export data — the banner
// only exists to nudge those accounts specifically.
export const MEMBERS_WITHOUT_2FA = STAFF_MEMBERS.filter(
  (member) => !member.twoFactorEnabled,
).map((member) => member.name);

export const PAGE_SIZE = 12;

// Two words → two initials, one word → the first two letters, so every
// avatar badge is the same width.
export function initialsFor(name) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// The Roles tab's own dataset — separate from STAFF_MEMBERS above because the
// two tabs were mocked independently and don't share a roster. The design
// named the third role after a staff member ("Harry Stokes") rather than
// giving it its own name; renamed to "Store Associate" here since a role
// titled with a person's name reads as a bug once it's a live page rather
// than an isolated Figma frame.
export const ROLE_CARDS = [
  {
    id: "super-admin",
    name: "Super-admin",
    description: null,
    fullAccess: true,
    members: ["Desmond Ferguson"],
    grantedCount: 25,
    totalCount: 25,
  },
  {
    id: "admin",
    name: "Admin",
    description:
      "Runs daily operations end to end, including refunds and wholesale decisions.",
    fullAccess: false,
    members: ["Desmond Ferguson"],
    grantedCount: 25,
    totalCount: 25,
    categories: [
      { label: "Overview", granted: 2, total: 2 },
      { label: "Catalogue", granted: 4, total: 4 },
      { label: "Sales", granted: 8, total: 8 },
      { label: "Storefront & admin", granted: 2, total: 5 },
    ],
  },
  {
    id: "store-associate",
    name: "Store Associate",
    description: "Handles day-to-day storefront tasks with limited admin access.",
    fullAccess: false,
    members: ["Desmond Ferguson", "Desmond Ferguson", "Hali Sule", "Desmond Ferguson"],
    grantedCount: 6,
    totalCount: 25,
    categories: [
      { label: "Overview", granted: 2, total: 2 },
      { label: "Catalogue", granted: 4, total: 4 },
      { label: "Sales", granted: 8, total: 8 },
      { label: "Storefront & admin", granted: 2, total: 5 },
    ],
  },
];

// The design's colour per activity category — same red/purple/blue/amber/grey
// palette already used for order-status pills (see Dashboard/data.js), just
// mapped to a different set of labels here.
export const ACTIVITY_CATEGORY_STYLES = {
  Settings: { bg: "#fef3f2", border: "#fecdca", text: "#cf251f" },
  Custom: { bg: "#f4f3ff", border: "#d9d6fe", text: "#5925dc" },
  Product: { bg: "#eff8ff", border: "#b2ddff", text: "#175cd3" },
  Discount: { bg: "#fffaeb", border: "#fedf89", text: "#b54708" },
  Content: { bg: "#f2f4f7", border: "#eaecf0", text: "#475467" },
  Review: { bg: "#f2f4f7", border: "#eaecf0", text: "#475467" },
  Inventory: { bg: "#f4f3ff", border: "#d9d6fe", text: "#5925dc" },
  Customer: { bg: "#eefeec", border: "#c5e7d7", text: "#0f9959" },
  Order: { bg: "#faf4eb", border: "#e3caa1", text: "#bf8322" },
};

// The activity log's own dataset, again independent of STAFF_MEMBERS/ROLE_CARDS
// for the same reason. The design's very first row rendered with no action
// text at all (just a timestamp and IP) — a hidden layer in the source file
// suggests its title was toggled off by mistake — so it's reconstructed here
// using the same action as the next "Amaka Obi updated shipping rates…" row,
// which is what the surrounding pattern of repeated entries implies it was.
export const ACTIVITY_LOG = [
  {
    id: "log-1",
    actor: "Amaka Obi",
    action: "updated shipping rates for Nigeria — Nationwide",
    category: "Settings",
    date: "29 Jul 2026, 00:00",
    relative: "Yesterday",
    ip: "89.133.49.223",
  },
  {
    id: "log-2",
    actor: "Amaka Obi",
    action: "updated shipping rates for Nigeria — Nationwide",
    category: "Settings",
    date: "28 Jul 2026, 00:00",
    relative: "2d ago",
    ip: "111.249.244.102",
  },
  {
    id: "log-3",
    actor: "Ngozi Umeh",
    action: "sent a quote for request CW-0004",
    category: "Custom",
    date: "28 Jul 2026, 00:00",
    relative: "2d ago",
    ip: "152.202.104.74",
  },
  {
    id: "log-4",
    actor: "Amaka Obi",
    action: "updated shipping rates for Nigeria — Nationwide",
    category: "Settings",
    date: "28 Jul 2026, 00:00",
    relative: "2d ago",
    ip: "150.68.226.70",
  },
  {
    id: "log-5",
    actor: "Desmond Ferguson",
    action: 'updated pricing on "5x5 Transparent Lace Closure"',
    category: "Product",
    date: "26 Jul 2026, 00:00",
    relative: "4d ago",
    ip: "115.96.54.117",
  },
  {
    id: "log-6",
    actor: "Amaka Obi",
    action: "sent a quote for request CW-0004",
    category: "Custom",
    date: "21 Jul 2026, 00:00",
    relative: "9d ago",
    ip: "111.11.150.77",
  },
  {
    id: "log-7",
    actor: "Desmond Ferguson",
    action: "created discount code GLOW10",
    category: "Discount",
    date: "20 Jul 2026, 00:00",
    relative: "10d ago",
    ip: "124.43.140.52",
  },
  {
    id: "log-8",
    actor: "Amaka Obi",
    action: "published a new hero slide",
    category: "Content",
    date: "20 Jul 2026, 00:00",
    relative: "10d ago",
    ip: "52.46.21.97",
  },
  {
    id: "log-9",
    actor: "Amaka Obi",
    action: "published a new hero slide",
    category: "Content",
    date: "19 Jul 2026, 00:00",
    relative: "11d ago",
    ip: "102.255.118.209",
  },
  {
    id: "log-10",
    actor: "Dr. Tolu Bakare",
    action: "approved 3 pending reviews",
    category: "Review",
    date: "18 Jul 2026, 00:00",
    relative: "12d ago",
    ip: "74.189.29.131",
  },
  {
    id: "log-11",
    actor: "Ify Nwachukwu",
    action: 'created a new product "Melanin Rich Concealer Palette"',
    category: "Product",
    date: "17 Jul 2026, 00:00",
    relative: "13d ago",
    ip: "171.45.110.182",
  },
  {
    id: "log-12",
    actor: "Desmond Ferguson",
    action: "approved 3 pending reviews",
    category: "Review",
    date: "16 Jul 2026, 00:00",
    relative: "14d ago",
    ip: "194.174.48.170",
  },
  {
    id: "log-13",
    actor: "Desmond Ferguson",
    action: "restocked Satin-Lined Wig Cap 3pc by 20 units",
    category: "Inventory",
    date: "16 Jul 2026, 00:00",
    relative: "14d ago",
    ip: "68.102.228.180",
  },
  {
    id: "log-14",
    actor: "Tobi Adewale",
    action: "added a note to Emeka Johnson",
    category: "Customer",
    date: "15 Jul 2026, 00:00",
    relative: "15d ago",
    ip: "51.78.150.142",
  },
  {
    id: "log-15",
    actor: "Tobi Adewale",
    action: "marked order ZD-10365 as shipped",
    category: "Order",
    date: "14 Jul 2026, 00:00",
    relative: "16d ago",
    ip: "134.102.90.45",
  },
  {
    id: "log-16",
    actor: "Ngozi Umeh",
    action: "marked order ZD-10406 as shipped",
    category: "Order",
    date: "13 Jul 2026, 00:00",
    relative: "17d ago",
    ip: "103.54.33.42",
  },
  {
    id: "log-17",
    actor: "Dr. Tolu Bakare",
    action: "added a note to Musa Oyelaran",
    category: "Customer",
    date: "13 Jul 2026, 00:00",
    relative: "17d ago",
    ip: "63.20.11.219",
  },
  {
    id: "log-18",
    actor: "Ngozi Umeh",
    action: "sent a quote for request CW-0004",
    category: "Custom",
    date: "13 Jul 2026, 00:00",
    relative: "17d ago",
    ip: "84.188.195.2",
  },
  {
    id: "log-19",
    actor: "Amaka Obi",
    action: "refunded order ZD-10291",
    category: "Order",
    date: "12 Jul 2026, 00:00",
    relative: "18d ago",
    ip: "104.77.182.110",
  },
];

export const ACTIVITY_PAGE_SIZE = 12;
