// Writes dist/products/<slug>/index.html for every product after the build.
//
// `components/shared/Seo` rewrites the document head with a product's real
// title, description and photo — but only once React mounts and the product
// fetch resolves. Link-preview crawlers (WhatsApp, Facebook, X, Telegram,
// ...) never run that JavaScript; they read whatever's in the response body
// verbatim. On Vercel that gap can be closed with an edge function that
// answers bots directly, but this app is hosted on DigitalOcean App
// Platform's static-site product, which serves files straight from storage —
// no per-request server code runs at all. The only way a shared product link
// can carry that product's own photo is to bake it into a real file at build
// time, one per product, so the static host serves it directly instead of
// falling back to the generic `index.html` shell (`x-do-static-catchall-
// document`, confirmed by the response headers in production).
//
// A visitor who lands here still gets the full app: the script/style tags
// are copied verbatim from the real build output, so React mounts into
// `#root` exactly as it does from the shell, and takes over routing from
// there. This is strictly an improvement for Google too — it now gets a
// fully-formed head on first byte instead of only after render.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readEnv } from "./lib/env.mjs";
import { fetchAllProducts } from "./lib/products.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SITE_URL = readEnv(
  root,
  "VITE_SITE_URL",
  "https://www.zeedara.com",
).replace(/\/+$/, "");
const API_BASE_URL = readEnv(root, "VITE_API_BASE_URL", "").replace(
  /\/+$/,
  "",
);

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function primaryImageUrl(media) {
  const images = Array.isArray(media)
    ? media.filter((item) => item.media_type === "image" && item.url)
    : [];
  if (!images.length) return `${SITE_URL}/og-image.png`;
  const primary = images.find((item) => item.is_primary);
  return (primary ?? images[0]).url;
}

// The list endpoint — the one this and the sitemap script both page through —
// carries `brand`/`product_type` but not the rich-text `description`; that's
// only on the per-slug detail endpoint, and fetching it product-by-product
// would mean 30+ extra requests at build time for copy that's just a fallback
// anyway. Mirrors the same fallback `ProductDetail` uses for a product with
// no description of its own.
function summarise(product) {
  const brand = product.brand ? ` by ${product.brand}` : "";
  return `${product.name}${brand} at Zeedara. Authentic products with secure checkout and delivery across Nigeria.`;
}

// Swaps one sitewide tag for a product-specific one. `shell` (the real built
// `index.html`) has exactly one of each, so a plain non-greedy replace can't
// double up or leave the old value sitting alongside the new one.
function replaceTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`${label} tag not found in dist/index.html`);
  }
  return html.replace(pattern, replacement);
}

function renderPage(shell, product) {
  const canonical = `${SITE_URL}/products/${encodeURIComponent(product.slug)}`;
  const title = `${escapeHtml(product.name)} | Zeedara`;
  const description = escapeHtml(summarise(product));
  const image = escapeHtml(primaryImageUrl(product.media));
  const url = escapeHtml(canonical);

  return [
    [/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, "title"],
    [
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${description}" />`,
      "description",
    ],
    [
      /<link\s+rel="canonical"[\s\S]*?\/>/,
      `<link rel="canonical" href="${url}" />`,
      "canonical",
    ],
    [
      /<meta\s+property="og:type"[\s\S]*?\/>/,
      `<meta property="og:type" content="product" />`,
      "og:type",
    ],
    [
      /<meta\s+property="og:url"[\s\S]*?\/>/,
      `<meta property="og:url" content="${url}" />`,
      "og:url",
    ],
    [
      /<meta\s+property="og:title"[\s\S]*?\/>/,
      `<meta property="og:title" content="${title}" />`,
      "og:title",
    ],
    [
      /<meta\s+property="og:description"[\s\S]*?\/>/,
      `<meta property="og:description" content="${description}" />`,
      "og:description",
    ],
    [
      /<meta\s+property="og:image"[\s\S]*?\/>/,
      `<meta property="og:image" content="${image}" />`,
      "og:image",
    ],
    [
      /<meta\s+name="twitter:title"[\s\S]*?\/>/,
      `<meta name="twitter:title" content="${title}" />`,
      "twitter:title",
    ],
    [
      /<meta\s+name="twitter:description"[\s\S]*?\/>/,
      `<meta name="twitter:description" content="${description}" />`,
      "twitter:description",
    ],
    [
      /<meta\s+name="twitter:image"[\s\S]*?\/>/,
      `<meta name="twitter:image" content="${image}" />`,
      "twitter:image",
    ],
  ].reduce(
    (html, [pattern, replacement, label]) =>
      replaceTag(html, pattern, replacement, label),
    shell,
  );
}

async function main() {
  const distDir = resolve(root, "dist");
  const shellPath = resolve(distDir, "index.html");
  if (!existsSync(shellPath)) {
    console.warn("[product-og] dist/index.html not found — skipping.");
    return;
  }
  const shell = readFileSync(shellPath, "utf8");

  if (!API_BASE_URL) {
    console.warn("[product-og] VITE_API_BASE_URL is not set — skipping.");
    return;
  }

  let products = [];
  try {
    products = await fetchAllProducts(API_BASE_URL);
  } catch (error) {
    console.warn(
      `[product-og] catalogue unavailable (${error.message}) — skipping.`,
    );
    return;
  }

  for (const product of products) {
    if (!product?.slug) continue;
    const outDir = resolve(distDir, "products", product.slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      resolve(outDir, "index.html"),
      renderPage(shell, product),
      "utf8",
    );
  }

  console.log(`[product-og] wrote ${products.length} product pages`);
}

main().catch((error) => {
  // Never worth failing a deploy over — a shared link falling back to the
  // sitewide card is recoverable on the next build, refusing to ship isn't.
  console.warn(`[product-og] skipped: ${error.message}`);
});
