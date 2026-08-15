import { adminRequest } from "./client";
import { buildQuery } from "../client";

// Admin catalogue management. Unlike the public catalog's bare-array lists,
// every list here returns an envelope with a real `total` — the Products
// table's page numbers and its "N products · N variants · N units" header
// both need a count a `limit + 1` probe can't give them.

// ProductListEnvelope: { items, total, limit, offset, variants_total,
// units_total }. The last two are rolled up over the full filtered set, not
// just the current page.
export function listAdminProducts(
  { q, categoryId, status, sort, limit, offset } = {},
  token,
) {
  return adminRequest(
    `/api/v1/admin/products${buildQuery({
      q,
      category_id: categoryId,
      status,
      sort,
      limit,
      offset,
    })}`,
    { token },
  );
}

// Full Product — every admin-only field included. What the Edit drawer
// prefills from, rather than the lossy summary row the table itself holds.
export function getAdminProduct(id, token) {
  return adminRequest(`/api/v1/admin/products/${encodeURIComponent(id)}`, {
    token,
  });
}

// If `variants` is omitted, the server creates one default variant from
// `base_sku` plus the submitted price/compare-at/stock — a product is never
// created with zero variants.
export function createAdminProduct(product, token) {
  return adminRequest("/api/v1/admin/products", {
    method: "POST",
    body: product,
    token,
  });
}

// Partial update. Omitting `variants` entirely leaves stock, variant count
// and sold history exactly as they are — sending an empty array is not the
// same thing, and would be read as "delete every variant."
export function updateAdminProduct(id, patch, token) {
  return adminRequest(`/api/v1/admin/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
    token,
  });
}

// Soft delete — excluded from every list/detail response from here on, but
// an order placed before the delete still resolves its line items.
export function deleteAdminProduct(id, token) {
  return adminRequest(`/api/v1/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

export function bulkDeleteAdminProducts(ids, token) {
  return adminRequest("/api/v1/admin/products", {
    method: "DELETE",
    body: { ids },
    token,
  });
}

// Whitelisted-field bulk update behind the selection bar. Only
// `category_id` is wired up on the frontend today; `status` takes the same
// shape once a bulk status action exists.
export function bulkUpdateAdminProducts({ ids, categoryId, status }, token) {
  return adminRequest("/api/v1/admin/products/bulk", {
    method: "PATCH",
    body: { ids, category_id: categoryId, status },
    token,
  });
}

// Takes pre-parsed, pre-validated rows — the importer already parses the CSV
// and previews it client-side (see ../../pages/Admin/Products/csv.js) — not
// the raw file. Each row becomes one product with one default variant.
export function importAdminProducts(products, token) {
  return adminRequest("/api/v1/admin/products/import", {
    method: "POST",
    body: { products },
    token,
  });
}

// Returns the CSV as text (see the client's non-JSON response handling) —
// callers turn it into a Blob/download the same way the CSV template
// already does in ImportDialog.jsx.
export function exportAdminProducts({ ids, q, categoryId, status, sort } = {}, token) {
  return adminRequest(
    `/api/v1/admin/products/export${buildQuery({
      ids: ids?.length ? ids.join(",") : undefined,
      q,
      category_id: categoryId,
      status,
      sort,
    })}`,
    { token },
  );
}

// Multipart upload. Returns the created ProductMedia record with its real
// CDN url — there is no local object-URL step on this path.
export function uploadProductMedia(productId, file, token) {
  const formData = new FormData();
  formData.append("file", file);
  return adminRequest(
    `/api/v1/admin/products/${encodeURIComponent(productId)}/media`,
    { method: "POST", body: formData, token },
  );
}

// Reorder or set primary: { is_primary } or { display_order }.
export function updateProductMedia(productId, mediaId, patch, token) {
  return adminRequest(
    `/api/v1/admin/products/${encodeURIComponent(productId)}/media/${encodeURIComponent(mediaId)}`,
    { method: "PATCH", body: patch, token },
  );
}

// Hard delete — media carries no order-history dependency, unlike the
// product/variant rows the soft-delete rule above exists for.
export function deleteProductMedia(productId, mediaId, token) {
  return adminRequest(
    `/api/v1/admin/products/${encodeURIComponent(productId)}/media/${encodeURIComponent(mediaId)}`,
    { method: "DELETE", token },
  );
}

// { units_sold, revenue, orders, stock_by_variant: [], review_summary } for
// one product — the per-product sibling of the storewide
// /admin/dashboard/* and /admin/reports/* endpoints in ./dashboard.js.
export function getAdminProductInsights(id, token) {
  return adminRequest(
    `/api/v1/admin/products/${encodeURIComponent(id)}/insights`,
    { token },
  );
}
