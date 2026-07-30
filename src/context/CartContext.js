import { createContext, useContext } from "react";

export const CartContext = createContext(null);

// Thrown by the cart mutations when there's no session. The API has no guest
// cart — every /cart route requires a bearer token — so callers catch this and
// send the shopper to /login rather than silently dropping the item.
export class CartAuthRequiredError extends Error {
  constructor() {
    super("Sign in to add items to your cart.");
    this.name = "CartAuthRequiredError";
  }
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
