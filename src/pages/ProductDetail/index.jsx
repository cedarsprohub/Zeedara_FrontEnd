import { NavLink, useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ImageGallery from "../../components/product-detail/ImageGallery";
import ProductInfo from "../../components/product-detail/ProductInfo";
import ProductTabs from "../../components/product-detail/ProductTabs";
import CartItem from "../../components/ui/CartItem";
import { getProductDetail, getRelatedProducts } from "./productDetailData";

function ProductDetail() {
  const { id } = useParams();
  const product = getProductDetail(Number(id));

  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";

  if (!product) {
    return (
      <div
        className={`mx-auto max-w-[1920px] ${sidePadding} py-24 text-center`}
      >
        <h1 className="mb-4 text-2xl font-semibold text-black">
          Product not found
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          The product you&apos;re looking for doesn&apos;t exist or may have
          been removed.
        </p>
        <Link
          to="/products"
          className="inline-block bg-(--primary-color) px-6 py-3 text-sm font-semibold uppercase text-white transition-opacity hover:opacity-90"
        >
          Back to All Products
        </Link>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product.id);

  return (
    <div className={`mx-auto max-w-[1920px] ${sidePadding} py-8`}>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <NavLink to="/" className="uppercase hover:text-(--primary-color)">
          Home
        </NavLink>
        <ChevronRight className="size-3.5" />
        <NavLink
          to="/products"
          className="uppercase hover:text-(--primary-color)"
        >
          All Products
        </NavLink>
      </div>

      {/* Gallery + Info */}
      <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ImageGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </div>

      {/* Tabs */}
      <div className="mb-16">
        <ProductTabs product={product} />
      </div>

      {/* You May Also Like */}
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
    </div>
  );
}

export default ProductDetail;
