// schema.org builders.
//
// Everything here is derived from data already on screen. That's the rule Google
// enforces: structured data that claims a price, a rating or a stock status the
// page doesn't show is a manual-action risk, so nothing below invents a field —
// where the API has no answer, the property is omitted.

import { SITE_NAME, SITE_URL, absoluteUrl, truncate } from "./seo";
import { toAmount } from "./formatCurrency";
import { primaryImageUrl, variantLabel } from "./product";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/**
 * `trail` is the visible breadcrumb, in order, as `[{ name, path }]`. The last
 * item is the current page and needs no path.
 */
export function breadcrumbSchema(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
    })),
  };
}

// Only `active` variants are purchasable, so they're the only ones that may
// contribute a price.
function sellableVariants(product) {
  return (product.variants ?? []).filter(
    (variant) => variant.status === "active",
  );
}

function offersFor(product, variants) {
  const prices = variants
    .map((variant) => toAmount(variant.price_ngn))
    .filter((price) => price > 0);

  if (prices.length === 0) return null;

  const url = absoluteUrl(`/products/${product.slug}`);
  const inStock = variants.some((variant) => (variant.stock_quantity ?? 0) > 0);
  const availability = `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`;

  // A single variant is a single Offer; several become an AggregateOffer, which
  // is what lets a range show in results rather than one arbitrary variant price.
  if (variants.length === 1) {
    return {
      "@type": "Offer",
      url,
      priceCurrency: "NGN",
      price: prices[0],
      availability,
      ...(variants[0].sku ? { sku: variants[0].sku } : {}),
    };
  }

  return {
    "@type": "AggregateOffer",
    url,
    priceCurrency: "NGN",
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    offerCount: prices.length,
    availability,
  };
}

/** `summary` is the rating summary from `GET /products/{id}/reviews`. */
export function productSchema(product, summary) {
  const variants = sellableVariants(product);
  const offers = offersFor(product, variants);

  const reviewCount = Number(summary?.review_count ?? 0);
  const ratingValue = Number(summary?.average_rating ?? 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluteUrl(`/products/${product.slug}`)}#product`,
    name: product.name,
    url: absoluteUrl(`/products/${product.slug}`),
    image: absoluteUrl(primaryImageUrl(product.media)),
    ...(product.description
      ? { description: truncate(product.description, 5000) }
      : {}),
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand } }
      : {}),
    ...(product.product_type ? { category: product.product_type } : {}),
    // The list endpoint has no SKU of its own; a single-variant product's SKU is
    // unambiguous, a multi-variant one's isn't, so it's left to the offers.
    ...(variants.length === 1 && variants[0].sku ? { sku: variants[0].sku } : {}),
    ...(offers ? { offers } : {}),
    // Only when there are real approved reviews behind it — an aggregateRating of
    // 0 from 0 reviews is exactly the kind of claim that earns a penalty.
    ...(reviewCount > 0 && ratingValue > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(ratingValue.toFixed(1)),
            reviewCount,
          },
        }
      : {}),
    ...(variants.length > 1
      ? {
          hasVariant: variants.map((variant) => ({
            "@type": "Product",
            name: `${product.name} — ${variantLabel(variant)}`,
            ...(variant.sku ? { sku: variant.sku } : {}),
          })),
        }
      : {}),
  };
}

/**
 * Listing pages. An ItemList of URLs (rather than embedded Products) is the form
 * Google recommends for a category page — the detail belongs on each product's
 * own page, which this points at.
 */
export function itemListSchema(products, { name, path }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(`/products/${product.slug}`),
    })),
  };
}

export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** The store itself, for pages that are about the business rather than a product. */
export function storeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    currenciesAccepted: "NGN",
    paymentAccepted: "Credit Card, Debit Card, Bank Transfer",
    areaServed: { "@type": "Country", name: "Nigeria" },
  };
}
