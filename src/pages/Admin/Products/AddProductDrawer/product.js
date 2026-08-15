// Derivations shared by the add-product tabs and the drawer shell. Kept out of
// the component files so each of those exports only its component.

import {
  fromApiHairOrigin,
  fromApiWeightBand,
  toApiHairOrigin,
  toApiWeightBand,
} from "../data";

// A product's URL is its slug, so it follows the name rather than being typed:
// lowercased, punctuation dropped, runs of spaces collapsed to single hyphens.
export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Base SKU is derived the same way the URL is — from the name, live, rather
// than typed — so it's a deterministic digest of the name rather than a
// random number: retyping the same name always reproduces the same code,
// and a small change to the name produces a different one. The catalogue's
// existing SKUs are "ZD-" plus three digits, so the digest is folded into
// that same range instead of inventing a new shape.
export function generateSku(name) {
  const trimmed = name.trim().toUpperCase();
  if (!trimmed) return "";
  let hash = 0;
  for (let index = 0; index < trimmed.length; index += 1) {
    hash = (hash * 31 + trimmed.charCodeAt(index)) >>> 0;
  }
  return `ZD-${100 + (hash % 900)}`;
}

// Money and counts arrive as typed strings. Anything unparseable reads as null
// so callers can tell "nothing entered" from a genuine zero.
export function toAmount(value) {
  const parsed = Number.parseFloat(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

// The three figures under the pricing inputs are all derived, so they're
// computed rather than held in state where they could drift from the prices.
export function pricingSummary({ price, compareAt, unitCost }) {
  const selling = toAmount(price);
  const was = toAmount(compareAt);
  const cost = toAmount(unitCost);

  const profit = selling !== null && cost !== null ? selling - cost : null;
  return {
    // Margin is profit over the selling price, not over cost.
    margin: profit !== null && selling ? (profit / selling) * 100 : null,
    profit,
    discount:
      was && selling !== null && was > 0 ? ((was - selling) / was) * 100 : null,
  };
}

// The blank slate for the drawer form. A function rather than a shared object
// literal, so opening the drawer twice never hands out the same array/object
// instances for `variants` and `images`.
export function emptyProductForm() {
  return {
    name: "",
    sku: "",
    brand: "",
    category: "",
    hairOrigin: "Not applicable",
    weight: "",
    tags: "",
    description: "",
    price: "",
    compareAt: "",
    unitCost: "",
    variants: [],
    images: [],
    seoTitle: "",
    metaDescription: "",
    isPublished: true,
    isFeatured: true,
  };
}

// A locally-added variant's id is a small counter number (see nextLocalId in
// VariantsTab.jsx); one already saved on the server carries its real uuid
// string. That type difference is also how the payload builder below knows
// which rows to send an `id` for at all.
export function isPersistedVariantId(id) {
  return typeof id === "string";
}

// GET /admin/products/{id}'s variant shape → the editor's shape. The
// attribute fields are named identically on both sides except for `color`,
// which the API splits into `color_name`/`color_hex`.
function apiVariantToForm(variant) {
  return {
    id: variant.id,
    length: variant.length ?? "",
    texture: variant.texture ?? "",
    color: variant.color_name
      ? { name: variant.color_name, hex: variant.color_hex ?? "" }
      : null,
    laceType: variant.lace_type ?? "",
    capSize: variant.cap_size ?? "",
    density: variant.density ?? "",
    sizeShade: variant.size_shade ?? "",
    sku: variant.sku ?? "",
    price: variant.price_ngn != null ? String(variant.price_ngn) : "",
    stock: variant.stock_quantity != null ? String(variant.stock_quantity) : "",
    reorderPoint:
      variant.reorder_point != null ? String(variant.reorder_point) : "",
  };
}

// The reverse mapping, for the create/update payload. Only a row with a
// persisted (string) id sends one back — a row added this session has
// nothing to reference yet, and the server treats an id-less entry as new.
function formVariantToApi(variant) {
  return {
    ...(isPersistedVariantId(variant.id) ? { id: variant.id } : {}),
    sku: variant.sku.trim(),
    status: "active",
    length: variant.length || null,
    texture: variant.texture || null,
    color_name: variant.color?.name ?? null,
    color_hex: variant.color?.hex ?? null,
    lace_type: variant.laceType || null,
    cap_size: variant.capSize || null,
    density: variant.density || null,
    size_shade: variant.sizeShade || null,
    price_ngn: String(toAmount(variant.price) ?? 0),
    compare_at_price_ngn: null,
    stock_quantity: Math.max(0, Math.round(Number(variant.stock) || 0)),
    reorder_point: variant.reorderPoint ? Math.round(Number(variant.reorderPoint)) : null,
  };
}

// Maps a fetched admin Product (GET /admin/products/{id}) onto the form the
// drawer edits. `category` holds the real category_id uuid directly — the
// General tab's select now runs on the real catalogue (see useCategories.js),
// so there's no name-as-id stand-in to undo here anymore.
export function productToForm(product) {
  if (!product) return emptyProductForm();
  return {
    ...emptyProductForm(),
    name: product.name ?? "",
    sku: product.base_sku ?? "",
    brand: product.brand ?? "",
    category: product.category_id ?? "",
    hairOrigin: fromApiHairOrigin(product.hair_origin),
    weight: fromApiWeightBand(product.weight_band),
    tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    description: product.description ?? "",
    price: product.min_price != null ? String(product.min_price) : "",
    compareAt:
      product.compare_at_price != null ? String(product.compare_at_price) : "",
    unitCost: product.unit_cost != null ? String(product.unit_cost) : "",
    variants: Array.isArray(product.variants)
      ? product.variants.map(apiVariantToForm)
      : [],
    // Already-uploaded media carries its real id and url; `isPersisted`
    // marks it so MediaTab knows a removal there means DELETE, not just
    // revoking a local object URL.
    images: Array.isArray(product.media)
      ? product.media.map((item) => ({
          id: item.id,
          name: item.url.split("/").pop() || "image",
          url: item.url,
          isPersisted: true,
        }))
      : [],
    seoTitle: product.seo_title ?? "",
    metaDescription: product.meta_description ?? "",
    isPublished: product.status === "active",
    isFeatured: Boolean(product.is_featured),
  };
}

// Fields the create and update payloads share. `category_id` is sent as-is —
// it's the real uuid straight from the Category select now, not a name
// standing in for one.
function baseProductFields(form) {
  return {
    name: form.name.trim(),
    base_sku: form.sku.trim() || null,
    description: form.description.trim() || null,
    // Blank stands for the storefront's single default brand rather than an
    // empty string — there's no multi-brand catalogue behind this yet.
    brand: form.brand.trim() || null,
    category_id: form.category || null,
    hair_origin: toApiHairOrigin(form.hairOrigin),
    weight_band: form.weight ? toApiWeightBand(form.weight) : null,
    tags: form.tags
      ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [],
    seo_title: form.seoTitle || null,
    meta_description: form.metaDescription || null,
    is_featured: form.isFeatured,
    unit_cost: form.unitCost ? String(toAmount(form.unitCost) ?? 0) : null,
    collection_ids: [],
    variants: form.variants.map(formVariantToApi),
  };
}

// POST /admin/products has no `status` field at all — a new product always
// starts as a draft server-side, so the drawer publishes it as a second
// call afterwards when the toggle is on (see index.jsx). It does take
// price_ngn/compare_at_price_ngn/stock_quantity at the top level, though,
// to seed the implicit default variant when `variants` comes back empty.
export function buildCreatePayload(form) {
  const price = toAmount(form.price) ?? 0;
  const compareAt = toAmount(form.compareAt);

  return {
    ...baseProductFields(form),
    price_ngn: String(price),
    compare_at_price_ngn:
      compareAt !== null && compareAt > price ? String(compareAt) : null,
    stock_quantity: 0,
  };
}

// PATCH /admin/products/{id} carries `status` directly instead — there's no
// per-variant seeding to do on an edit, since real variants already exist.
// `originalStatus` is the raw (lowercase) status the product had before this
// edit — an archived row stays archived when the publish toggle is off,
// rather than every edit quietly restoring it to draft.
export function buildUpdatePayload(form, { originalStatus } = {}) {
  return {
    ...baseProductFields(form),
    status: form.isPublished
      ? "active"
      : originalStatus === "archived"
        ? "archived"
        : "draft",
  };
}

// Description is rich-text HTML, so an editor the admin never typed into can
// still hold markup like "<p><br></p>" — non-empty as a string, empty to
// look at. Required-field validation checks this instead of a plain
// `.trim()`, which that stray markup would pass.
export function hasVisibleText(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim() !== "";
}

// Total units across the matrix — the figure the variants footer reports and
// the one the created product carries as its stock.
export function unitsTotal(variants) {
  return variants.reduce(
    (sum, variant) => sum + (Number(variant.stock) || 0),
    0,
  );
}

// The variant row has no free-text name — it's composed from whichever
// attributes were picked in the editor, in the same order the Figma matrix
// groups them: identity on the first line, fit on the second. A variant with
// nothing picked yet reads as "Untitled variant" rather than a blank row.
export function describeVariant(variant) {
  const title = [variant.length, variant.color?.name, variant.texture, variant.sizeShade]
    .filter(Boolean)
    .join(" · ");
  const subtitle = [variant.laceType, variant.density, variant.capSize]
    .filter(Boolean)
    .join(" · ");
  return title ? { title, subtitle } : { title: "Untitled variant", subtitle: "" };
}
