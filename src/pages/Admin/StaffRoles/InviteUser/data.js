// Seed data for the invite-user wizard. There's no roles/permissions API yet
// (see ../data.js for the staff list itself), so this static Admin/Super-admin
// split backs the role picker, the permissions step, and the review step —
// swap for a real fetch once one exists.

// The 16 permissions the design actually names (8 granted, 8 restricted for
// Admin) — the only ones this wizard can show or toggle. Super admin's "43 of
// 43" and Admin's "40 of 43" (below) describe the role's full scope elsewhere
// in the console; this list is deliberately a subset, not a claim about all 43.
export const PERMISSIONS = [
  { key: "view_dashboard", label: "View dashboard" },
  { key: "view_products", label: "View products and inventory" },
  { key: "adjust_stock", label: "Adjust stock and reorder points" },
  { key: "fulfil_orders", label: "View and fulfil orders" },
  { key: "approve_returns", label: "Approve or reject returns" },
  { key: "view_customers", label: "View customers and support requests" },
  { key: "view_custom_hair", label: "View custom hair requests" },
  { key: "manage_shipping", label: "Manage shipping zones and rates" },
  { key: "issue_refunds", label: "Issue refunds" },
  { key: "cancel_orders", label: "Cancel orders and restock" },
  { key: "export_customers", label: "Export customer data" },
  { key: "edit_products", label: "Create or edit products" },
  { key: "manage_roles", label: "Create roles and set permissions" },
  { key: "manage_store_settings", label: "Manage store and payment settings" },
  { key: "manage_tax", label: "Manage tax rules" },
  { key: "approve_wholesale", label: "Approve wholesale applications" },
];

export const ROLES = [
  {
    key: "super_admin",
    label: "Super admin",
    locked: true,
    description: "Full access to every surface, including roles, and store settings.",
    totalPermissions: 43,
    grantedCount: 43,
  },
  {
    key: "admin",
    label: "Admin",
    locked: false,
    description:
      "Runs daily operations end to end, including refunds and wholesale decisions.",
    totalPermissions: 43,
    grantedCount: 40,
    defaultGranted: [
      "view_dashboard",
      "view_products",
      "adjust_stock",
      "fulfil_orders",
      "approve_returns",
      "view_customers",
      "view_custom_hair",
      "manage_shipping",
    ],
  },
];

// Super admin can't be customised, so every permission reads as granted; every
// other role starts from its `defaultGranted` list and the invite screen can
// adjust individual toggles from there.
export function defaultPermissionState(role) {
  const state = {};
  PERMISSIONS.forEach((permission) => {
    state[permission.key] = role.locked
      ? true
      : (role.defaultGranted ?? []).includes(permission.key);
  });
  return state;
}

const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";

export function generatePassword(length = 14) {
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)];
  }
  return password;
}
