// Shared SEO constants and URL helpers.
//
// Canonical, Open Graph and sitemap URLs all have to be absolute, so they all
// need one agreed origin. It comes from `VITE_SITE_URL` (set it per environment
// — a preview deploy shouldn't claim to be the canonical site) and falls back to
// production so a build without the variable still emits correct tags.

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://www.zeedara.com"
).replace(/\/+$/, "");

export const SITE_NAME = "Zeedara";

// Appended to every page title except the home page, which carries its own.
export const TITLE_SUFFIX = ` | ${SITE_NAME}`;

// The sitewide fallback share image. It lives in `public/` rather than `src/`
// because `index.html` references it too, and that can't point at a
// build-hashed asset.
export const DEFAULT_OG_IMAGE = "/og-image.png";

export const DEFAULT_DESCRIPTION =
  "Shop authentic wigs, hair, beauty, skincare and personal care products in Nigeria. Clear pricing in naira, secure Paystack checkout and reliable delivery.";

/** Absolute URL for a site-relative path. Already-absolute URLs pass through. */
export function absoluteUrl(path) {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Canonical URL for a path.
 *
 * Query strings are dropped by default: the filter, sort and view params on the
 * catalogue produce a near-infinite set of URLs over the same products, and
 * pointing them all at the clean path is what stops that being read as
 * duplicate content. Pass `search` to keep the params that genuinely identify a
 * distinct page — `?page=2` is a different set of products, `?sort=name` isn't.
 */
export function canonicalUrl(pathname, search = "") {
  const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return absoluteUrl(`${path}${search}`);
}

/** Trims copy to a length search engines will actually display. */
export function truncate(text, max = 160) {
  const clean = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}
