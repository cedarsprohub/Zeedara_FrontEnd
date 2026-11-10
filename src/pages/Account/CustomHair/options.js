// Routes and the API's enum values for custom wig requests, with the labels
// the form and cards show.

export const LIST_ROUTE = "/account/custom-hair";
export const NEW_ROUTE = "/account/custom-hair/new";
export const quoteRoute = (id) => `/account/custom-hair/${id}/quote`;

export const HAIR_PREFERENCES = [
  ["full_lace_wig", "Full Lace Wig"],
  ["lace_frontal_wig", "Lace Frontal Wig"],
  ["closure_wig", "Closure Wig"],
  ["braided_wig", "Braided Wig"],
  ["bundles", "Bundles"],
];

export const BUDGETS = [
  ["under_50k", "Below ₦50,000"],
  ["50k_to_100k", "₦50,000 - ₦100,000"],
  ["100k_to_200k", "₦100,000 - ₦200,000"],
  ["over_200k", "Above ₦200,000"],
];

export const labelFor = (pairs, value) =>
  pairs.find(([key]) => key === value)?.[1] ?? value;

// States with a quote on file (and so a quote document to download).
export const HAS_QUOTE = new Set([
  "quoted",
  "payment_pending",
  "confirmed",
  "completed",
]);

export const canPay = (status) =>
  status === "quoted" || status === "payment_pending";
