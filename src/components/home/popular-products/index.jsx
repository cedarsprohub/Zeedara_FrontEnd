import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CartItem from "../../ui/CartItem";
import { listCollections, listProducts } from "../../../api/catalog";

const PER_TAB = 8;

/**
 * Home-page catalog strip. The tabs are the store's published collections, and
 * each one's products come from `GET /products?collection=<slug>`.
 */
function PopularProducts() {
  const [collections, setCollections] = useState([]);
  const [activeSlug, setActiveSlug] = useState(null);
  // Products are stored against the tab they belong to, so switching tabs shows
  // the loading line without a flag to keep in step.
  const [result, setResult] = useState({ key: null, products: [] });

  const requestKey = `collection:${activeSlug ?? ""}`;
  const isLoading = result.key !== requestKey;
  const products = result.products;

  useEffect(() => {
    let active = true;
    listCollections()
      .then((rows) => {
        if (!active) return;
        const list = (Array.isArray(rows) ? rows : []).filter(
          (collection) => collection.is_active,
        );
        setCollections(list);
        setActiveSlug(list[0]?.slug ?? null);
      })
      .catch(() => {
        if (active) setCollections([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    // With no collections configured, fall back to the newest products so the
    // section still shows the catalog rather than nothing.
    listProducts({
      collection: activeSlug ?? undefined,
      limit: PER_TAB,
      sort: "newest",
    })
      .then((rows) => {
        if (active) {
          setResult({
            key: requestKey,
            products: Array.isArray(rows) ? rows : [],
          });
        }
      })
      .catch(() => {
        if (active) setResult({ key: requestKey, products: [] });
      });

    return () => {
      active = false;
    };
  }, [activeSlug, requestKey]);

  const sidePadding =
    "px-[clamp(1rem,6.25vw,7.5rem)] py-[clamp(3rem,6.25vw,7.5rem)]";

  return (
    <div className="popular-products">
      <div
        className={`popular-products-inner mx-auto max-w-[1920px] ${sidePadding} flex flex-col gap-8 items-center`}
      >
        {/* Heading */}
        <div className="popular-products-content flex flex-col gap-4 w-[100%] lg:w-[70%] xl:w-[65%] items-center">
          <span className="popular-products-badge bg-transparent text-[12px] lg:text-[16px] w-fit text-black font-bold py-2 px-4 text-center uppercase border-2 border-black">
            Shop What Works
          </span>
          <h2 className="popular-products-title text-[32px] sm:text-[40px] text-center lg:text-[48px] uppercase font-medium leading-tight font-['Anton'] text-black">
            Popular Products
          </h2>
        </div>

        {/* Tabs */}
        {collections.length > 0 && (
          <div className="popular-products-tabs flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {collections.map((collection) => {
              const isActive = collection.slug === activeSlug;
              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => setActiveSlug(collection.slug)}
                  className={`text-[12px] sm:text-[14px] font-normal uppercase px-2 py-2 border-b-2 cursor-pointer transition-colors duration-300 ${
                    isActive
                      ? "border-(--primary-color) text-(--primary-color)"
                      : "border-gray-300 text-[#667085] hover:text-(--primary-color)"
                  }`}
                >
                  {collection.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Catalog — 2 per row on phones, widening to 5 at xl and 6 at 2xl
            (the incoming grid adjustment), fed by the collection request. */}
        {isLoading ? (
          <p className="py-8 text-sm text-gray-500">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="py-8 text-sm text-gray-500">
            No products in this collection yet.
          </p>
        ) : (
          <div className="popular-products-catalog w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => (
              <CartItem key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Show All */}
        <Link
          to={activeSlug ? `/products?collection=${activeSlug}` : "/products"}
          className="popular-products-showall bg-black text-white text-[14px] font-bold uppercase px-10 py-3 cursor-pointer transition-opacity hover:opacity-90"
        >
          Show All
        </Link>
      </div>
    </div>
  );
}

export default PopularProducts;
