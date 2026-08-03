// How the signed-in admin is labelled in the sidebar and topbar. Shared so the
// two blocks can't drift apart, and kept out of the components so neither file
// breaks fast refresh by exporting a non-component.

// first + last, falling back to the local part of the email — plenty of admin
// accounts are provisioned without a name.
export function adminDisplayName(admin) {
  if (!admin) return "Zeedara";
  const name = [admin.first_name, admin.last_name].filter(Boolean).join(" ");
  if (name) return name;
  return admin.email?.split("@")[0] || "Zeedara";
}

// The API returns roles as [{ name, description }]. Show them rather than a
// hardcoded "Admin", so a Super Admin doesn't read as a plain one.
export function adminRoleLabel(admin) {
  const roles = admin?.roles?.map((role) => role.name).filter(Boolean);
  if (roles?.length) return roles.join(", ");
  return "Admin";
}

export function adminInitial(admin) {
  return adminDisplayName(admin).charAt(0).toUpperCase() || "Z";
}
