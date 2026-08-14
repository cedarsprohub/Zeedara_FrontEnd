// Derivations shared by the add-product tabs and the drawer shell. Kept out of
// the component files so each of those exports only its component.

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
