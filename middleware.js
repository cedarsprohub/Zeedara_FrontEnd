// Vercel Edge Middleware.
//
// `components/shared/Seo` writes per-product Open Graph tags, but only after
// React mounts and the product fetch resolves. Google renders JS and waits
// for that; link-preview crawlers (WhatsApp, Facebook, X, Telegram, Slack,
// Discord, ...) don't — they read whatever's in the initial response and
// nothing else, so every shared product link previewed as the sitewide
// Zeedara card instead of that product's photo and name.
//
// This intercepts just those bots on `/products/:slug` and answers with a
// small prerendered page carrying the real per-product tags. Everyone else
// (browsers, Googlebot) falls through to the SPA untouched — returning
// `undefined` continues normal routing rather than answering the request.

export const config = {
  matcher: "/products/:slug",
};

const BOT_UA =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|redditbot|Pinterest|SkypeUriPreview|vkShare|Snapchat|Viber/i;

const SITE_URL = (
  process.env.VITE_SITE_URL || "https://www.zeedara.com"
).replace(/\/+$/, "");
const API_BASE_URL = (process.env.VITE_API_BASE_URL || "").replace(
  /\/+$/,
  "",
);

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

// A minimal stand-in for `utils/sanitizeHtml`'s `descriptionToPlainText`:
// that one runs DOMPurify against a real DOM, which the edge runtime doesn't
// have. This only ever feeds a `<meta content>` attribute (escaped below),
// so stripping tags with a regex is enough — no markup is ever rendered.
function stripHtml(html) {
  return String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function primaryImageUrl(media) {
  const images = Array.isArray(media)
    ? media.filter((item) => item.media_type === "image" && item.url)
    : [];
  if (!images.length) return `${SITE_URL}/og-image.png`;
  const primary = images.find((item) => item.is_primary);
  return (primary ?? images[0]).url;
}

function renderHtml(product) {
  const canonical = `${SITE_URL}/products/${product.slug}`;
  const title = `${product.name} | Zeedara`;
  const description =
    stripHtml(product.description).slice(0, 160) ||
    `${product.name} at Zeedara. Authentic products with secure checkout and delivery across Nigeria.`;
  const image = primaryImageUrl(product.media);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="product" />
<meta property="og:site_name" content="Zeedara" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
</head>
<body>
<a href="${escapeHtml(canonical)}">${escapeHtml(product.name)}</a>
</body>
</html>`;
}

export default async function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  if (!BOT_UA.test(ua) || !API_BASE_URL) return undefined;

  const slug = new URL(request.url).pathname.split("/").pop();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products/${encodeURIComponent(slug)}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) return undefined;
    const product = await response.json();
    return new Response(renderHtml(product), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch {
    return undefined;
  }
}
