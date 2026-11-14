import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, Search, X } from "lucide-react";
import PriceRangeFilter from "./FilterSidebar/PriceRangeFilter";
import { useProductFilters } from "./FilterSidebar/useProductFilters";
import { formatCurrency } from "../../utils/formatCurrency";

// Long option lists get a search box, like the brand list on ASOS.
const SEARCHABLE_FROM = 10;

/**
 * Mobile-only (below `lg`) Sort / Filter bar, modelled on ASOS's mobile
 * product listing:
 *
 * - "Sort" and "Filter" each open a full-screen white panel that slides in
 *   from the left (195ms ease) and slides back out the same way.
 * - Inside Filter, tapping a facet slides the list sideways (225ms ease) to
 *   that facet's options; the back arrow slides it back.
 * - Choices apply straight away (they're URL params, same as the desktop
 *   sidebar), so "View items" only has to close the panel.
 */
function MobileFilterBar({ sort, sortOptions, onSortChange, summary }) {
  const filters = useProductFilters({ withCounts: true });
  const {
    searchParams,
    options,
    setParams,
    activeCount,
    clearAll,
    ceiling,
    total,
    counts,
  } = filters;

  // `panel` is what's open ("sort" | "filter" | null). `facetKey` is the facet
  // page; it's kept after going back so the page doesn't blank out mid-slide.
  const [panel, setPanel] = useState(null);
  const [facetKey, setFacetKey] = useState(null);
  const [facetOpen, setFacetOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isOpen = panel !== null;
  // The last panel stays rendered while it slides out.
  const [shownPanel, setShownPanel] = useState(null);
  if (panel && panel !== shownPanel) setShownPanel(panel);

  const open = (which) => {
    setFacetOpen(false);
    setQuery("");
    setPanel(which);
  };
  const close = () => setPanel(null);

  // Lock the page behind the panel, and let Escape close it.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const minPrice = filters.minPrice;
  const maxPrice = filters.maxPrice;
  const hasPrice = minPrice !== undefined || maxPrice !== undefined;

  // One list drives both the facet rows and the facet pages. Facets with no
  // options are left out, like the desktop sidebar's empty groups.
  const facets = [
    { key: "category_id", title: "Category", options: options.categories },
    { key: "collection", title: "Collection", options: options.collections },
    { key: "brand", title: "Brand", options: options.brands },
    {
      key: "product_type",
      title: "Product Type",
      options: options.productTypes,
    },
    {
      key: "in_stock",
      title: "Availability",
      options: [{ value: "true", label: "In stock only" }],
    },
  ]
    .map((facet) => {
      const value = searchParams.get(facet.key);
      const selected = facet.options.find((option) => option.value === value);
      // With counts loaded, each option shows how many products it would
      // give, and options that would give none are hidden, as on ASOS. The
      // selected option always stays so it can be unticked.
      const options = counts
        ? facet.options
            .map((option) => ({
              ...option,
              count:
                facet.key === "in_stock"
                  ? counts.in_stock
                  : (counts[facet.key][option.value] ?? 0),
            }))
            .filter((option) => option.count > 0 || option.value === value)
        : facet.options;
      return {
        ...facet,
        options,
        value,
        selectedLabel: selected?.label ?? null,
      };
    })
    .filter((facet) => facet.options.length > 0);

  facets.push({
    key: "price",
    title: "Price Range",
    isPrice: true,
    value: hasPrice ? "set" : null,
    selectedLabel: hasPrice
      ? `${formatCurrency(minPrice ?? 0)} – ${
          maxPrice !== undefined ? formatCurrency(maxPrice) : "Max"
        }`
      : null,
  });

  const facet = facets.find((item) => item.key === facetKey) ?? null;

  const openFacet = (key) => {
    setFacetKey(key);
    setQuery("");
    setFacetOpen(true);
  };

  const clearFacet = () => {
    if (!facet) return;
    if (facet.isPrice) setParams({ min_price: null, max_price: null });
    else setParams({ [facet.key]: null });
  };

  const visibleOptions =
    facet && !facet.isPrice
      ? facet.options.filter((option) =>
          option.label.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : [];

  const onFacetPage = shownPanel === "filter" && facetOpen && facet;

  // Only facets the API recognised get a chip — a stale value (say, a brand
  // that no longer exists) has no label to show, and "Clear all" still
  // covers it.
  const activeFacets = facets.filter((item) => item.selectedLabel);

  const removeFacet = (item) => {
    if (item.isPrice) setParams({ min_price: null, max_price: null });
    else setParams({ [item.key]: null });
  };

  return (
    <>
      {/* The bar itself: plain text buttons, result summary on the right. */}
      <div className="mb-4 flex items-center gap-6 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => open("sort")}
          className="cursor-pointer py-1 text-[15px] text-black"
        >
          Sort
        </button>
        <button
          type="button"
          onClick={() => open("filter")}
          className="cursor-pointer py-1 text-[15px] text-black"
        >
          Filter
          {activeCount > 0 && (
            <span className="ml-1 text-gray-500">({activeCount})</span>
          )}
        </button>
        <p className="ml-auto truncate text-sm text-gray-500">
          {total !== null
            ? `${total.toLocaleString()} ${total === 1 ? "item" : "items"} found`
            : summary}
        </p>
      </div>

      {/* Active filters, removable without opening the panel: tap a chip to
          drop that one filter, or "Clear all" to drop every one. */}
      {activeCount > 0 && (
        <div className="-mt-2 mb-4 flex flex-wrap items-center gap-2 lg:hidden">
          {activeFacets.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => removeFacet(item)}
              aria-label={`Remove ${item.title} filter: ${item.selectedLabel}`}
              className="flex max-w-full cursor-pointer items-center gap-1.5 border border-gray-300 py-1.5 pr-2 pl-3 text-[13px] text-black"
            >
              <span className="truncate capitalize">{item.selectedLabel}</span>
              <X className="size-3.5 shrink-0" strokeWidth={2} />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="cursor-pointer px-1 py-1.5 text-[13px] font-medium text-black underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Full-screen panel. It's always mounted so it can slide both ways;
          `invisible` drops it from the tab order once it has slid out.
          Portalled to <body> so no transformed ancestor in the page layout
          can turn `fixed inset-0` into "fixed to that ancestor". */}
      {createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={shownPanel === "sort" ? "Sort" : "Filter"}
          aria-hidden={!isOpen}
          className={`fixed inset-0 z-[60] flex flex-col overflow-hidden bg-white transition-[translate,visibility] duration-[195ms] ease-[ease] lg:hidden ${
            isOpen ? "visible translate-x-0" : "invisible -translate-x-full"
          }`}
        >
          {/* Header: back arrow (facet pages only), centred title, close. */}
          <div className="relative flex h-[66px] shrink-0 items-center justify-center px-12">
            {onFacetPage && (
              <button
                type="button"
                onClick={() => setFacetOpen(false)}
                aria-label="Back to filters"
                className="absolute left-3 flex size-10 cursor-pointer items-center justify-center text-black"
              >
                <ArrowLeft className="size-6" strokeWidth={1.75} />
              </button>
            )}
            <h2 className="truncate text-lg font-bold uppercase tracking-wider text-black">
              {shownPanel === "sort"
                ? "Sort"
                : onFacetPage
                  ? facet.title
                  : "Filter"}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 flex size-10 cursor-pointer items-center justify-center text-black"
            >
              <X className="size-7" strokeWidth={1.5} />
            </button>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-hidden">
            {shownPanel === "sort" ? (
              <ul className="h-full overflow-y-auto">
                {sortOptions.map((option) => {
                  const isActive = option.value === sort;
                  return (
                    <li key={option.value} className="border-b border-gray-100">
                      <button
                        type="button"
                        onClick={() => onSortChange(option.value)}
                        aria-pressed={isActive}
                        className="flex h-[63px] w-full cursor-pointer items-center gap-3 px-[22px] text-left text-[15px] text-black"
                      >
                        <span
                          className={`flex size-[13px] shrink-0 items-center justify-center rounded-full border ${
                            isActive ? "border-black" : "border-gray-500"
                          }`}
                        >
                          {isActive && (
                            <span className="size-[7px] rounded-full bg-black" />
                          )}
                        </span>
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              // Two side-by-side pages; the track slides left to show a facet.
              <div
                className={`flex h-full w-[200%] transition-transform duration-[225ms] ease-[ease] ${
                  facetOpen ? "-translate-x-1/2" : "translate-x-0"
                }`}
              >
                {/* Page 1: facet list */}
                <ul
                  inert={facetOpen || undefined}
                  className="h-full w-1/2 overflow-y-auto"
                >
                  {facets.map((item) => (
                    <li key={item.key} className="border-b border-gray-100">
                      <button
                        type="button"
                        onClick={() => openFacet(item.key)}
                        className="flex min-h-[66px] w-full cursor-pointer flex-col justify-center px-[22px] py-3 text-left"
                      >
                        <span className="text-[15px] text-black">
                          {item.title}
                        </span>
                        {item.selectedLabel && (
                          <span className="mt-1 truncate text-[13px] capitalize text-gray-500">
                            {item.selectedLabel}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Page 2: the chosen facet's options */}
                <div
                  inert={!facetOpen || undefined}
                  className="flex h-full w-1/2 flex-col"
                >
                  {facet &&
                    !facet.isPrice &&
                    facet.options.length >= SEARCHABLE_FROM && (
                      <div className="shrink-0 px-2 pb-3">
                        <label className="flex h-9 items-center rounded-full border border-gray-300 px-4">
                          <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search"
                            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-500"
                          />
                          <Search
                            className="size-5 text-black"
                            strokeWidth={1.75}
                          />
                        </label>
                      </div>
                    )}

                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {facet?.isPrice ? (
                      <div className="px-[22px] [&>div]:border-b-0">
                        <PriceRangeFilter
                          min={minPrice}
                          max={maxPrice}
                          ceiling={ceiling}
                          showTitle={false}
                          onCommit={({ min, max }) =>
                            setParams({ min_price: min, max_price: max })
                          }
                        />
                      </div>
                    ) : (
                      <ul>
                        {visibleOptions.map((option) => {
                          const isActive = facet.value === option.value;
                          return (
                            <li key={option.value}>
                              <button
                                type="button"
                                aria-pressed={isActive}
                                onClick={() =>
                                  setParams({
                                    [facet.key]: isActive ? null : option.value,
                                  })
                                }
                                style={
                                  option.depth
                                    ? { paddingLeft: 24 + option.depth * 16 }
                                    : undefined
                                }
                                className={`flex min-h-[66px] w-full cursor-pointer items-center justify-between gap-3 border px-6 text-left text-[15px] capitalize text-black ${
                                  isActive
                                    ? "border-black font-bold"
                                    : "border-transparent border-b-gray-100"
                                }`}
                              >
                                <span>
                                  {option.label}
                                  {option.count !== undefined && (
                                    <span className="ml-2 normal-case">
                                      ({option.count})
                                    </span>
                                  )}
                                </span>
                                {isActive && (
                                  <Check
                                    className="size-6 shrink-0"
                                    strokeWidth={3}
                                  />
                                )}
                              </button>
                            </li>
                          );
                        })}
                        {visibleOptions.length === 0 && (
                          <li className="px-6 py-8 text-sm text-gray-500">
                            No matches for “{query}”.
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer: Clear / All on the left (filter only), View items. */}
          <div className="flex shrink-0 gap-2 border-t border-gray-100 px-4 py-4">
            {shownPanel === "filter" &&
              (onFacetPage ? (
                <button
                  type="button"
                  onClick={clearFacet}
                  disabled={!facet.value}
                  className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 border border-gray-400 text-sm font-bold uppercase tracking-[0.15em] text-black disabled:cursor-default"
                >
                  {facet.value ? (
                    "Clear"
                  ) : (
                    <>
                      All{" "}
                      <Check className="size-5 text-gray-500" strokeWidth={3} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={activeCount === 0}
                  className="h-12 flex-1 cursor-pointer border border-gray-400 text-sm font-bold uppercase tracking-[0.15em] text-black disabled:cursor-default disabled:text-gray-400"
                >
                  Clear all
                </button>
              ))}
            <button
              type="button"
              onClick={close}
              className="h-12 flex-1 cursor-pointer bg-(--primary-color) text-sm font-bold uppercase tracking-[0.15em] text-white"
            >
              View items
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

export default MobileFilterBar;
