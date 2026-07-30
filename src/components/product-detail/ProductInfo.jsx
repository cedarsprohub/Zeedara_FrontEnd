import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Share2, Star, CircleCheck, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext.js";
import { formatAmount, formatCurrency } from "../../utils/formatCurrency";
import { discountPercent, variantLabel } from "../../utils/product";

// Free-shipping threshold shown as store copy. It is not used in any
// calculation — the delivery fee on an order is whatever the server charges.
const FREE_SHIPPING_COPY_THRESHOLD = 80000;

function ProductInfo({ product, summary }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, openDrawer, isAuthenticated, isMutating } = useCart();

  const variants = useMemo(
    () => (product.variants ?? []).filter((v) => v.status === "active"),
    [product.variants],
  );

  const [variantId, setVariantId] = useState(
    () => variants.find((v) => v.stock_quantity > 0)?.id ?? variants[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.id === variantId) ?? null;
  const inStock = Boolean(variant && variant.stock_quantity > 0);
  const maxQuantity = variant?.stock_quantity ?? 0;
  const discount = discountPercent(
    variant?.price_ngn,
    variant?.compare_at_price_ngn,
  );

  const rating = summary?.average_rating ?? 0;
  const reviewCount = summary?.review_count ?? 0;

  const selectVariant = (id) => {
    setVariantId(id);
    setQuantity(1);
    setAdded(false);
    setError(null);
  };

  // The server re-checks stock on every add; capping here just keeps the UI
  // from asking for something it already knows isn't there.
  const add = async () => {
    if (!variant) return null;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return null;
    }
    setBusy(true);
    setError(null);
    try {
      const cart = await addItem(variant.id, quantity);
      setAdded(true);
      return cart;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const addAndShowCart = async () => {
    const cart = await add();
    if (cart) openDrawer();
  };

  const buyNow = async () => {
    const cart = await add();
    // Straight to checkout — no drawer in the way.
    if (cart) navigate("/checkout");
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // Cancelled or unsupported — nothing to report.
    }
  };

  const disabled = busy || isMutating || !inStock;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={share}
          className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-500 hover:text-(--primary-color)"
        >
          <Share2 className="size-4" />
          Share
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {discount > 0 && (
          <span className="w-fit bg-[#faf4eb] px-3 py-1 text-xs font-bold text-(--primary-color)">
            {discount}% OFF
          </span>
        )}
        <h1 className="text-2xl font-semibold text-black md:text-3xl">
          {product.name}
        </h1>
        {(product.brand || product.product_type) && (
          <p className="text-sm text-gray-500">
            {[product.brand, product.product_type].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`size-4 ${
                  index < Math.round(rating)
                    ? "fill-(--primary-color) text-(--primary-color)"
                    : "fill-transparent text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {reviewCount > 0
              ? `${rating.toFixed(1)}/5 (${reviewCount.toLocaleString()} reviews)`
              : "No reviews yet"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-(--primary-color)">
          {formatAmount(variant?.price_ngn ?? product.min_price)}
        </span>
        {discount > 0 && (
          <span className="text-lg text-gray-400 line-through">
            {formatAmount(variant.compare_at_price_ngn)}
          </span>
        )}
      </div>

      {product.description && (
        <p className="border-b border-gray-100 pb-4 text-sm leading-relaxed text-gray-600">
          {product.description}
        </p>
      )}

      {/* Variants — the only thing the cart can be given, so this is where the
          real choice happens. Sold-out ones stay visible but unpickable. */}
      {variants.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-black">
            Option
            {variant && (
              <span className="ml-2 font-normal text-gray-500">
                {variantLabel(variant)}
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((option) => {
              const soldOut = option.stock_quantity <= 0;
              const selected = option.id === variantId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectVariant(option.id)}
                  disabled={soldOut}
                  aria-pressed={selected}
                  className={`cursor-pointer border px-3 py-2 text-sm transition-colors ${
                    selected
                      ? "border-(--primary-color) bg-[#faf4eb] text-(--primary-color)"
                      : "border-gray-300 text-gray-700 hover:border-(--primary-color)"
                  } ${soldOut ? "cursor-not-allowed line-through opacity-50" : ""}`}
                >
                  {variantLabel(option)}
                </button>
              );
            })}
          </div>
          {variant && inStock && variant.stock_quantity <= 5 && (
            <p className="text-xs font-medium text-[#cf251f]">
              Only {variant.stock_quantity} left
            </p>
          )}
          {!inStock && (
            <p className="text-xs font-medium text-[#cf251f]">
              This option is out of stock.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm font-medium text-[#cf251f]">
          This product has no options available to buy right now.
        </p>
      )}

      {error && (
        <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
          {error}
        </p>
      )}

      {added && !error && (
        <p className="bg-[#eefeec] px-4 py-3 text-[13px] font-medium text-[#298d1c]">
          Added to your cart.
        </p>
      )}

      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-center justify-between gap-3 border border-gray-300 px-3">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex cursor-pointer items-center justify-center text-gray-500 hover:text-(--primary-color) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-4 text-center text-sm font-bold text-black">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((current) => Math.min(maxQuantity, current + 1))
            }
            disabled={!inStock || quantity >= maxQuantity}
            aria-label="Increase quantity"
            className="flex cursor-pointer items-center justify-center text-gray-500 hover:text-(--primary-color) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={addAndShowCart}
          disabled={disabled}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 bg-black px-6 py-3 text-sm font-semibold uppercase text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#bdc2cb]"
        >
          {busy ? "Adding…" : "Add to Cart"}
          <ShoppingCart className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={buyNow}
        disabled={disabled}
        className="w-full cursor-pointer bg-(--primary-color) px-6 py-3 text-center text-sm font-semibold uppercase text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#bdc2cb]"
      >
        Buy Now
      </button>

      <div className="flex flex-col gap-1.5 pt-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <CircleCheck className="size-4 text-green-600" />
          <span className="font-semibold">Estimated Delivery: </span> Up to 4
          business days
        </div>
        <div className="flex items-center gap-2">
          <CircleCheck className="size-4 text-green-600" />
          <span className="font-semibold">Free Shipping:</span> On all orders
          over {formatCurrency(FREE_SHIPPING_COPY_THRESHOLD)}
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
