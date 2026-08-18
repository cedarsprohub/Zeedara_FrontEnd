import { adminRequest } from "./client";
import { clearCatalogCache } from "../catalogCache";

// Admin catalogue management for categories. Reads go through the public,
// cached `listCategories()` (see ../catalog.js) — the same real ids and tree
// back both the storefront nav and this console, so there's no separate admin
// list endpoint. Only the mutations below are admin-only, and each one clears
// the catalog cache it would otherwise leave stale, the same way submitReview
// does for reviews.

export async function createAdminCategory(category, token) {
  const created = await adminRequest("/api/v1/admin/categories", {
    method: "POST",
    body: category,
    token,
  });
  clearCatalogCache();
  return created;
}

export async function updateAdminCategory(id, patch, token) {
  const updated = await adminRequest(
    `/api/v1/admin/categories/${encodeURIComponent(id)}`,
    { method: "PATCH", body: patch, token },
  );
  clearCatalogCache();
  return updated;
}

export async function deleteAdminCategory(id, token) {
  const result = await adminRequest(
    `/api/v1/admin/categories/${encodeURIComponent(id)}`,
    { method: "DELETE", token },
  );
  clearCatalogCache();
  return result;
}

// Persists a new storefront display order after a drag-and-drop reorder.
// `items` is the full set of siblings being reordered together — a plain
// array of {id, parent_id, display_order}, the same shape whether it's the
// top-level list or one parent's subcategories.
export async function reorderAdminCategories(items, token) {
  const result = await adminRequest("/api/v1/admin/categories/reorder", {
    method: "PATCH",
    body: { items },
    token,
  });
  clearCatalogCache();
  return result;
}
