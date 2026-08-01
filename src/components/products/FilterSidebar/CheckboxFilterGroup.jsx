import { Check } from "lucide-react";

/**
 * Single-select facet group. Each of the API's facet parameters (`category_id`,
 * `brand`, `collection`, `product_type`) takes one value, so ticking an option
 * replaces the previous one; ticking the active option clears it.
 *
 * `options` are `{ value, label, depth? }` — `depth` indents child categories
 * under their parent.
 */
function CheckboxFilterGroup({ title, options, value, onChange }) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-black">
          {title}
        </h3>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="cursor-pointer text-xs font-medium text-gray-500 underline hover:text-(--primary-color)"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {options.map((option) => {
          const isChecked = value === option.value;
          return (
            <label
              key={option.value}
              style={option.depth ? { paddingLeft: option.depth * 14 } : undefined}
              className="flex cursor-pointer items-center justify-between gap-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="relative inline-flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onChange(isChecked ? null : option.value)}
                    className="peer absolute h-4 w-4 cursor-pointer opacity-0"
                  />
                  <span className="flex h-4 w-4 items-center justify-center border border-gray-300 bg-white peer-checked:border-(--primary-color) peer-checked:bg-(--primary-color)">
                    {isChecked && <Check className="size-3 text-white" />}
                  </span>
                </span>
                <span className="text-gray-700 capitalize">{option.label}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default CheckboxFilterGroup;
