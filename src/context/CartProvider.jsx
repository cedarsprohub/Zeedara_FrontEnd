import { useCallback, useEffect, useRef, useState } from "react";
import { CartContext } from "./CartContext.js";
import { useAuth } from "./AuthContext.js";
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../api/cart";
import {
  addGuestLine,
  buildGuestCartView,
  clearGuestLines,
  emptyGuestCart,
  readGuestLines,
  removeGuestLine,
  setGuestLineQuantity,
  writeGuestLines,
} from "../api/guestCart";
import { toAmount } from "../utils/formatCurrency";

// Two carts, one interface. Signed out, lines live in localStorage and are
// priced from the public catalog (see `api/guestCart`); signed in, the server
// owns everything. Signing in replays the stored lines into the server cart, so
// a shopper never has to authenticate to fill a cart — only to check out.
//
// The server hands back a cart id that later calls pass as `cart_id`. It's kept
// here (and in storage, so a reload doesn't start a second cart) but it is not a
// credential: every cart route also requires the bearer token, and the id is
// cleared on sign-out so the next person to use this browser can't inherit it.
const CART_ID_KEY = "zeedara_cart_id";

// State is tagged with the session it was loaded for. For the signed-out cart
// that tag is this constant; signed in it's the access token, so a sign-out or an
// account switch can never surface the previous session's cart — it's derived
// away rather than cleared later.
const GUEST = "guest";

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

function rejectedMessage(count) {
  return count === 1
    ? "One item from your cart is no longer available, so it wasn't added."
    : `${count} items from your cart are no longer available, so they weren't added.`;
}

export function CartProvider({ children }) {
  const { accessToken, isAuthenticated } = useAuth();
  const sessionKey = accessToken ?? GUEST;

  const [loaded, setLoaded] = useState(() =>
    accessToken || readGuestLines().length > 0
      ? { key: null, cart: null, error: null }
      // A signed-out visitor with nothing stored already has their whole cart:
      // it's empty. Starting there keeps the drawer from opening on a spinner.
      : { key: GUEST, cart: emptyGuestCart(), error: null },
  );
  const [isMutating, setIsMutating] = useState(false);
  // The drawer lives here rather than in the navbar so that adding from a
  // product card or the detail page can open it — that panel sliding out is the
  // confirmation the item landed.
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isCurrent = loaded.key === sessionKey;
  const cart = isCurrent ? loaded.cart : null;
  const error = isCurrent ? loaded.error : null;
  const isLoading = !isCurrent;

  const cartIdRef = useRef(readStoredCartId());

  const rememberCartId = useCallback((cartId) => {
    if (cartId && cartId !== cartIdRef.current) {
      cartIdRef.current = cartId;
      writeStoredCartId(cartId);
    }
  }, []);

  // Every endpoint answers with the whole CartView, so state is replaced, never
  // patched. Quantities, line totals and the subtotal are always priced by the
  // server — either the cart API or, signed out, the catalog.
  const applyCart = useCallback(
    (view, key) => {
      setLoaded({ key, cart: view, error: null });
      rememberCartId(view?.cart_id);
      return view;
    },
    [rememberCartId],
  );

  // The loaders return state rather than setting it, so the effect below can drop
  // a result that arrived after the session changed under it.
  const fetchGuestCart = useCallback(async () => {
    const { view, lines, error: loadError } = await buildGuestCartView(
      readGuestLines(),
    );
    // Prune anything the catalog no longer sells while we're here.
    writeGuestLines(lines);
    return { key: GUEST, cart: view, error: loadError };
  }, []);

  const fetchServerCart = useCallback(
    async (token) => {
      try {
        const view = await getCart({
          cartId: cartIdRef.current,
          accessToken: token,
        });
        rememberCartId(view?.cart_id);
        return { key: token, cart: view, error: null };
      } catch (err) {
        if (!cartIdRef.current) {
          return { key: token, cart: null, error: err.message };
        }
        // A stored id the server won't accept (stale, or belonging to a cart
        // that's been checked out) shouldn't leave the shopper cartless — forget
        // it and let the server open a fresh one.
        cartIdRef.current = null;
        writeStoredCartId(null);
        try {
          const view = await getCart({ accessToken: token });
          rememberCartId(view?.cart_id);
          return { key: token, cart: view, error: null };
        } catch (retryErr) {
          return { key: token, cart: null, error: retryErr.message };
        }
      }
    },
    [rememberCartId],
  );

  // Everything added while signed out is replayed into the server cart, in the
  // order it was added. The stored lines are cleared either way: a line the
  // server rejects (sold out since, withdrawn) is reported once rather than left
  // to fail again on every load.
  const mergeGuestCart = useCallback(
    async (token) => {
      const lines = readGuestLines();
      if (lines.length === 0) return 0;

      let rejected = 0;
      for (const line of lines) {
        try {
          // Sequential, not parallel: the first add is what opens the cart, and
          // the ones after it need the id it returns.
          const view = await addCartItem({
            variantId: line.variantId,
            quantity: line.quantity,
            cartId: cartIdRef.current,
            accessToken: token,
          });
          rememberCartId(view?.cart_id);
        } catch {
          rejected += 1;
        }
      }
      clearGuestLines();
      return rejected;
    },
    [rememberCartId],
  );

  useEffect(() => {
    let active = true;

    (async () => {
      if (!accessToken) {
        // Signed out: forget the server cart id so the next person on this
        // browser can't inherit the cart it points at.
        cartIdRef.current = null;
        writeStoredCartId(null);
        const next = await fetchGuestCart();
        if (active) setLoaded(next);
        return;
      }

      const rejected = await mergeGuestCart(accessToken);
      const next = await fetchServerCart(accessToken);
      if (!active) return;
      setLoaded(
        rejected
          ? { ...next, error: next.error ?? rejectedMessage(rejected) }
          : next,
      );
    })();

    return () => {
      active = false;
    };
  }, [accessToken, fetchGuestCart, fetchServerCart, mergeGuestCart]);

  // Wraps a mutation so callers get one busy flag. The error is re-thrown as
  // well as stored, so a screen can react to a specific failure (out of stock,
  // cart full) instead of only showing a banner.
  const mutate = useCallback(
    async (operation) => {
      setIsMutating(true);
      try {
        return applyCart(await operation(accessToken), sessionKey);
      } catch (err) {
        setLoaded((prev) => ({ ...prev, error: err.message }));
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [accessToken, sessionKey, applyCart],
  );

  // A signed-out mutation edits the stored lines and then re-prices them, so the
  // same CartView comes back whichever cart is in play.
  const commitGuestLines = useCallback(async (lines) => {
    writeGuestLines(lines);
    const { view, lines: kept, error: buildError } = await buildGuestCartView(
      lines,
    );
    writeGuestLines(kept);
    // The line is stored; only its pricing failed. Report that instead of
    // showing a cart that's missing an item it actually holds.
    if (buildError) throw new Error(buildError);
    return view;
  }, []);

  // `slug` is only needed while signed out: the catalog is addressed by slug, and
  // that's what prices a stored line.
  const addItem = useCallback(
    (variantId, quantity = 1, { slug } = {}) =>
      mutate((token) => {
        if (token) {
          return addCartItem({
            variantId,
            quantity,
            cartId: cartIdRef.current,
            accessToken: token,
          });
        }
        if (!slug) {
          throw new Error(
            "We couldn't add that item. Open the product page and try again.",
          );
        }
        return commitGuestLines(
          addGuestLine(readGuestLines(), { slug, variantId, quantity }),
        );
      }),
    [mutate, commitGuestLines],
  );

  // Quantity 0 means "remove" — the update endpoint's minimum is 1.
  const setItemQuantity = useCallback(
    (itemId, quantity) =>
      mutate((token) => {
        if (!token) {
          return commitGuestLines(
            setGuestLineQuantity(readGuestLines(), itemId, quantity),
          );
        }
        return quantity < 1
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
            });
      }),
    [mutate, commitGuestLines],
  );

  const removeItem = useCallback(
    (itemId) =>
      mutate((token) =>
        token
          ? removeCartItem({
              itemId,
              cartId: cartIdRef.current,
              accessToken: token,
            })
          : commitGuestLines(removeGuestLine(readGuestLines(), itemId)),
      ),
    [mutate, commitGuestLines],
  );

  const refresh = useCallback(async () => {
    const next = accessToken
      ? await fetchServerCart(accessToken)
      : await fetchGuestCart();
    setLoaded(next);
    return next.cart;
  }, [accessToken, fetchServerCart, fetchGuestCart]);

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
    // Adding to the cart no longer depends on this — checking out does.
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
