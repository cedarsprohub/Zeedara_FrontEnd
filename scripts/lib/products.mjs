// Shared between the sitemap (which only needs each product's slug) and the
// per-product OG prerender (which also needs name/media/brand) — one
// paginated walk of the public catalogue rather than two copies of it.

const PAGE_SIZE = 100;
// A guard against paging forever if the endpoint ever ignores `offset`.
const MAX_PAGES = 200;

export async function fetchAllProducts(apiBaseUrl) {
  if (!apiBaseUrl) return [];

  const products = [];
  const seen = new Set();

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = `${apiBaseUrl}/api/v1/products?limit=${PAGE_SIZE}&offset=${
      page * PAGE_SIZE
    }`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      throw new Error(`GET /api/v1/products returned ${response.status}`);
    }

    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) break;

    for (const row of rows) {
      // Only slugs are addressable, and a duplicate would break both callers.
      if (!row?.slug || seen.has(row.slug)) continue;
      seen.add(row.slug);
      products.push(row);
    }

    if (rows.length < PAGE_SIZE) break;
  }

  return products;
}
