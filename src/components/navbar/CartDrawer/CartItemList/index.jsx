import { Check, Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../../../../utils/formatCurrency";

function CartItemList({
  items,
  onIncrement,
  onDecrement,
  onRemove,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
}) {
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
        const isSelected = selectedIds.includes(item.id);
        return (
          <article
            key={item.id}
            className="flex w-full items-stretch gap-4 border border-gray-100"
          >
            {selectable && (
              <label className="flex items-start pl-3 pt-3">
                <span className="relative inline-flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    aria-label={`Select ${item.name}`}
                    className="peer absolute h-5 w-5 cursor-pointer opacity-0"
                  />
                  <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-white peer-checked:border-(--primary-color) peer-checked:bg-(--primary-color)">
                    {isSelected && <Check className="size-4 text-white" />}
                  </span>
                </span>
              </label>
            )}

            <div className="h-auto w-[100px] shrink-0 overflow-hidden bg-gray-100">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between py-2 pr-3">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 self-end">
                  <span className="text-sm text-gray-400 line-through">
                    {formatCurrency(item.originalPrice)}
                  </span>
                  <span className="text-sm font-semibold text-(--primary-color)">
                    {formatCurrency(item.salePrice)}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-black w-[70%] line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>

              <div className="flex items-center self-end gap-2">
                <div
                  role="group"
                  aria-label={`Quantity controls for ${item.name}`}
                  className="flex w-[78px] items-center justify-between border border-gray-300 px-1.5 py-1"
                >
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.name}`}
                    onClick={() => onDecrement(item.id)}
                    className="flex cursor-pointer items-center justify-center"
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
                    aria-label={`Increase quantity of ${item.name}`}
                    onClick={() => onIncrement(item.id)}
                    className="flex cursor-pointer items-center justify-center"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  aria-label={`Remove ${item.name} from cart`}
                  onClick={() => onRemove(item.id)}
                  className="flex cursor-pointer items-center justify-center border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default CartItemList;
