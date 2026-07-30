import { buildQuery, request } from "./client";

// Every cart endpoint is authenticated — the API has no guest cart — and every
// one returns the full CartView. Callers replace their state with that response
// rather than adjusting quantities or totals locally: the server is the only
// thing that decides what a line costs.

export function getCart({ cartId, accessToken }) {
  return request(`/api/v1/cart${buildQuery({ cart_id: cartId })}`, {
    token: accessToken,
  });
}

export function addCartItem({ variantId, quantity, cartId, accessToken }) {
  return request(`/api/v1/cart/items${buildQuery({ cart_id: cartId })}`, {
    method: "POST",
    body: { variant_id: variantId, quantity },
    token: accessToken,
  });
}

export function updateCartItem({ itemId, quantity, cartId, accessToken }) {
  return request(
    `/api/v1/cart/items/${encodeURIComponent(itemId)}${buildQuery({
      cart_id: cartId,
    })}`,
    { method: "PATCH", body: { quantity }, token: accessToken },
  );
}

export function removeCartItem({ itemId, cartId, accessToken }) {
  return request(
    `/api/v1/cart/items/${encodeURIComponent(itemId)}${buildQuery({
      cart_id: cartId,
    })}`,
    { method: "DELETE", token: accessToken },
  );
}
