import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CartItem from "../ui/CartItem";
import { listProducts } from "../../api/catalog";

const COUNT = 4;

/**
 * Recommendation strip. The API has no "related products" endpoint, so this
 * shows the newest published products, minus whatever is already on screen.
 */
function YouMayAlsoLike({ excludeId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;
    // One spare, in case the excluded product is in the response.
    listProducts({ limit: COUNT + 1, sort: "newest" })
      .then((rows) => {
        if (!active) return;
        const list = Array.isArray(rows) ? rows : [];
        setProducts(
          list.filter((item) => item.id !== excludeId).slice(0, COUNT),
        );
      })
      .catch(() => {
        // A recommendation strip isn't worth an error message — it just
        // doesn't render.
        if (active) setProducts([]);
      });

    return () => {
      active = false;
    };
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <div>
      <h2 className="mb-8 text-center font-['Anton'] text-2xl uppercase text-black md:text-3xl">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <CartItem key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Link
          to="/products"
          className="bg-black px-10 py-3 text-[13px] font-bold uppercase text-white transition-opacity hover:opacity-90"
        >
          Show All
        </Link>
      </div>
    </div>
  );
}

export default YouMayAlsoLike;
