import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import CheckboxFilterGroup from "./CheckboxFilterGroup";
import PriceRangeFilter from "./PriceRangeFilter";
import {
  listCategories,
  listCollections,
  listProductFacets,
} from "../../../api/catalog";

// Every parameter this sidebar owns. Listed once so "clear all" and the active
// count can't drift from the controls.
const FILTER_PARAMS = [
  "category_id",
  "collection",
  "brand",
  "product_type",
  "min_price",
  "max_price",
  "in_stock",
];

// Parents first, each followed by its own children, so the flat list the group
// renders still reads as the category tree the API describes via `parent_id`.
function orderCategories(categories) {
  const roots = categories.filter((category) => !category.parent_id);
  const known = new Set(roots.map((category) => category.id));

  return [
    ...roots.flatMap((root) => [
      { value: root.id, label: root.name },
      ...categories
        .filter((category) => category.parent_id === root.id)
        .map((child) => ({ value: child.id, label: child.name, depth: 1 })),
    ]),
    // A child whose parent is missing or inactive would otherwise vanish.
    ...categories
      .filter(
        (category) => category.parent_id && !known.has(category.parent_id),
      )
      .map((category) => ({ value: category.id, label: category.name })),
  ];
}

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

function FilterSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [options, setOptions] = useState({
    categories: [],
    collections: [],
    brands: [],
    productTypes: [],
    maxPrice: null,
  });

  // Options come from the catalog itself, so the sidebar always offers what's
  // actually there. A failure leaves the groups empty and they render nothing,
  // rather than offering filters that would return zero results.
  useEffect(() => {
    let active = true;

    Promise.all([
      listCategories().catch(() => []),
      listCollections().catch(() => []),
      listProductFacets().catch(() => ({
        brands: [],
        productTypes: [],
        maxPrice: null,
      })),
    ]).then(([categories, collections, facets]) => {
      if (!active) return;
      setOptions({
        categories: orderCategories(
          Array.isArray(categories) ? categories : [],
        ),
        collections: (Array.isArray(collections) ? collections : []).map(
          (collection) => ({
            value: collection.slug,
            label: collection.name,
          }),
        ),
        brands: facets.brands.map((brand) => ({ value: brand, label: brand })),
        productTypes: facets.productTypes.map((type) => ({
          value: type,
          label: type,
        })),
        maxPrice: facets.maxPrice,
      });
    });

    return () => {
      active = false;
    };
  }, []);

  // Changing any facet invalidates the page number — page 3 of the old result
  // set has nothing to do with the new one.
  const setParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined || value === "")
        next.delete(key);
      else next.set(key, String(value));
    }
    next.delete("page");
    setSearchParams(next);
  };

  const activeCount = FILTER_PARAMS.filter((param) =>
    searchParams.has(param),
  ).length;

  const clearAll = () =>
    setParams(Object.fromEntries(FILTER_PARAMS.map((param) => [param, null])));

  const inStock = searchParams.get("in_stock") === "true";

  // The slider's ceiling has to clear the catalog's own maximum, or the most
  // expensive product would sit past the end of the track.
  const ceiling = options.maxPrice
    ? Math.ceil(options.maxPrice / 1000) * 1000
    : null;

  return (
    // Outer box stretches to match the product column's height (default flex
    // "stretch"), giving the inner sticky wrapper room to travel before it
    // un-sticks right at the bottom of the grid/pagination.
    <aside className="filter-sidebar w-full shrink-0 lg:w-[280px]">
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
          min={toNumber(searchParams.get("min_price"))}
          max={toNumber(searchParams.get("max_price"))}
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
