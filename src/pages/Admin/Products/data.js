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

// Options for the two enum selects on the General tab. Values are the
// display strings shown in the UI; the API's HairOrigin/WeightBand enums use
// a different, snake_case shape (e.g. "vietnamese", "under_0_5kg") — see the
// API_VALUES maps and to/fromApi* functions below for that boundary.
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

export const WEIGHT_BANDS = [
  "Under 0.5 kg",
  "0.5 – 1 kg",
  "1 – 2 kg",
  "2 – 5 kg",
  "Over 5 kg",
];

const WEIGHT_BAND_API_VALUES = {
  "Under 0.5 kg": "under_0_5kg",
  "0.5 – 1 kg": "0_5_to_1kg",
  "1 – 2 kg": "1_to_2kg",
  "2 – 5 kg": "2_to_5kg",
  "Over 5 kg": "over_5kg",
};

export function toApiWeightBand(displayValue) {
  return WEIGHT_BAND_API_VALUES[displayValue] ?? null;
}

export function fromApiWeightBand(apiValue) {
  const [display] =
    Object.entries(WEIGHT_BAND_API_VALUES).find(
      ([, value]) => value === apiValue,
    ) ?? [];
  return display ?? "";
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
