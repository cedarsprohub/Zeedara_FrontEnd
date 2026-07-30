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

export function searchProducts(q, { limit, offset } = {}) {
  return cachedGet(`/api/v1/search${buildQuery({ q, limit, offset })}`);
}

export function listCategories() {
  return cachedGet("/api/v1/categories");
}

export function listCollections() {
  return cachedGet("/api/v1/collections");
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
