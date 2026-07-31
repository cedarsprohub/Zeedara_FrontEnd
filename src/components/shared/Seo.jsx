import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  TITLE_SUFFIX,
  absoluteUrl,
  canonicalUrl,
  truncate,
} from "../../utils/seo";

/**
 * Per-route document metadata.
 *
 * The head is written imperatively rather than rendered, because `index.html`
 * already carries a full set of defaults for crawlers that don't run JavaScript.
 * Upserting by selector *replaces* those defaults; rendering tags would append
 * to them, leaving two descriptions and letting whichever a given crawler reads
 * first win.
 *
 * Every managed tag is written on every route change, defaults included, so a
 * page that omits a prop can't inherit the last page's value — the classic SPA
 * metadata bug where a product's description sticks around on the cart.
 *
 * Note what this can and can't do: Google executes JavaScript and will see these
 * tags, but social crawlers (WhatsApp, Facebook, X, LinkedIn) don't, so link
 * previews come from the static tags in `index.html`. Per-page previews would
 * need the HTML prerendered at build time.
 */

function upsertMeta(selector, attrs) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  for (const [name, value] of Object.entries(attrs)) {
    element.setAttribute(name, value);
  }
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function Seo({
  title,
  description,
  canonical,
  image,
  type = "website",
  noindex = false,
  // One schema.org object or an array of them. Serialised into a single
  // `<script type="application/ld+json">`, replacing the previous page's.
  jsonLd = null,
  // Set for the home page, whose title is already the brand.
  exactTitle = false,
}) {
  const location = useLocation();

  // The path is a dependency rather than the whole location object: `search`
  // changes on every filter click, and the canonical deliberately ignores those.
  const pathname = location.pathname;
  const canonicalHref = canonical
    ? absoluteUrl(canonical)
    : canonicalUrl(pathname);

  const pageTitle = title
    ? exactTitle
      ? title
      : `${title}${TITLE_SUFFIX}`
    : SITE_NAME;
  const pageDescription = truncate(description || DEFAULT_DESCRIPTION);
  const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const serialisedJsonLd = jsonLd
    ? JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    : null;

  useEffect(() => {
    document.title = pageTitle;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: pageDescription,
    });

    // Written either way. Leaving it unset on indexable pages would let a
    // `noindex` from a previous route persist across a client-side navigation.
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow",
    });

    upsertLink("canonical", canonicalHref);

    const og = {
      "og:title": pageTitle,
      "og:description": pageDescription,
      "og:url": canonicalHref,
      "og:type": type,
      "og:image": imageUrl,
      "og:site_name": SITE_NAME,
    };
    for (const [property, content] of Object.entries(og)) {
      upsertMeta(`meta[property="${property}"]`, { property, content });
    }

    const twitter = {
      "twitter:card": "summary_large_image",
      "twitter:title": pageTitle,
      "twitter:description": pageDescription,
      "twitter:image": imageUrl,
    };
    for (const [name, content] of Object.entries(twitter)) {
      upsertMeta(`meta[name="${name}"]`, { name, content });
    }
  }, [pageTitle, pageDescription, canonicalHref, imageUrl, type, noindex]);

  // Structured data is its own effect so a page whose schema arrives with its
  // data (a product, once fetched) doesn't rewrite the whole head to add it.
  useEffect(() => {
    const previous = document.head.querySelectorAll(
      'script[type="application/ld+json"][data-seo]',
    );
    for (const node of previous) node.remove();

    if (!serialisedJsonLd) return undefined;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo", "");
    script.textContent = serialisedJsonLd;
    document.head.appendChild(script);

    return () => script.remove();
  }, [serialisedJsonLd]);

  return null;
}

export default Seo;
