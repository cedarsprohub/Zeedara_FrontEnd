// Routes and the API's enum values for skincare consultations, with the
// labels the forms and cards show for them.

export const LIST_ROUTE = "/account/skincare-consultations";
export const NEW_ROUTE = "/account/skincare-consultations/new";

// API enum value → label. Order is the order the form shows them in.
export const SKIN_TYPES = [
  ["oily", "Oily"],
  ["dry", "Dry"],
  ["combination", "Combination"],
  ["sensitive", "Sensitive"],
  ["normal", "Normal"],
  ["acne_prone", "Acne-prone"],
];

export const CONCERNS = [
  ["acne", "Acne and breakouts"],
  ["dark_spots", "Dark spots"],
  ["hyperpigmentation", "Hyperpigmentation"],
  ["uneven_tone", "Uneven skin tone"],
  ["texture", "Rough texture"],
  ["sensitivity", "Skin sensitivity"],
  ["dryness", "Dryness"],
  ["fine_lines", "Fine lines"],
  ["oily_skin", "Oily skin"],
  ["other", "Others"],
];

export const AVAILABILITY = [
  ["weekday_mornings", "Weekday mornings"],
  ["weekday_afternoons", "Weekday afternoons"],
  ["weekday_evenings", "Weekday evenings"],
  ["saturdays", "Saturdays"],
  ["any_day", "Any day"],
];

// The API caps concerns at five.
export const MAX_CONCERNS = 5;

export const labelFor = (pairs, value) =>
  pairs.find(([key]) => key === value)?.[1] ?? value;
