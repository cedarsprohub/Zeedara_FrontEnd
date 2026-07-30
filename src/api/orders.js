import { buildQuery, request } from "./client";

// Turns a cart into a pending_payment order. Notice what this does NOT send:
// no prices, no subtotal, no discount, no delivery fee. The server prices the
// order from the cart and the coupon code, and its response is the only source
// of the amount the customer is asked to pay.
export function checkout(
  {
    cartId,
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    deliveryCity,
    deliveryState,
    deliveryMethod,
    couponCode,
    customerNote,
  },
  accessToken,
) {
  return request("/api/v1/checkout", {
    method: "POST",
    body: {
      cart_id: cartId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      delivery_city: deliveryCity || null,
      delivery_state: deliveryState || null,
      delivery_method: deliveryMethod || null,
      coupon_code: couponCode || null,
      customer_note: customerNote || null,
    },
    token: accessToken,
  });
}

export function listMyOrders({ limit, offset } = {}, accessToken) {
  return request(`/api/v1/orders${buildQuery({ limit, offset })}`, {
    token: accessToken,
  });
}

// `email` is only for guest lookups; a signed-in customer is identified by the
// token, so don't pass it when one is available.
export function getOrder(orderNumber, { accessToken, email } = {}) {
  return request(
    `/api/v1/orders/${encodeURIComponent(orderNumber)}${buildQuery({
      email: accessToken ? undefined : email,
    })}`,
    { token: accessToken },
  );
}
