// The admin products screen's own constants — filter/tab options and the
// admin-form choices that aren't fetched from the API (categories are; see
// useCategories.js for those, now that a real catalogue backs this screen).

export const STATUSES = ["All", "Active", "Draft", "Archived"];

// The API's status enum is lowercase (active/draft/archived/review_ready);
// every UI surface — badges, tabs, CSV rows — uses Title Case. These two
// functions are the only place that boundary is meant to cross.
export function toApiStatus(status) {
  return status.toLowerCase();
}

export function fromApiStatus(status) {
  // "review_ready" is the one status Title Case alone doesn't already read
  // correctly for — the underscore needs to become a space too.
  return `${status}`
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const PAGE_SIZE = 12;

// Options for the Hair origin select on the General tab. Values are the
// display strings shown in the UI; the API's HairOrigin enum uses a
// different, snake_case shape (e.g. "vietnamese") — see HAIR_ORIGIN_API_VALUES
// and to/fromApiHairOrigin below for that boundary. Weight has no such list —
// see toApiWeightBand/fromApiWeightBand further down instead.
export const HAIR_ORIGINS = [
  "Not applicable",
  "Vietnamese",
  "Brazilian",
  "Peruvian",
  "Indian",
  "Cambodian",
];

const HAIR_ORIGIN_API_VALUES = {
  "Not applicable": "not_applicable",
  Vietnamese: "vietnamese",
  Brazilian: "brazilian",
  Peruvian: "peruvian",
  Indian: "indian",
  Cambodian: "cambodian",
};

export function toApiHairOrigin(displayValue) {
  return HAIR_ORIGIN_API_VALUES[displayValue] ?? null;
}

export function fromApiHairOrigin(apiValue) {
  const [display] =
    Object.entries(HAIR_ORIGIN_API_VALUES).find(
      ([, value]) => value === apiValue,
    ) ?? [];
  return display ?? "Not applicable";
}

// The API stores shipping weight as one of five fixed bands, not the exact
// figure — so the typed kg value here is bucketed into the matching band on
// submit. Editing an existing product can only recover which band it's in,
// never the number that was actually typed, so the field is seeded with that
// band's lower bound rather than inventing a more precise-looking figure.
const WEIGHT_BANDS = [
  { max: 0.5, apiValue: "under_0_5kg", lowerBoundKg: 0 },
  { max: 1, apiValue: "0_5_to_1kg", lowerBoundKg: 0.5 },
  { max: 2, apiValue: "1_to_2kg", lowerBoundKg: 1 },
  { max: 5, apiValue: "2_to_5kg", lowerBoundKg: 2 },
  { max: Infinity, apiValue: "over_5kg", lowerBoundKg: 5 },
];

export function toApiWeightBand(weightKg) {
  const kg = Number.parseFloat(weightKg);
  if (!Number.isFinite(kg) || kg < 0) return null;
  return (WEIGHT_BANDS.find((band) => kg < band.max) ?? WEIGHT_BANDS.at(-1)).apiValue;
}

export function fromApiWeightBand(apiValue) {
  const band = WEIGHT_BANDS.find((item) => item.apiValue === apiValue);
  return band ? String(band.lowerBoundKg) : "";
}

// Attribute options for the variant editor modal. As with HAIR_ORIGINS and
// WEIGHT_BANDS, the Figma frame shows only the closed selects, so these lists
// are a first pass sized to what the catalogue actually stocks.
export const VARIANT_LENGTHS = [
  '10"',
  '12"',
  '14"',
  '16"',
  '18"',
  '20"',
  '22"',
  '24"',
  '26"',
  '28"',
  '30"',
];

export const VARIANT_TEXTURES = [
  "Straight",
  "Body Wave",
  "Deep Wave",
  "Loose Wave",
  "Water Wave",
  "Kinky Curly",
];

export const VARIANT_LACE_TYPES = [
  "Lace Front",
  "Full Lace",
  "360 Lace",
  "Closure",
  "None",
];

export const VARIANT_CAP_SIZES = ['Small (21")', 'Average (22")', 'Large (23")'];

export const VARIANT_DENSITIES = ["130%", "150%", "180%", "200%"];

// The fixed swatch fan from the Figma colour picker.
export const VARIANT_COLORS = [
  { name: "Jet Black", hex: "#1c1917" },
  { name: "Off Black", hex: "#0b0b0b" },
  { name: "Dark Brown 2", hex: "#3b2a20" },
  { name: "Chocolate Brown", hex: "#5c3a21" },
  { name: "Caramel Brown", hex: "#b57a3c" },
  { name: "Sandy Blonde", hex: "#d9c39a" },
  { name: "Burgundy", hex: "#6b1b2b" },
  { name: "Copper Auburn", hex: "#9a4b1f" },
  { name: "Honey Blonde 27", hex: "#e5ddd0" },
  { name: "Chestnut Brown", hex: "#7a4b27" },
];

// Initials for the row avatar. Two words → two letters, one word → two letters
// of that word, so every badge is the same width.
export function initialsFor(name) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
