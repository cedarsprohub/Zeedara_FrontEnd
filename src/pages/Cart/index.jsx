import { Link } from "react-router-dom";
import CartItemList from "../../components/navbar/CartDrawer/CartItemList";
import CartSummaryPanel from "../../components/cart/CartSummaryPanel";
import YouMayAlsoLike from "../../components/shared/YouMayAlsoLike";
import { useCart } from "../../context/CartContext.js";

function Cart() {
  const {
    items,
    subtotal,
    hasIssues,
    isLoading,
    isMutating,
    error,
    isAuthenticated,
    setItemQuantity,
    removeItem,
  } = useCart();

  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";

  const change = (itemId, quantity) =>
    setItemQuantity(itemId, quantity).catch(() => {});
  const remove = (itemId) => removeItem(itemId).catch(() => {});

  return (
    <div className={`mx-auto max-w-[1920px] ${sidePadding} py-8`}>
      <h1 className="mb-4 text-2xl font-semibold text-black">Cart Summary</h1>

      {error && (
        <p className="mb-6 bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
          {error}
        </p>
      )}

      {/* Checkout takes the whole cart — `CheckoutRequest` has no item subset —
          so there are deliberately no per-line checkboxes here. A selection
          that the order ignored would misstate what's being charged.

          No sign-in gate either: the cart is filled signed out and only checkout
          needs a session. */}
      {isLoading ? (
        <p className="mb-16 py-16 text-center text-sm text-gray-500">
          Loading your cart…
        </p>
      ) : items.length === 0 ? (
        <div className="mb-16 flex flex-col items-center gap-4 py-16">
          <p className="text-sm text-gray-500">Your cart is empty.</p>
          <Link
            to="/products"
            className="bg-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-white transition-opacity hover:opacity-90"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <CartItemList
            items={items}
            onSetQuantity={change}
            onRemove={remove}
            disabled={isMutating}
          />
          <CartSummaryPanel
            subtotal={subtotal}
            hasIssues={hasIssues}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}

      <YouMayAlsoLike />
    </div>
  );
}

export default Cart;
