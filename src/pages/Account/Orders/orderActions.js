import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext.js";

// Where each order item leads. The API only hands out `product_slug` while the
// product is on sale, so a null here means "no page to send them to" — callers
// hide the link rather than point at a 404.
export const productHref = (item) =>
  item?.product_slug ? `/products/${item.product_slug}` : null;

// The product page opens its reviews tab for `#reviews`; the form there checks
// eligibility itself.
export const reviewHref = (item) =>
  item?.product_slug ? `/products/${item.product_slug}#reviews` : null;

const canRebuy = (item) => Boolean(item?.product_variant_id);

/**
 * "Order again" / "Buy again": put an order's items (or one item) back in the
 * cart at their original quantities and go to it. Items whose variant no longer
 * exists are skipped; one that's now out of stock fails on its own without
 * stopping the rest. Prices are the catalog's current ones, not the order's.
 */
export function useBuyAgain() {
  const { addItem, openDrawer } = useCart();
  const navigate = useNavigate();
  const [state, setState] = useState({ pending: null, error: null });

  const buyAgain = useCallback(
    async (key, items) => {
      const rebuyable = items.filter(canRebuy);
      if (rebuyable.length === 0) {
        setState({
          pending: null,
          error: "These items are no longer available to buy.",
        });
        return;
      }

      setState({ pending: key, error: null });
      let added = 0;
      const failures = [];
      // One at a time: each add re-prices the whole cart, so running them in
      // parallel would race on the cart they're all writing to.
      for (const item of rebuyable) {
        try {
          await addItem(item.product_variant_id, item.quantity, {
            slug: item.product_slug,
          });
          added += 1;
        } catch (err) {
          failures.push(err.message);
        }
      }
      const skipped = items.length - rebuyable.length;

      // Everything made it: straight to the cart.
      if (added === items.length) {
        navigate("/cart");
        return;
      }
      // Some did: say what didn't, and show the cart where they are, rather
      // than leaving on a cart that's quietly missing items.
      if (added > 0) {
        setState({
          pending: null,
          error: [
            `Added ${added} of ${items.length} items to your cart.`,
            ...failures,
            skipped > 0 &&
              `${skipped} ${skipped === 1 ? "item is" : "items are"} no longer sold.`,
          ]
            .filter(Boolean)
            .join(" "),
        });
        openDrawer();
        return;
      }
      setState({
        pending: null,
        error: failures[0] ?? "We couldn't add these items to your cart.",
      });
    },
    [addItem, navigate, openDrawer],
  );

  return {
    buyAgain,
    pendingKey: state.pending,
    error: state.error,
    canBuyAgain: (items) => items.some(canRebuy),
  };
}
