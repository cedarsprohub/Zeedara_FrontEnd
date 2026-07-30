import { AlertTriangle, Minus, Plus, Trash2 } from "lucide-react";
import { formatAmount } from "../../../../utils/formatCurrency";

/**
 * Renders the server's cart lines (`CartItemView`).
 *
 * Quantities and money come straight from the response — nothing is multiplied
 * or totalled here, so what's on screen is what the server will charge. Lines
 * flagged `available: false` or `price_changed` say so instead of quietly
 * showing a stale figure.
 *
 * `CartItemView` carries no image, so each line shows an initial tile rather
 * than a stand-in photo of some other product.
 */
function CartItemList({ items, onSetQuantity, onRemove, disabled = false }) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        Your cart is empty.
      </p>
    );
  }

  return (
    <section
      aria-label="Cart items"
      className="flex w-full flex-col items-start gap-4"
    >
      {items.map((item) => {
        const atStockLimit = item.quantity >= item.stock_available;
        return (
          <article
            key={item.id}
            className={`flex w-full items-stretch gap-4 border ${
              item.available ? "border-gray-100" : "border-[#f0cfcf]"
            }`}
          >
            <div className="flex h-auto w-[100px] shrink-0 items-center justify-center bg-gray-100 text-2xl font-semibold text-gray-400">
              {item.product_name.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-1 flex-col justify-between gap-2 py-2 pr-3">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 self-end">
                  <span className="text-sm font-semibold text-(--primary-color)">
                    {formatAmount(item.unit_price_ngn)}
                  </span>
                </div>
                <h4 className="w-[70%] line-clamp-2 text-sm font-medium text-black">
                  {item.product_name}
                </h4>
                <p className="text-xs text-gray-500">{item.variant_name}</p>
                <p className="text-[11px] text-gray-400">SKU: {item.sku}</p>
              </div>

              {!item.available && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#cf251f]">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {item.stock_available > 0
                    ? `Only ${item.stock_available} in stock`
                    : "Out of stock"}
                </p>
              )}

              {item.price_changed && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#d99116]">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  Price updated since you added this
                </p>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-black">
                  {formatAmount(item.line_total_ngn)}
                </span>

                <div className="flex items-center gap-2">
                  <div
                    role="group"
                    aria-label={`Quantity controls for ${item.product_name}`}
                    className="flex w-[78px] items-center justify-between border border-gray-300 px-1.5 py-1"
                  >
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.product_name}`}
                      onClick={() => onSetQuantity(item.id, item.quantity - 1)}
                      disabled={disabled}
                      className="flex cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span
                      aria-live="polite"
                      aria-atomic="true"
                      className="text-xs font-bold text-black"
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.product_name}`}
                      onClick={() => onSetQuantity(item.id, item.quantity + 1)}
                      // The server enforces stock; this stops the pointless call.
                      disabled={disabled || atStockLimit}
                      className="flex cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${item.product_name} from cart`}
                    onClick={() => onRemove(item.id)}
                    disabled={disabled}
                    className="flex cursor-pointer items-center justify-center border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default CartItemList;
