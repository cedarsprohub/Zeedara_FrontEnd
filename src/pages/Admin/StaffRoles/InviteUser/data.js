// Seed data for the invite-user wizard. There's no roles/permissions API yet
// (see ../data.js for the staff list itself), so this static Admin/Super-admin
// split backs the role picker, the permissions step, and the review step —
// swap for a real fetch once one exists.

// The full 43-permission taxonomy, grouped exactly as the permissions step
// groups them. `granted` is the default starting state for a new Admin
// invite (Super admin, being locked/full-access, always grants every
// permission regardless of these flags — see defaultPermissionState below).
export const PERMISSION_GROUPS = [
  {
    key: "overview",
    label: "Overview and insights",
    permissions: [
      { key: "dashboard.view", label: "View dashboard", granted: true },
      { key: "analytics.view", label: "View analytics and reports", granted: false },
      {
        key: "analytics.export",
        label: "Export reports and data",
        granted: false,
        needs2fa: true,
      },
    ],
  },
  {
    key: "catalogue",
    label: "Catalogue",
    permissions: [
      { key: "products.view", label: "View products", granted: true },
      { key: "products.edit", label: "Create and edit products", granted: false },
      { key: "products.publish", label: "Publish, unpublish, archive", granted: false },
      {
        key: "products.delete",
        label: "Delete products",
        granted: false,
        needs2fa: true,
      },
      {
        key: "products.import",
        label: "Bulk import and export CSV",
        granted: false,
        needs2fa: true,
      },
      {
        key: "categories.edit",
        label: "Manage categories and collections",
        granted: false,
      },
      { key: "media.manage", label: "Manage media library", granted: false },
      { key: "inventory.view", label: "View inventory", granted: true },
      {
        key: "inventory.adjust",
        label: "Adjust stock and reorder points",
        granted: true,
      },
    ],
  },
  {
    key: "sales",
    label: "Sales and orders",
    permissions: [
      { key: "orders.view", label: "View orders", granted: true },
      { key: "orders.fulfil", label: "Update status and fulfil", granted: true },
      {
        key: "orders.cancel",
        label: "Cancel orders and restock",
        granted: false,
        needs2fa: true,
      },
      {
        key: "payments.view",
        label: "View payments and reconciliation",
        granted: false,
      },
      { key: "returns.view", label: "View return requests", granted: true },
      { key: "returns.decide", label: "Approve or reject returns", granted: true },
      {
        key: "refunds.process",
        label: "Issue refunds",
        granted: false,
        needs2fa: true,
      },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    permissions: [
      { key: "customers.view", label: "View customers", granted: true },
      { key: "customers.edit", label: "Edit customer records", granted: false },
      {
        key: "customers.export",
        label: "Export customer data",
        granted: false,
        needs2fa: true,
      },
      { key: "reviews.view", label: "View reviews", granted: false },
      {
        key: "reviews.moderate",
        label: "Approve, reject, hide reviews",
        granted: false,
      },
      { key: "support.view", label: "View support requests", granted: true },
      {
        key: "support.respond",
        label: "Respond and add internal notes",
        granted: false,
      },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    permissions: [
      { key: "discounts.view", label: "View coupons and discounts", granted: false },
      { key: "discounts.edit", label: "Create and manage coupons", granted: false },
      {
        key: "wholesale.view",
        label: "View wholesale applications",
        granted: false,
      },
      {
        key: "wholesale.decide",
        label: "Approve or reject wholesale",
        granted: false,
        needs2fa: true,
      },
    ],
  },
  {
    key: "services",
    label: "Services",
    permissions: [
      { key: "custom.view", label: "View custom hair requests", granted: true },
      {
        key: "custom.quote",
        label: "Quote and manage custom requests",
        granted: false,
      },
      { key: "clinic.view", label: "View clinic bookings", granted: false },
      {
        key: "clinic.manage",
        label: "Schedule bookings and add notes",
        granted: false,
      },
    ],
  },
  {
    key: "storefront",
    label: "Storefront content",
    permissions: [
      {
        key: "merchandising.edit",
        label: "Manage banners and sliders",
        granted: false,
      },
      { key: "content.edit", label: "Edit pages, FAQs, policies", granted: false },
    ],
  },
  {
    key: "administration",
    label: "Administration",
    permissions: [
      { key: "staff.view", label: "View staff members", granted: false },
      {
        key: "staff.invite",
        label: "Invite and deactivate members",
        granted: false,
        needs2fa: true,
      },
      {
        key: "roles.edit",
        label: "Create roles and set permissions",
        granted: false,
        needs2fa: true,
      },
      {
        key: "shipping.edit",
        label: "Manage shipping zones and rates",
        granted: true,
      },
      {
        key: "tax.edit",
        label: "Manage tax rules",
        granted: false,
        needs2fa: true,
      },
      {
        key: "settings.edit",
        label: "Manage store and payment settings",
        granted: false,
        needs2fa: true,
      },
      { key: "audit.view", label: "View activity log", granted: false },
    ],
  },
];

// A flattened view of the same taxonomy — the review step just needs a plain
// {key, label} list to read granted/restricted state off of.
export const PERMISSIONS = PERMISSION_GROUPS.flatMap((group) => group.permissions);

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
    // The role's overall ceiling — separate from the 12 permissions actually
    // pre-checked for a brand-new invite below, which an admin can widen up
    // toward this ceiling on the permissions step.
    grantedCount: 40,
  },
];

// Super admin can't be customised, so every permission reads as granted; the
// Admin role starts a new invite from each permission's own `granted` default
// and the permissions step can adjust individual checkboxes from there.
export function defaultPermissionState(role) {
  const state = {};
  PERMISSIONS.forEach((permission) => {
    state[permission.key] = role.locked ? true : permission.granted;
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
