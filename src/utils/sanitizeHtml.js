import DOMPurify from "dompurify";

// Shared between the admin's rich-text description editor (write path) and
// the storefront's product page (read path) — one whitelist, so a tag the
// editor can produce is never one the storefront then strips back out.
const DESCRIPTION_HTML_OPTIONS = {
  ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "a"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

export function sanitizeDescriptionHtml(html) {
  return DOMPurify.sanitize(html ?? "", DESCRIPTION_HTML_OPTIONS);
}

// For contexts that want words, not markup — a <meta name="description">
// tag or a JSON-LD description must never contain a literal "<p>" that a
// browser or crawler won't render for you. Whitespace left behind by
// stripped block tags is collapsed rather than shown as-is.
export function descriptionToPlainText(html) {
  return sanitizeDescriptionHtml(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
