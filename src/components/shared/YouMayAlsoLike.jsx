import { Link } from "react-router-dom";
import CartItem from "../ui/CartItem";
import { getRelatedProducts } from "../../pages/Products/productsData";

function YouMayAlsoLike({ excludeId }) {
  const relatedProducts = getRelatedProducts(excludeId);

  return (
    <div>
      <h2 className="mb-8 text-center font-['Anton'] text-3xl uppercase text-black md:text-4xl">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {relatedProducts.map((related) => (
          <CartItem
            key={related.id}
            id={related.id}
            img={related.img}
            name={related.name}
            oldPrice={related.oldPrice}
            newPrice={related.newPrice}
            discount={related.discount}
          />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Link
          to="/products"
          className="bg-black px-10 py-3 text-sm font-bold uppercase text-white transition-opacity hover:opacity-90"
        >
          Show All
        </Link>
      </div>
    </div>
  );
}

export default YouMayAlsoLike;
