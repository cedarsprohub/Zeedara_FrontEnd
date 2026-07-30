import { X } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import CartItemList from "./CartItemList";
import Summary from "./Summary";
import { useCart } from "../../../context/CartContext.js";

function CartDrawer({ isOpen, onClose }) {
  const location = useLocation();
  const {
    items,
    itemCount,
    subtotal,
    hasIssues,
    isLoading,
    isMutating,
    error,
    isAuthenticated,
    setItemQuantity,
    removeItem,
  } = useCart();

  // Disable main page scrollbar and allow Escape to close while drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Mutations report through the context; swallow the throw so an unhandled
  // rejection doesn't escape the click handler.
  const change = (itemId, quantity) => setItemQuantity(itemId, quantity).catch(() => {});
  const remove = (itemId) => removeItem(itemId).catch(() => {});

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-50 flex h-screen w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-[450px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Your Cart ({itemCount})
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart panel"
            className="cursor-pointer p-2 -mr-2 text-gray-500 transition-colors hover:text-gray-900"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <p className="mb-4 bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
              {error}
            </p>
          )}

          {/* The API has no guest cart — every /cart route needs a token. */}
          {!isAuthenticated ? (
            <p className="py-12 text-center text-sm text-gray-500">
              <Link
                to="/login"
                state={{ from: location }}
                onClick={onClose}
                className="font-semibold text-(--primary-color) underline"
              >
                Sign in
              </Link>{" "}
              to start a cart.
            </p>
          ) : isLoading ? (
            <p className="py-12 text-center text-sm text-gray-500">
              Loading your cart…
            </p>
          ) : (
            <CartItemList
              items={items}
              onSetQuantity={change}
              onRemove={remove}
              disabled={isMutating}
            />
          )}
        </div>

        {isAuthenticated && items.length > 0 && (
          <div className="flex flex-col gap-6 border-t border-gray-100 p-6">
            <Summary
              subtotal={subtotal}
              hasIssues={hasIssues}
              onNavigate={onClose}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
