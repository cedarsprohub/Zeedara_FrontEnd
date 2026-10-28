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

// Money and counts arrive as typed strings. Anything unparseable reads as null
// so callers can tell "nothing entered" from a genuine zero.
export function toAmount(value) {
  const parsed = Number.parseFloat(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

// What a money field holds while it's being typed into: digits plus at most
// one decimal point with up to two places (kobo), leading zeros dropped. No
// separators — those are display-only (see formatAmountInput), so the form
// state and everything built from it stays a plain parseable number.
export function cleanAmountInput(text) {
  const [whole = "", ...rest] = String(text).replace(/[^\d.]/g, "").split(".");
  const integer = whole.replace(/^0+(?=\d)/, "");
  if (rest.length === 0) return integer;
  return `${integer || "0"}.${rest.join("").slice(0, 2)}`;
}

// A cleaned amount with thousands separators, for display: "1250000.5" →
// "1,250,000.5". A trailing "." is kept so the user can keep typing kobo.
export function formatAmountInput(raw) {
  if (!raw) return "";
  const [integer, decimals] = raw.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimals === undefined ? grouped : `${grouped}.${decimals}`;
}

// API money arrives as a decimal string ("40000.00"); the form wants what an
// admin would have typed ("40000"), so whole-naira amounts don't show ".00".
function amountToInput(value) {
  if (value == null) return "";
  const amount = Number(value);
  return Number.isFinite(amount) ? String(amount) : "";
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
    brand: "",
    category: "",
    subcategory: "",
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
    price: amountToInput(variant.price_ngn),
    stock: variant.stock_quantity != null ? String(variant.stock_quantity) : "",
    reorderPoint:
      variant.reorder_point != null ? String(variant.reorder_point) : "",
  };
}

// The reverse mapping, for the create/update payload. Only a row with a
// persisted (string) id sends one back — a row added this session has
// nothing to reference yet, and the server treats an id-less entry as new.
// No `sku` here — like a product's base_sku, a variant's is server-generated
// and isn't a field either VariantCreate or VariantUpdate accepts.
function formVariantToApi(variant) {
  return {
    ...(isPersistedVariantId(variant.id) ? { id: variant.id } : {}),
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
    // A plain non-nullable integer on the API, with its own server default
    // (5) — `null` isn't a valid value for it, so a blank field omits the
    // key entirely rather than sending one, letting that default apply.
    ...(variant.reorderPoint
      ? { reorder_point: Math.round(Number(variant.reorderPoint)) }
      : {}),
  };
}

// The flat category list (each row carrying `parent_id`, same shape the
// admin Categories tree groups by) split into top-level options plus each
// one's own children — what lets the General tab offer Category and
// Subcategory as two selects instead of one flat list mixing both levels.
export function buildCategoryOptions(categories) {
  const byParent = new Map();
  categories.forEach((category) => {
    const key = category.parent_id || null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(category);
  });

  const roots = byParent.get(null) ?? [];
  return roots.map((root) => ({
    value: root.id,
    label: root.name,
    children: (byParent.get(root.id) ?? []).map((child) => ({
      value: child.id,
      label: child.name,
    })),
  }));
}

// Maps a fetched admin Product (GET /admin/products/{id}) onto the form the
// drawer edits. `category`/`subcategory` hold the real category_id/
// subcategory_id uuids directly — the API carries them as two independent
// fields, not a parent/child pair to derive from one id.
export function productToForm(product) {
  if (!product) return emptyProductForm();
  return {
    ...emptyProductForm(),
    name: product.name ?? "",
    brand: product.brand ?? "",
    category: product.category_id ?? "",
    subcategory: product.subcategory_id ?? "",
    hairOrigin: fromApiHairOrigin(product.hair_origin),
    weight: fromApiWeightBand(product.weight_band),
    tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    description: product.description ?? "",
    price: amountToInput(product.min_price),
    compareAt: amountToInput(product.compare_at_price),
    unitCost: amountToInput(product.unit_cost),
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

// Fields the create and update payloads share. `category_id`/`subcategory_id`
// are sent as two separate fields, matching the API — a product's category
// is never encoded by pointing `category_id` at the subcategory itself.
function baseProductFields(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    // Blank stands for the storefront's single default brand rather than an
    // empty string — there's no multi-brand catalogue behind this yet.
    brand: form.brand.trim() || null,
    category_id: form.category || null,
    subcategory_id: form.subcategory || null,
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

// The status a save sends. `asDraft` is the "Save as draft" button, which
// always lands on draft whatever the toggle says. Otherwise the publish
// toggle decides — except that an archived row stays archived when the
// toggle is off, rather than every edit quietly restoring it to draft.
// `originalStatus` is the raw (lowercase) status from before this edit.
function payloadStatus(form, { asDraft, originalStatus }) {
  if (asDraft) return "draft";
  if (form.isPublished) return "active";
  return originalStatus === "archived" ? "archived" : "draft";
}

// Whether a save should go live — the stricter validation (and the server's
// "needs an active variant with a price" rule) only applies when it does.
export function isPublishing(form, { asDraft = false } = {}) {
  return !asDraft && form.isPublished;
}

// POST /admin/products takes `status` directly: omitted or "draft" saves a
// draft that needs nothing but a name, "active" publishes in the same call
// (held to the same rules as POST .../publish). It also takes price_ngn/
// compare_at_price_ngn/stock_quantity at the top level, to seed the implicit
// default variant when `variants` is left out of the request entirely — the
// server's fallback only fires on a missing key with a price present, so
// `variants` is omitted rather than sent as `[]`, and a blank price omits
// `price_ngn` too, letting a draft be created bare instead of with a
// zero-priced placeholder variant.
export function buildCreatePayload(form, { asDraft = false } = {}) {
  const price = toAmount(form.price);
  const compareAt = toAmount(form.compareAt);
  const { variants, ...rest } = baseProductFields(form);

  return {
    ...rest,
    status: payloadStatus(form, { asDraft }),
    ...(variants.length > 0 ? { variants } : {}),
    ...(price !== null
      ? {
          price_ngn: String(price),
          compare_at_price_ngn:
            compareAt !== null && compareAt > price ? String(compareAt) : null,
          stock_quantity: 0,
        }
      : {}),
  };
}

// PATCH /admin/products/{id} carries `status` the same way — there's no
// per-variant seeding to do on an edit, since real variants already exist.
export function buildUpdatePayload(form, { originalStatus, asDraft = false } = {}) {
  return {
    ...baseProductFields(form),
    status: payloadStatus(form, { asDraft, originalStatus }),
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
