// Writes dist/sitemap.xml after a build.
//
// The static routes are known from the router; the product URLs are not, so they
// are read from the same public catalogue endpoint the app uses. That means the
// sitemap reflects what's actually purchasable at build time rather than a list
// someone has to remember to update.
//
// It never fails the build. A catalogue that's unreachable, slow or mid-deploy
// yields a sitemap of just the static routes plus a warning — shipping a smaller
// sitemap is recoverable on the next deploy, refusing to ship isn't.

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
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

// `changefreq`/`priority` are hints Google has said it ignores, so only `loc` and
// `lastmod` are emitted. A hint that's ignored is just bytes.
//
// `/categories` and `/consultation` are deliberately absent: both are still
// empty stubs and carry `noindex`, and submitting a URL you've asked not to be
// indexed is a Search Console warning. Add them here once they have content.
const STATIC_ROUTES = [
  "/",
  "/products",
  // `/skincare` renders the same page and canonicalises here, so only one of the
  // pair belongs in the sitemap.
  "/skincare-clinic",
  "/custom-wig",
];

function escapeXml(value) {
  return String(value).replace(
    /[<>&'"]/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[char],
  );
}

function urlEntry(loc, lastmod) {
  const parsed = lastmod ? new Date(lastmod) : null;
  const stamp =
    parsed && !Number.isNaN(parsed.getTime())
      ? `\n    <lastmod>${parsed.toISOString().slice(0, 10)}</lastmod>`
      : "";
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>${stamp}\n  </url>`;
}

async function main() {
  if (!API_BASE_URL) {
    console.warn(
      "[sitemap] VITE_API_BASE_URL is not set — writing static routes only.",
    );
  }

  let products = [];
  try {
    products = await fetchAllProducts(API_BASE_URL);
    console.log(`[sitemap] found ${products.length} products`);
  } catch (error) {
    console.warn(
      `[sitemap] catalogue unavailable (${error.message}) — writing static routes only.`,
    );
  }

  const entries = [
    ...STATIC_ROUTES.map((path) => urlEntry(`${SITE_URL}${path}`)),
    ...products.map((product) =>
      urlEntry(
        `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
        product.updated_at ?? product.created_at,
      ),
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join(
    "\n",
  )}\n</urlset>\n`;

  const outDir = resolve(root, "dist");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "sitemap.xml"), xml, "utf8");

  console.log(`[sitemap] wrote dist/sitemap.xml (${entries.length} URLs)`);
}

main().catch((error) => {
  // Truly unexpected — still not worth failing a deploy over.
  console.warn(`[sitemap] skipped: ${error.message}`);
});
