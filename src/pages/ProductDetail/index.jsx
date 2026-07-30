import { useEffect, useState } from "react";
import { NavLink, useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ImageGallery from "../../components/product-detail/ImageGallery";
import ProductInfo from "../../components/product-detail/ProductInfo";
import ProductTabs from "../../components/product-detail/ProductTabs";
import YouMayAlsoLike from "../../components/shared/YouMayAlsoLike";
import { getProduct, getProductReviews } from "../../api/catalog";
import { galleryImages } from "../../utils/product";

const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";

function NotFound({ message }) {
  return (
    <div className={`mx-auto max-w-[1920px] ${sidePadding} py-24 text-center`}>
      <h1 className="mb-4 text-2xl font-semibold text-black">
        Product not found
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        {message ||
          "The product you're looking for doesn't exist or may have been removed."}
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

function ProductDetail() {
  const { slug } = useParams();

  // Held with the slug it belongs to, so a slug change reads as "loading"
  // without a separate flag that could fall out of step with it.
  const [state, setState] = useState({
    slug: null,
    product: null,
    reviews: null,
    error: null,
  });

  const isLoading = state.slug !== slug;
  const { product, reviews, error } = isLoading
    ? { product: null, reviews: null, error: null }
    : state;

  useEffect(() => {
    let active = true;

    getProduct(slug)
      .then((detail) => {
        if (!active) return;
        setState({ slug, product: detail, reviews: null, error: null });
        // Reviews are keyed by product id, so they can only be fetched once the
        // product has resolved. A failure here leaves the tab empty rather than
        // taking the page down with it.
        return getProductReviews(detail.id).then(
          (data) =>
            active &&
            setState((prev) =>
              prev.slug === slug ? { ...prev, reviews: data } : prev,
            ),
          () => {},
        );
      })
      .catch((err) => {
        if (!active) return;
        setState({ slug, product: null, reviews: null, error: err.message });
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className={`mx-auto max-w-[1920px] ${sidePadding} py-24 text-center`}>
        <p className="text-sm text-gray-500">Loading product…</p>
      </div>
    );
  }

  if (error || !product) return <NotFound message={error} />;

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
        <ChevronRight className="size-3.5" />
        <span className="truncate text-black">{product.name}</span>
      </div>

      {/* Gallery + Info. Both hold per-product state — the selected variant and
          the active image — so they're keyed to remount when you navigate from
          one product to another rather than carrying the last one's selection
          into a product it doesn't belong to. */}
      <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ImageGallery
          key={`gallery-${product.id}`}
          images={galleryImages(product.media)}
          name={product.name}
        />
        <ProductInfo
          key={`info-${product.id}`}
          product={product}
          summary={reviews?.summary}
        />
      </div>

      {/* Tabs */}
      <div className="mb-16">
        <ProductTabs product={product} reviews={reviews} />
      </div>

      <YouMayAlsoLike excludeId={product.id} />
    </div>
  );
}

export default ProductDetail;
