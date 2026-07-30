import { useState } from "react";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext.js";
import { getProduct } from "../../../api/catalog";
import { formatAmount } from "../../../utils/formatCurrency";
import { primaryImageUrl, purchasableVariants } from "../../../utils/product";

/**
 * Catalog card for a `ProductListItem`. The list endpoint doesn't include
 * variants, so adding straight from a card first fetches the product: a single
 * purchasable variant is added here, anything with a choice to make sends the
 * shopper to the detail page to make it.
 */
function CartItem({ product, viewMode = "grid" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    addItem,
    setItemQuantity,
    findItemByVariant,
    findItemByProductName,
    openDrawer,
    isAuthenticated,
    isMutating,
  } = useCart();

  // Set once we know which variant this card put in the cart, so the stepper
  // below can track that line.
  const [variantId, setVariantId] = useState(null);
  const [busy, setBusy] = useState(false);

  const href = `/products/${product.slug}`;
  // The variant this card added, or — on a fresh page load, where that's been
  // forgotten — whatever line the cart already holds for this product. Without
  // the fallback a card would offer "ADD TO CART" for something already in the
  // cart, and adding again would silently stack a second unit.
  const line =
    (variantId ? findItemByVariant(variantId) : null) ??
    findItemByProductName(product.name);
  const quantity = line?.quantity ?? 0;

  const handleAdd = async (event) => {
    // The whole card is a link — adding to the cart must not navigate.
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    setBusy(true);
    try {
      const detail = await getProduct(product.slug);
      const options = purchasableVariants(detail.variants);
      if (options.length !== 1) {
        // Nothing to add unambiguously — let them pick on the detail page.
        navigate(href);
        return;
      }
      await addItem(options[0].id, 1);
      setVariantId(options[0].id);
      // Slide the cart out — the card's stepper alone is easy to miss.
      openDrawer();
    } catch {
      // The cart context surfaces its own failures; a catalog fetch that fails
      // just falls back to the detail page.
      navigate(href);
    } finally {
      setBusy(false);
    }
  };

  const step = async (event, next) => {
    event.preventDefault();
    event.stopPropagation();
    if (!line) return;
    setBusy(true);
    try {
      await setItemQuantity(line.id, next);
      if (next < 1) setVariantId(null);
    } catch {
      // Already reported by the cart context.
    } finally {
      setBusy(false);
    }
  };

  const disabled = busy || isMutating;

  const cartAction = !product.in_stock ? (
    <span className="flex w-full items-center justify-center bg-[#f0f0f0] px-4 py-2 text-[10px] font-semibold uppercase text-[#bdc2cb] md:text-[12px] lg:text-[14px]">
      Out of stock
    </span>
  ) : quantity === 0 ? (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled}
      className="bg-(--primary-color) text-[10px] md:text-[12px] w-full lg:text-[14px] flex space-x-2 items-center justify-center text-white py-2 px-4 cursor-pointer hover:bg-[#573b0f] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? "ADDING…" : "ADD TO CART"}
      <ShoppingCart className="size-4 ml-2 hidden md:block" />
    </button>
  ) : (
    <div className="cart-counter flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={(event) => step(event, quantity - 1)}
        disabled={disabled}
        aria-label={quantity > 1 ? "Remove one item" : "Remove from cart"}
        className="flex size-9 items-center justify-center border border-gray-300 text-(--primary-color) cursor-pointer transition-colors hover:bg-(--primary-color) hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {quantity > 1 ? (
          <Minus className="size-4" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </button>

      <span className="flex size-9 items-center justify-center text-[14px] font-bold text-black">
        {quantity}
      </span>

      <button
        type="button"
        onClick={(event) => step(event, quantity + 1)}
        // The server owns the stock check; this only stops the obvious overrun.
        disabled={disabled || quantity >= (line?.stock_available ?? Infinity)}
        aria-label="Add one item"
        className="flex size-9 items-center justify-center border border-gray-300 text-(--primary-color) cursor-pointer transition-colors hover:bg-(--primary-color) hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );

  const image = primaryImageUrl(product.media);
  // The list endpoint carries no "was" price, so cards show the live one only.
  const price = formatAmount(product.min_price);
  const subtitle = [product.brand, product.product_type]
    .filter(Boolean)
    .join(" · ");

  if (viewMode === "list") {
    return (
      <Link
        to={href}
        className="cart-item-list flex w-full items-stretch gap-4 border border-gray-300 transition-colors duration-300 hover:border-(--primary-color) sm:gap-6"
      >
        <div className="h-28 w-28 shrink-0 overflow-hidden bg-(--grey-color) sm:h-40 sm:w-40">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="160"
            height="160"
            className="media-in h-full w-full object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:py-3 sm:pr-3 py-2 pr-2">
          {subtitle && (
            <span className="text-(--primary-color) text-[10px] md:text-xs font-bold uppercase">
              {subtitle}
            </span>
          )}
          <h3 className="text-sm font-semibold text-black md:text-base">
            {product.name}
          </h3>
          <div className="price-container flex items-center gap-2">
            <span className="text-(--primary-color) text-xs md:text-sm font-bold">
              {price}
            </span>
          </div>

          <div className="mt-auto w-full sm:w-44">{cartAction}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={href}
      className="cart-item w-full flex h-full flex-col items-center border border-gray-300 py-1 px-1 md:px-2 md:py-2 transition-colors duration-300 hover:border-(--primary-color)"
    >
      {/* Fixed 8:7 image box (as designed) so cards stay aligned at every width */}
      <div className="cart-img bg-(--grey-color) mb-1 w-full aspect-[8/7] flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width="400"
          height="350"
          className="media-in size-full object-cover"
        />
      </div>
      {/* Layout breakpoints are the incoming grid work (2xl/3xl tiers); the
          bindings are the catalog response. There's no "was" price on
          `ProductListItem`, so the strikethrough and the % OFF badge that went
          with the mock data have no data to render. */}
      <div className="cart-details w-full flex flex-1 flex-col space-y-0 2xl:space-y-1">
        {subtitle && (
          <span className="text-(--primary-color) text-[8px] md:text-[12px] font-bold uppercase truncate">
            {subtitle}
          </span>
        )}
        <div className="flex flex-col 3xl:flex-row gap-1 3xl:gap-0 items-start">
          <h3 className="text-[10px] sm:text-[12px] md:text-[14px] font-medium leading-tight line-clamp-1 3xl:line-clamp-2">
            {product.name}
          </h3>

          <div className="price-container flex items-center space-x-1 3xl:space-x-2 ml-0 3xl:ml-2">
            <span className="text-(--primary-color) text-[10px] sm:text-[12px] md:text-[14px] font-bold">
              {price}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-2">{cartAction}</div>
      </div>
    </Link>
  );
}

export default CartItem;
