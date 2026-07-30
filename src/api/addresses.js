import { request } from "./client";

// The saved-address book. Scoped to the caller's token — there is no
// "get anyone's address by id" route, so an id alone is not a capability.

export function listAddresses(accessToken) {
  return request("/api/v1/addresses", { token: accessToken });
}

// `delivery_address` is a single free-text line (max 500) — the API replaced the
// earlier label/line1/line2 split, so the form collects one address field.
export function createAddress(
  {
    recipientName,
    phone,
    deliveryAddress,
    city,
    state,
    country = "Nigeria",
    isDefault = false,
  },
  accessToken,
) {
  return request("/api/v1/addresses", {
    method: "POST",
    body: {
      recipient_name: recipientName,
      phone,
      delivery_address: deliveryAddress,
      city: city || null,
      state: state || null,
      country,
      is_default: isDefault,
    },
    token: accessToken,
  });
}

// PATCH is partial — send only the keys that changed.
export function updateAddress(addressId, changes, accessToken) {
  return request(`/api/v1/addresses/${encodeURIComponent(addressId)}`, {
    method: "PATCH",
    body: changes,
    token: accessToken,
  });
}

export function deleteAddress(addressId, accessToken) {
  return request(`/api/v1/addresses/${encodeURIComponent(addressId)}`, {
    method: "DELETE",
    token: accessToken,
  });
}
