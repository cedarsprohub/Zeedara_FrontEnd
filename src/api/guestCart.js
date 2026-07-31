import { getProduct } from "./catalog";
import { toAmount } from "../utils/formatCurrency";
import { variantLabel } from "../utils/product";

// The signed-out cart.
//
// Every /api/v1/cart route requires a bearer token, so a visitor who hasn't
// signed in yet keeps their cart here and it is replayed into the server cart at
// sign-in (see CartProvider). Checkout is untouched: it still runs server-side,
// still needs a session, and still prices the order from the server's own cart.
//
// What's stored is identity only — which variant, how many. No money is
// persisted: the view below is priced from the public catalog on every read, so
// an edited storage entry can change what's in the cart but never what it costs.

const STORAGE_KEY = "zeedara_guest_cart";
// A signed-out cart is a holding area, not an inventory system. The caps keep a
// scripted or accidental loop from filling storage.
const MAX_LINES = 40;
const MAX_QUANTITY = 99;

// Variant ids are opaque — string uuids today, but compared as text so a numeric
// id that round-trips through JSON still matches.
const sameVariant = (a, b) => String(a) === String(b);

const isVariantId = (value) =>
  (typeof value === "string" && value.length > 0) || Number.isFinite(value);

function clampQuantity(value) {
  const quantity = Math.trunc(Number(value));
  if (!Number.isFinite(quantity) || quantity < 1) return 1;
  return Math.min(quantity, MAX_QUANTITY);
}

// Anything malformed is dropped rather than trusted: this is the one input to
// the cart that a visitor can edit by hand.
export function readGuestLines() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (line) =>
          line &&
          typeof line.slug === "string" &&
          line.slug &&
          isVariantId(line.variantId),
      )
      .slice(0, MAX_LINES)
      .map((line) => ({
        slug: line.slug,
        variantId: line.variantId,
        quantity: clampQuantity(line.quantity),
      }));
  } catch {
    return [];
  }
}

export function writeGuestLines(lines) {
  try {
    if (lines.length === 0) localStorage.removeItem(STORAGE_KEY);
    else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines.slice(0, MAX_LINES)));
    }
  } catch {
    // Private-mode storage failures shouldn't break shopping — the cart just
    // won't survive a reload.
  }
}

export function clearGuestLines() {
  writeGuestLines([]);
}

// Adding a variant that's already there stacks the quantity, which is what
// POST /cart/items does.
export function addGuestLine(lines, { slug, variantId, quantity = 1 }) {
  const existing = lines.find((line) => sameVariant(line.variantId, variantId));

  if (existing) {
    return lines.map((line) =>
      sameVariant(line.variantId, variantId)
        ? { ...line, quantity: clampQuantity(line.quantity + clampQuantity(quantity)) }
        : line,
    );
  }

  if (lines.length >= MAX_LINES) {
    throw new Error("Your cart is full. Sign in to keep adding items.");
  }

  return [...lines, { slug, variantId, quantity: clampQuantity(quantity) }];
}

// Quantity 0 means "remove", matching the signed-in path.
export function setGuestLineQuantity(lines, variantId, quantity) {
  if (quantity < 1) return removeGuestLine(lines, variantId);
  return lines.map((line) =>
    sameVariant(line.variantId, variantId)
      ? { ...line, quantity: clampQuantity(quantity) }
      : line,
  );
}

export function removeGuestLine(lines, variantId) {
  return lines.filter((line) => !sameVariant(line.variantId, variantId));
}

export function emptyGuestCart() {
  return {
    cart_id: null,
    items: [],
    item_count: 0,
    subtotal_ngn: 0,
    has_issues: false,
  };
}

/**
 * Prices the stored lines from the public catalog and returns the same shape as
 * the server's `CartView`, so every cart screen renders a signed-out cart and a
 * signed-in one through one code path.
 *
 * Also returns the lines worth keeping: an option the catalog no longer sells is
 * pruned, while a line whose product simply couldn't be fetched is kept and
 * reported, so a flaky network never silently shortens someone's cart.
 */
export async function buildGuestCartView(lines) {
  if (lines.length === 0) {
    return { view: emptyGuestCart(), lines, error: null };
  }

  // One request per product, not per line, and `catalogCache` de-dupes those
  // further against whatever the page already fetched.
  const slugs = [...new Set(lines.map((line) => line.slug))];
  const responses = await Promise.all(
    slugs.map((slug) =>
      getProduct(slug).then(
        (product) => product,
        () => null,
      ),
    ),
  );
  const products = new Map(slugs.map((slug, index) => [slug, responses[index]]));

  const items = [];
  const kept = [];
  let unreachable = false;

  for (const line of lines) {
    const product = products.get(line.slug);

    if (!product) {
      unreachable = true;
      kept.push(line);
      continue;
    }

    const variant = (product.variants ?? []).find((option) =>
      sameVariant(option.id, line.variantId),
    );
    // The product loaded but this option is gone — there's nothing to price.
    if (!variant) continue;

    kept.push(line);

    const unitPrice = toAmount(variant.price_ngn);
    const stockAvailable =
      variant.status === "active"
        ? Math.max(0, Math.trunc(variant.stock_quantity ?? 0))
        : 0;

    items.push({
      // Guest lines are addressed by variant, so the id the cart screens pass
      // back to `setItemQuantity`/`removeItem` is the variant id.
      id: line.variantId,
      variant_id: line.variantId,
      product_name: product.name,
      variant_name: variantLabel(variant),
      sku: variant.sku,
      quantity: line.quantity,
      unit_price_ngn: unitPrice,
      line_total_ngn: unitPrice * line.quantity,
      available: stockAvailable >= line.quantity,
      stock_available: stockAvailable,
      // Nothing to compare against: the price is read fresh every time.
      price_changed: false,
      slug: line.slug,
    });
  }

  return {
    view: {
      cart_id: null,
      items,
      item_count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal_ngn: items.reduce((total, item) => total + item.line_total_ngn, 0),
      has_issues: items.some((item) => !item.available),
    },
    lines: kept,
    error: unreachable
      ? "Some items in your cart couldn't be loaded. Refresh to try again."
      : null,
  };
}
