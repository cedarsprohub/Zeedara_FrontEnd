import { useState } from "react";
import { Link } from "react-router-dom";
import { Share2, Star, CircleCheck, Trash2, Plus, ShoppingCart } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

function parsePrice(value) {
  return Number(String(value).replace(/,/g, ""));
}

function ProductInfo({ product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-500 hover:text-(--primary-color)"
        >
          <Share2 className="size-4" />
          Share
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {product.discount > 0 && (
          <span className="w-fit bg-[#faf4eb] px-3 py-1 text-xs font-bold text-(--primary-color)">
            {product.discount}% OFF
          </span>
        )}
        <h1 className="text-2xl font-semibold text-black md:text-3xl">
          {product.name}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`size-4 ${
                  index < Math.round(product.rating)
                    ? "fill-(--primary-color) text-(--primary-color)"
                    : "fill-transparent text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {product.rating}/5 ({product.reviewCount.toLocaleString()} reviews)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-(--primary-color)">
          {formatCurrency(parsePrice(product.newPrice))}
        </span>
        {product.oldPrice !== product.newPrice && (
          <span className="text-lg text-gray-400 line-through">
            {formatCurrency(parsePrice(product.oldPrice))}
          </span>
        )}
      </div>

      <ul className="flex flex-col gap-1.5 border-b border-gray-100 pb-4 text-sm text-gray-600">
        {product.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span aria-hidden="true">&bull;</span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-black">Color</h3>
        <div className="flex gap-2">
          {product.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              aria-label={`Select color ${color}`}
              aria-pressed={selectedColor === color}
              className={`size-8 cursor-pointer rounded-full border border-gray-300 transition-shadow ${
                selectedColor === color
                  ? "ring-2 ring-(--primary-color) ring-offset-2"
                  : ""
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-center justify-between gap-3 border border-gray-300 px-3">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="Decrease quantity"
            className="flex cursor-pointer items-center justify-center text-gray-500 hover:text-(--primary-color)"
          >
            <Trash2 className="size-4" />
          </button>
          <span className="min-w-4 text-center text-sm font-bold text-black">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((current) => current + 1)}
            aria-label="Increase quantity"
            className="flex cursor-pointer items-center justify-center text-gray-500 hover:text-(--primary-color)"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 bg-black px-6 py-3 text-sm font-semibold uppercase text-white transition-opacity hover:opacity-90"
        >
          Add to Cart
          <ShoppingCart className="size-4" />
        </button>
      </div>

      <Link
        to="/checkout"
        className="w-full bg-(--primary-color) px-6 py-3 text-center text-sm font-semibold uppercase text-white transition-opacity hover:opacity-90"
      >
        Buy Now
      </Link>

      <div className="flex flex-col gap-1.5 pt-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <CircleCheck className="size-4 text-green-600" />
          <span className="font-semibold">Estimated Delivery: </span> Up to 4
          business days
        </div>
        <div className="flex items-center gap-2">
          <CircleCheck className="size-4 text-green-600" />
          <span className="font-semibold">Free Shipping:</span> On all orders
          over {formatCurrency(80000)}
        </div>
      </div>
    </div>
  );
}

export default ProductInfo;
