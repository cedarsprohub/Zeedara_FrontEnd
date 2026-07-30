import { useCallback, useEffect, useRef, useState } from "react";
import { CartContext, CartAuthRequiredError } from "./CartContext.js";
import { useAuth } from "./AuthContext.js";
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../api/cart";
import { toAmount } from "../utils/formatCurrency";

// The server hands back a cart id that later calls pass as `cart_id`. It's kept
// here (and in storage, so a reload doesn't start a second cart) but it is not a
// credential: every cart route also requires the bearer token, and the id is
// cleared on sign-out so the next person to use this browser can't inherit it.
const CART_ID_KEY = "zeedara_cart_id";

function readStoredCartId() {
  try {
    return localStorage.getItem(CART_ID_KEY) || null;
  } catch {
    return null;
  }
}

function writeStoredCartId(cartId) {
  try {
    if (cartId) localStorage.setItem(CART_ID_KEY, cartId);
    else localStorage.removeItem(CART_ID_KEY);
  } catch {
    // Private-mode storage failures shouldn't break shopping — the in-memory
    // id still carries the session.
  }
}

export function CartProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();

  // What's loaded, and whose session it was loaded for. Tagging the cart with
  // its token means a sign-out or an account switch can never surface the
  // previous session's cart: it's derived away rather than cleared later.
  // (The token is already React state in AuthProvider, so this holds nothing
  // new.)
  const [loaded, setLoaded] = useState({ token: null, cart: null, error: null });
  const [isMutating, setIsMutating] = useState(false);
  // The drawer lives here rather than in the navbar so that adding from a
  // product card or the detail page can open it — that panel sliding out is the
  // confirmation the item landed.
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isCurrent = Boolean(accessToken) && loaded.token === accessToken;
  const cart = isCurrent ? loaded.cart : null;
  const error = isCurrent ? loaded.error : null;
  const isLoading = Boolean(accessToken) && !isCurrent;

  const cartIdRef = useRef(readStoredCartId());

  // Every endpoint answers with the whole CartView, so state is replaced, never
  // patched. Quantities, line totals and the subtotal are always the server's.
  const applyCart = useCallback((view, token) => {
    setLoaded({ token, cart: view, error: null });
    if (view?.cart_id && view.cart_id !== cartIdRef.current) {
      cartIdRef.current = view.cart_id;
      writeStoredCartId(view.cart_id);
    }
    return view;
  }, []);

  const load = useCallback(
    async (token) => {
      try {
        return applyCart(
          await getCart({ cartId: cartIdRef.current, accessToken: token }),
          token,
        );
      } catch (err) {
        // A stored id the server won't accept (stale, or belonging to a cart
        // that's been checked out) shouldn't leave the shopper cartless —
        // forget it and let the server open a fresh one.
        if (cartIdRef.current) {
          cartIdRef.current = null;
          writeStoredCartId(null);
          try {
            return applyCart(await getCart({ accessToken: token }), token);
          } catch (retryErr) {
            setLoaded({ token, cart: null, error: retryErr.message });
            return null;
          }
        }
        setLoaded({ token, cart: null, error: err.message });
        return null;
      }
    },
    [applyCart],
  );

  useEffect(() => {
    if (!accessToken) {
      // Signed out: forget the id so the next person on this browser can't
      // inherit the cart it points at. The cart itself is derived above.
      cartIdRef.current = null;
      writeStoredCartId(null);
      return;
    }
    load(accessToken);
  }, [accessToken, load]);

  // Wraps a mutation so callers get one busy flag and a consistent guard. The
  // error is re-thrown as well as stored, so a screen can react to a specific
  // failure (out of stock, sign-in needed) instead of only showing a banner.
  const mutate = useCallback(
    async (operation) => {
      if (!accessToken) throw new CartAuthRequiredError();
      setIsMutating(true);
      try {
        return applyCart(await operation(accessToken), accessToken);
      } catch (err) {
        setLoaded((prev) => ({ ...prev, error: err.message }));
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken, applyCart],
  );

  const addItem = useCallback(
    (variantId, quantity = 1) =>
      mutate((token) =>
        addCartItem({
          variantId,
          quantity,
          cartId: cartIdRef.current,
          accessToken: token,
        }),
      ),
    [mutate],
  );

  // Quantity 0 means "remove" — the update endpoint's minimum is 1.
  const setItemQuantity = useCallback(
    (itemId, quantity) =>
      mutate((token) =>
        quantity < 1
          ? removeCartItem({
              itemId,
              cartId: cartIdRef.current,
              accessToken: token,
            })
          : updateCartItem({
              itemId,
              quantity,
              cartId: cartIdRef.current,
              accessToken: token,
            }),
      ),
    [mutate],
  );

  const removeItem = useCallback(
    (itemId) =>
      mutate((token) =>
        removeCartItem({
          itemId,
          cartId: cartIdRef.current,
          accessToken: token,
        }),
      ),
    [mutate],
  );

  const refresh = useCallback(
    () => (accessToken ? load(accessToken) : Promise.resolve(null)),
    [accessToken, load],
  );

  const items = cart?.items ?? [];

  const value = {
    cart,
    cartId: cart?.cart_id ?? null,
    items,
    // `item_count` is the server's tally; the fallback only covers the window
    // before the first load resolves.
    itemCount: cart?.item_count ?? 0,
    subtotal: toAmount(cart?.subtotal_ngn),
    // True when a line is unavailable, short on stock, or has been repriced
    // since it was added. Checkout is blocked until it clears.
    hasIssues: Boolean(cart?.has_issues),
    isLoading,
    isMutating,
    error,
    isAuthenticated,
    addItem,
    setItemQuantity,
    removeItem,
    refresh,
    clearError: () => setLoaded((prev) => ({ ...prev, error: null })),
    isDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    // Lets a product card show a stepper for a line it just added.
    findItemByVariant: (variantId) =>
      items.find((item) => item.variant_id === variantId) ?? null,
    // Fallback for a card that has no variant id of its own — after a reload,
    // for instance. `ProductListItem` carries no variants, and cart lines
    // identify their product only by name, so that's the join. A product with
    // two variants in the cart matches its first line; managing those belongs on
    // the detail or cart page anyway.
    findItemByProductName: (productName) =>
      items.find((item) => item.product_name === productName) ?? null,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
