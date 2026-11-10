import { request } from "./client";

// `{ awaiting, reviewed }` for the signed-in customer.
//   awaiting — one entry per product from a delivered order they haven't
//              reviewed (newest delivery first): product_id, product_name,
//              variant_name, quantity, product_slug (null once off sale),
//              image_url, order_number, delivered_at.
//   reviewed — their reviews, newest first, with moderation `status`
//              (pending | approved | rejected | hidden).
// Reviews themselves are written on the product page (`submitReview`).
export function listMyReviews(accessToken) {
  return request("/api/v1/users/me/reviews", { token: accessToken });
}
