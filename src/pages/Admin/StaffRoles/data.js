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
