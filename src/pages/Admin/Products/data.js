// Placeholder catalogue for the admin products screen. There is no admin API
// yet, so the table reads from here. Counts in the page subtitle and the status
// tabs are derived from this array rather than hardcoded, so they can't drift
// out of step with the rows actually on screen.

export const PRODUCTS = [
  { sku: "ZD-031", name: "Detangling Wig Brush", category: "Tools & Accessories", price: 6861, compareAt: 8200, stock: 80, sold: 118, variants: 1, status: "Active" },
  { sku: "ZD-026", name: "SPF 50 Invisible Sunscreen Fluid", category: "Skincare", price: 21164, compareAt: 24900, stock: 346, sold: 234, variants: 1, status: "Active" },
  { sku: "ZD-020", name: "Zeedara Glow Vitamin C Serum 30ml", category: "Skincare", price: 17675, compareAt: 19500, stock: 244, sold: 46, variants: 1, status: "Active" },
  { sku: "ZD-035", name: "Skin Blur Serum Foundation", category: "Makeup", price: 12156, compareAt: 14000, stock: 452, sold: 56, variants: 4, status: "Active" },
  { sku: "ZD-001", name: "Bare Lace 13x6 Wig Lacefront", category: "Wigs", price: 385000, compareAt: 420000, stock: 0, sold: 312, variants: 12, status: "Active" },
  { sku: "ZD-004", name: "4x4 Closure Kinky Curly Wig", category: "Wigs", price: 298000, compareAt: null, stock: 18, sold: 32, variants: 8, status: "Active" },
  { sku: "ZD-007", name: "Silk Base 5x5 Closure Wig", category: "Wigs", price: 342000, compareAt: 375000, stock: 24, sold: 22, variants: 6, status: "Active" },
  { sku: "ZD-009", name: "Glueless U-Part Wig Beginner Friendly", category: "Wigs", price: 265000, compareAt: null, stock: 41, sold: 28, variants: 5, status: "Active" },
  { sku: "ZD-012", name: "Deep Wave 13x4 Frontal Unit", category: "Wigs", price: 315000, compareAt: 349000, stock: 12, sold: 22, variants: 7, status: "Active" },
  { sku: "ZD-015", name: "Raw Vietnamese Bundle Deal", category: "Bundles", price: 189000, compareAt: 215000, stock: 63, sold: 88, variants: 9, status: "Active" },
  { sku: "ZD-017", name: "Body Wave Bundle Trio", category: "Bundles", price: 156000, compareAt: null, stock: 37, sold: 64, variants: 6, status: "Draft" },
  { sku: "ZD-019", name: "Straight Bundle + Closure Set", category: "Bundles", price: 172500, compareAt: 198000, stock: 29, sold: 51, variants: 6, status: "Active" },
  { sku: "ZD-022", name: "Hydrating Rose Toner 200ml", category: "Skincare", price: 9800, compareAt: null, stock: 210, sold: 143, variants: 2, status: "Active" },
  { sku: "ZD-024", name: "Niacinamide Pore Refining Gel", category: "Skincare", price: 11400, compareAt: 13200, stock: 178, sold: 97, variants: 1, status: "Draft" },
  { sku: "ZD-028", name: "Shea Butter Body Melt", category: "Skincare", price: 7600, compareAt: null, stock: 0, sold: 205, variants: 3, status: "Archived" },
  { sku: "ZD-033", name: "Matte Lip Stain Collection", category: "Makeup", price: 8900, compareAt: 10500, stock: 126, sold: 189, variants: 8, status: "Active" },
  { sku: "ZD-037", name: "Brow Sculpt Pencil", category: "Makeup", price: 5400, compareAt: null, stock: 94, sold: 76, variants: 4, status: "Archived" },
  { sku: "ZD-041", name: "Amber Oud Eau de Parfum 50ml", category: "Fragrance", price: 47500, compareAt: 55000, stock: 58, sold: 41, variants: 2, status: "Active" },
  { sku: "ZD-043", name: "Vanilla Musk Body Mist", category: "Fragrance", price: 12800, compareAt: null, stock: 143, sold: 112, variants: 3, status: "Draft" },
  { sku: "ZD-046", name: "Wig Care Starter Kit", category: "Tools & Accessories", price: 18900, compareAt: 22000, stock: 71, sold: 63, variants: 2, status: "Active" },
];

export const STATUSES = ["All", "Active", "Draft", "Archived"];

export const CATEGORIES = [
  "All categories",
  ...[...new Set(PRODUCTS.map((product) => product.category))].sort(),
];

export const PAGE_SIZE = 12;

// Options for the two selects on the add-product form that aren't derived from
// the catalogue. The Figma frames show only the closed control, so the lists
// themselves are a first pass — the hair origins are the ones the storefront
// copy already talks about, and the weight bands match the shipping tiers.
export const HAIR_ORIGINS = [
  "Not applicable",
  "Vietnamese",
  "Brazilian",
  "Peruvian",
  "Indian",
  "Cambodian",
];

export const WEIGHT_BANDS = [
  "Under 0.5 kg",
  "0.5 – 1 kg",
  "1 – 2 kg",
  "2 – 5 kg",
  "Over 5 kg",
];

// Initials for the row avatar. Two words → two letters, one word → two letters
// of that word, so every badge is the same width.
export function initialsFor(name) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
