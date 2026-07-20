import { useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { ChevronRight, LayoutGrid, List } from "lucide-react";
import FilterSidebar from "../../components/products/FilterSidebar";
import Pagination from "../../components/products/Pagination";
import CartItem from "../../components/ui/CartItem";
import Faq from "../../components/faq";
import productsData from "./productsData";

const PAGE_SIZE = 12;

function Products() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");

  const totalItems = productsData.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = productsData.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            <div className="mb-6 flex items-center justify-between gap-4 border border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-600">
                {query ? (
                  <>
                    Showing results for &ldquo;{query}&rdquo; &mdash;{" "}
                    {startIndex + 1}-
                    {Math.min(startIndex + PAGE_SIZE, totalItems)} of{" "}
                    {totalItems} results
                  </>
                ) : (
                  <>
                    Showing {startIndex + 1}-
                    {Math.min(startIndex + PAGE_SIZE, totalItems)} of{" "}
                    {totalItems} results
                  </>
                )}
              </p>
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

            {/* Product grid / list */}
            <div
              className={
                viewMode === "list"
                  ? "flex flex-col gap-4"
                  : "grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3"
              }
            >
              {visibleProducts.map((product) => (
                <CartItem
                  key={product.id}
                  id={product.id}
                  img={product.img}
                  name={product.name}
                  description={product.description}
                  oldPrice={product.oldPrice}
                  newPrice={product.newPrice}
                  discount={product.discount}
                  viewMode={viewMode}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
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
