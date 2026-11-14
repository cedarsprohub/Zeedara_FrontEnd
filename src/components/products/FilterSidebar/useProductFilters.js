import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  listCategories,
  listCollections,
  listProductFacets,
} from "../../../api/catalog";

// Every parameter the filters own. Listed once so "clear all" and the active
// count can't drift from the controls.
export const FILTER_PARAMS = [
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

export const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Filter options (from the catalog) plus URL-backed filter state. Shared by
 * the desktop sidebar and the mobile filter panel, so both always show and
 * write the same thing. Option lists are served from the catalog cache, so
 * mounting this twice doesn't cost a second round of requests.
 */
export function useProductFilters({ withCounts = false } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Result counts for the current filters (and search text): a total plus a
  // count per option. Only fetched when asked for. The last answer is kept
  // while the next one loads, so the numbers don't blank out on every tap.
  const countsKey = withCounts
    ? JSON.stringify(
        ["q", ...FILTER_PARAMS].map((param) => [
          param,
          searchParams.get(param) ?? undefined,
        ]),
      )
    : null;
  const [facetCounts, setFacetCounts] = useState({ total: null, counts: null });

  useEffect(() => {
    if (!countsKey) return undefined;
    let active = true;
    listProductFacets(Object.fromEntries(JSON.parse(countsKey)))
      .then(({ total, counts }) => {
        if (active) setFacetCounts({ total, counts });
      })
      .catch(() => {
        // No counts is fine: options just show without numbers.
        if (active) setFacetCounts({ total: null, counts: null });
      });
    return () => {
      active = false;
    };
  }, [countsKey]);
  const [options, setOptions] = useState({
    categories: [],
    collections: [],
    brands: [],
    productTypes: [],
    maxPrice: null,
  });

  // Options come from the catalog itself, so the filters always offer what's
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

  // Min and max price are two params but one filter, so the price range
  // counts once.
  const activeCount =
    FILTER_PARAMS.filter(
      (param) => param !== "max_price" && searchParams.has(param),
    ).length +
    (searchParams.has("max_price") && !searchParams.has("min_price") ? 1 : 0);

  const clearAll = () =>
    setParams(Object.fromEntries(FILTER_PARAMS.map((param) => [param, null])));

  // The slider's ceiling has to clear the catalog's own maximum, or the most
  // expensive product would sit past the end of the track.
  const ceiling = options.maxPrice
    ? Math.ceil(options.maxPrice / 1000) * 1000
    : null;

  return {
    searchParams,
    options,
    setParams,
    activeCount,
    clearAll,
    ceiling,
    total: facetCounts.total,
    counts: facetCounts.counts,
    inStock: searchParams.get("in_stock") === "true",
    minPrice: toNumber(searchParams.get("min_price")),
    maxPrice: toNumber(searchParams.get("max_price")),
  };
}
