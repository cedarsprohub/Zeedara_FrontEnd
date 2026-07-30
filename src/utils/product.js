import placeholderImage from "../assets/ui/sampleImg.png";
import { toAmount } from "./formatCurrency";

// Shared shaping for catalog responses. `ProductListItem` carries only
// `min_price` and `media`; the full `ProductPublic` adds `variants`, where the
// real per-variant pricing lives.

export { placeholderImage };

export function primaryImageUrl(media) {
  if (!Array.isArray(media) || media.length === 0) return placeholderImage;
  const images = media.filter((item) => item.media_type === "image");
  const pool = images.length ? images : media;
  const primary = pool.find((item) => item.is_primary);
  return (primary ?? pool[0]).url || placeholderImage;
}

// Ordered image URLs for the detail gallery, primary first.
export function galleryImages(media) {
  if (!Array.isArray(media)) return [placeholderImage];
  const images = media
    .filter((item) => item.media_type === "image" && item.url)
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((item) => item.url);
  return images.length ? images : [placeholderImage];
}

// A variant is only worth offering when it's active and actually in stock.
export function purchasableVariants(variants) {
  if (!Array.isArray(variants)) return [];
  return variants.filter(
    (variant) => variant.status === "active" && variant.stock_quantity > 0,
  );
}

// `compare_at_price_ngn` is the "was" price. Only a genuine markdown counts.
export function discountPercent(priceNgn, compareAtNgn) {
  const price = toAmount(priceNgn);
  const compareAt = toAmount(compareAtNgn);
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

// Variants are named by the API; `option_values` is the fallback for ones that
// aren't (e.g. `{ Color: "Black", Length: "20\"" }`).
export function variantLabel(variant) {
  if (!variant) return "";
  if (variant.name) return variant.name;
  const values = Object.values(variant.option_values ?? {});
  return values.length ? values.join(" / ") : variant.sku;
}

// The cart's line description, from the same option data.
export function optionSummary(optionValues) {
  if (!optionValues) return "";
  return Object.entries(optionValues)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" / ");
}
