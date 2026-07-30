import { request } from "./client";

// Previews what a code is worth so the customer gets feedback before they
// commit. The discount actually applied to an order is recalculated server-side
// from the `coupon_code` passed to checkout — never from this response.
export function validateCoupon({
  code,
  orderAmount,
  productIds = [],
  categoryIds = [],
}) {
  return request("/api/v1/coupons/validate", {
    method: "POST",
    body: {
      code,
      order_amount: String(orderAmount),
      product_ids: productIds,
      category_ids: categoryIds,
    },
  });
}
