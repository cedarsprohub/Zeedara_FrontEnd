import { buildQuery, request } from "./client";
import { cachedRequest, clearCatalogCache } from "./catalogCache";

// Public catalog reads — no token, and none of these accept one, so nothing
// user-specific can leak through them. Because they're public and identical for
// every visitor, the GETs are briefly cached and de-duplicated (see
// `catalogCache`); the URL is the cache key.
const cachedGet = (path) => cachedRequest(path, () => request(path));

// `GET /products` returns a bare array with no total count, so callers that
// paginate ask for one extra row to learn whether a next page exists.
export function listProducts({
  q,
  categoryId,
  collection,
  productType,
  brand,
  minPrice,
  maxPrice,
  inStock,
  sort,
  limit,
  offset,
} = {}) {
  const query = buildQuery({
    q,
    category_id: categoryId,
    collection,
    product_type: productType,
    brand,
    min_price: minPrice,
    max_price: maxPrice,
    in_stock: inStock,
    sort,
    limit,
    offset,
  });
  return cachedGet(`/api/v1/products${query}`);
}

export function getProduct(slug) {
  return cachedGet(`/api/v1/products/${encodeURIComponent(slug)}`);
}

// Ranked full-text search. Takes only `q`/`limit`/`offset` — it accepts no
// filter or sort parameters, so anything that has to compose with the facets
// (the products page) goes through `listProducts({ q })` instead. This one
// backs the navbar typeahead, where ranking is the whole point.
export function searchProducts(q, { limit, offset } = {}) {
  return cachedGet(`/api/v1/search${buildQuery({ q, limit, offset })}`);
}

export function listCategories() {
  return cachedGet("/api/v1/categories");
}

export function listCollections() {
  return cachedGet("/api/v1/collections");
}

// Brand and product type are filterable, but the API exposes no facet endpoint
// to enumerate them — they only exist as fields on products. So the values are
// read off a page of the catalog. `limit` is the API's own maximum, and a brand
// that appears solely beyond that window won't be offered as an option (the
// filter itself still works if such a value reaches the URL). Counts are
// deliberately not derived: over a partial window they'd be wrong.
const FACET_SAMPLE_SIZE = 100;

export async function listProductFacets() {
  const rows = await listProducts({ limit: FACET_SAMPLE_SIZE, sort: "name" });
  const products = Array.isArray(rows) ? rows : [];

  const unique = (field) =>
    [...new Set(products.map((p) => p[field]).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );

  const prices = products
    .map((product) => Number(product.min_price))
    .filter((price) => Number.isFinite(price) && price > 0);

  return {
    brands: unique("brand"),
    productTypes: unique("product_type"),
    // Drives the price slider's ceiling, so the usable part of the track isn't
    // squeezed into its first few pixels by a hardcoded maximum.
    maxPrice: prices.length ? Math.max(...prices) : null,
  };
}

// Approved reviews plus the rating summary. Keyed by product id (not slug).
export function getProductReviews(productId, { limit, offset } = {}) {
  const query = buildQuery({ limit, offset });
  return cachedGet(
    `/api/v1/products/${encodeURIComponent(productId)}/reviews${query}`,
  );
}

// Verified purchasers only; the review enters moderation as pending, so it
// won't appear in the list above until an admin approves it.
export function submitReview(
  { productId, rating, title, body, mediaUrl },
  accessToken,
) {
  // A submitted review changes what the reviews endpoint returns once it's
  // approved, so drop the cached copies rather than serving a stale summary.
  clearCatalogCache();
  return request("/api/v1/reviews", {
    method: "POST",
    body: {
      product_id: productId,
      rating,
      title: title || null,
      body,
      media_url: mediaUrl || null,
    },
    token: accessToken,
  });
}
