// Shared delivery constants for the checkout and address-book forms.

export const NIGERIAN_STATES = [
  "Abia",
  "Abuja (FCT)",
  "Anambra",
  "Delta",
  "Enugu",
  "Kano",
  "Lagos",
  "Ogun",
  "Oyo",
  "Rivers",
];

// How many addresses a customer may keep. A store rule, enforced in the UI —
// the API doesn't cap the collection, so treat this as a guard rather than a
// guarantee.
export const MAX_SAVED_ADDRESSES = 4;

// `delivery_method` is a free-text field on the API (max 120 chars); these are
// the options the store offers.
export const DELIVERY_METHODS = [
  "Home Address",
  "Office Address",
  "Pickup Station",
];
