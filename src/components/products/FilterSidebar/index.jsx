import { Check } from "lucide-react";
import CheckboxFilterGroup from "./CheckboxFilterGroup";
import PriceRangeFilter from "./PriceRangeFilter";
import { useProductFilters } from "./useProductFilters";

// Desktop only — below `lg` the page shows the ASOS-style Sort / Filter bar
// (`MobileFilterBar`) instead. Both read and write the same URL params.
function FilterSidebar() {
  const {
    searchParams,
    options,
    setParams,
    activeCount,
    clearAll,
    ceiling,
    inStock,
    minPrice,
    maxPrice,
  } = useProductFilters();

  return (
    // Outer box stretches to match the product column's height (default flex
    // "stretch"), giving the inner sticky wrapper room to travel before it
    // un-sticks right at the bottom of the grid/pagination.
    <aside className="filter-sidebar hidden shrink-0 lg:block lg:w-[280px]">
      <div
        style={{ scrollbarWidth: "thin" }}
        className="border border-gray-300 px-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent"
      >
        {activeCount > 0 && (
          <div className="flex items-center justify-between border-b border-gray-200 py-4">
            <span className="text-xs font-medium text-gray-600">
              Filters applied
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="cursor-pointer text-xs font-medium text-(--primary-color) underline"
            >
              Clear all
            </button>
          </div>
        )}

        <CheckboxFilterGroup
          title="Shop by Category"
          options={options.categories}
          value={searchParams.get("category_id")}
          onChange={(value) => setParams({ category_id: value })}
        />
        <CheckboxFilterGroup
          title="Shop by Collection"
          options={options.collections}
          value={searchParams.get("collection")}
          onChange={(value) => setParams({ collection: value })}
        />
        <CheckboxFilterGroup
          title="Shop by Brand"
          options={options.brands}
          value={searchParams.get("brand")}
          onChange={(value) => setParams({ brand: value })}
        />
        <CheckboxFilterGroup
          title="Product Type"
          options={options.productTypes}
          value={searchParams.get("product_type")}
          onChange={(value) => setParams({ product_type: value })}
        />

        <PriceRangeFilter
          min={minPrice}
          max={maxPrice}
          ceiling={ceiling}
          onCommit={({ min, max }) =>
            setParams({ min_price: min, max_price: max })
          }
        />

        {/* Only ever set to `true`: `in_stock=false` would restrict the page to
            sold-out products, which is not something to offer as a filter. */}
        <div className="py-5">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <span className="relative inline-flex items-center justify-center">
              <input
                type="checkbox"
                checked={inStock}
                onChange={() => setParams({ in_stock: inStock ? null : "true" })}
                className="peer absolute h-4 w-4 cursor-pointer opacity-0"
              />
              <span className="flex h-4 w-4 items-center justify-center border border-gray-300 bg-white peer-checked:border-(--primary-color) peer-checked:bg-(--primary-color)">
                {inStock && <Check className="size-3 text-white" />}
              </span>
            </span>
            <span className="text-gray-700">In stock only</span>
          </label>
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
