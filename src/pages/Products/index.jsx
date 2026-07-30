import { useCallback, useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { ChevronRight, LayoutGrid, List } from "lucide-react";
import FilterSidebar from "../../components/products/FilterSidebar";
import Pagination from "../../components/products/Pagination";
import CartItem from "../../components/ui/CartItem";
import Faq from "../../components/faq";
import { listProducts, searchProducts } from "../../api/catalog";

const PAGE_SIZE = 12;

// Mirrors the `sort` pattern the API accepts.
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawSort = searchParams.get("sort") ?? "newest";
  const sort = SORT_VALUES.includes(rawSort) ? rawSort : "newest";

  const [viewMode, setViewMode] = useState("grid");
  // Results are stored with the query they answer, so "loading" is the gap
  // between what's on screen and what the URL is currently asking for. No
  // separate flag to keep in sync.
  const [result, setResult] = useState({ key: null, products: [], hasNextPage: false, error: null });

  const offset = (currentPage - 1) * PAGE_SIZE;

  const filters = {
    categoryId: searchParams.get("category_id") || undefined,
    collection: searchParams.get("collection") || undefined,
    productType: searchParams.get("product_type") || undefined,
    brand: searchParams.get("brand") || undefined,
    minPrice: searchParams.get("min_price") || undefined,
    maxPrice: searchParams.get("max_price") || undefined,
    inStock: searchParams.get("in_stock") || undefined,
  };
  const requestKey = JSON.stringify({ query, sort, offset, filters });

  const isLoading = result.key !== requestKey;
  const { products, hasNextPage, error } = result;

  useEffect(() => {
    let active = true;

    // `/search` is the endpoint built for text queries; `/products` handles the
    // faceted browse (and its own `q`, but search ranks better).
    const params = { limit: PAGE_SIZE + 1, offset };
    const request = query
      ? searchProducts(query, params)
      : listProducts({ ...params, sort, ...filters });

    request
      .then((rows) => {
        if (!active) return;
        const list = Array.isArray(rows) ? rows : [];
        setResult({
          key: requestKey,
          products: list.slice(0, PAGE_SIZE),
          hasNextPage: list.length > PAGE_SIZE,
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;
        setResult({
          key: requestKey,
          products: [],
          hasNextPage: false,
          error: err.message,
        });
      });

    return () => {
      active = false;
    };
    // `requestKey` covers every input to the request above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";

  const updateParams = useCallback(
    (changes) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const handlePageChange = (page) => {
    updateParams({ page: page === 1 ? null : page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Without a total count the pager can only offer what it knows exists: the
  // pages already walked, plus one more when the server had rows left over.
  const knownPages = currentPage + (hasNextPage ? 1 : 0);

  const rangeLabel = products.length
    ? `${offset + 1}-${offset + products.length}`
    : "0";

  return (
    <div className="products-page">
      <div className={`mx-auto max-w-[1920px] ${sidePadding} py-8`}>
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <NavLink to="/" className="uppercase hover:text-(--primary-color)">
            Home
          </NavLink>
          <ChevronRight className="size-3.5" />
          <span className="uppercase text-black">All Products</span>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterSidebar />

          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-600">
                {isLoading ? (
                  "Loading products…"
                ) : query ? (
                  <>
                    Showing results for &ldquo;{query}&rdquo; &mdash;{" "}
                    {rangeLabel}
                  </>
                ) : (
                  <>Showing {rangeLabel}</>
                )}
              </p>
              <div className="flex items-center gap-3">
                {/* Sorting is server-side; text search has its own ranking, so
                    the control only applies to the browse endpoint. */}
                {!query && (
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="sr-only sm:not-sr-only">Sort by</span>
                    <select
                      value={sort}
                      onChange={(event) =>
                        updateParams({ sort: event.target.value, page: null })
                      }
                      className="h-8 cursor-pointer border border-gray-300 bg-white px-2 text-sm text-black focus:border-(--primary-color) focus:outline-none"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                    className={`flex size-8 cursor-pointer items-center justify-center transition-colors ${
                      viewMode === "grid"
                        ? "bg-(--primary-color) text-white"
                        : "text-gray-500 hover:text-(--primary-color)"
                    }`}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                    className={`flex size-8 cursor-pointer items-center justify-center transition-colors ${
                      viewMode === "list"
                        ? "bg-(--primary-color) text-white"
                        : "text-gray-500 hover:text-(--primary-color)"
                    }`}
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="mb-6 bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
                {error}
              </p>
            )}

            {/* Product grid / list. Columns are the incoming grid adjustment
                (4 from md, 5 at 2xl); the rows come from the catalog. */}
            {!isLoading && products.length === 0 && !error ? (
              <p className="py-16 text-center text-sm text-gray-500">
                {query
                  ? `No products match “${query}”.`
                  : "No products available yet."}
              </p>
            ) : (
              <div
                className={
                  viewMode === "list"
                    ? "flex flex-col gap-4"
                    : "grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5"
                }
              >
                {products.map((product) => (
                  <CartItem
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={knownPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      <Faq />
    </div>
  );
}

export default Products;
 