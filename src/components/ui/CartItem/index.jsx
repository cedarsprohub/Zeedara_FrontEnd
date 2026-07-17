import { useState } from "react";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";

function CartItem({ id, img, name, oldPrice, newPrice, discount }) {
  const [quantity, setQuantity] = useState(0);

  const addToCart = (event) => {
    event.preventDefault();
    setQuantity(1);
  };
  const increment = (event) => {
    event.preventDefault();
    setQuantity((current) => current + 1);
  };
  const decrement = (event) => {
    event.preventDefault();
    setQuantity((current) => Math.max(current - 1, 0));
  };

  return (
    <Link
      to={`/products/${id}`}
      className="cart-item w-full flex flex-col h-[251px] sm:h-[300px] md:h-[310px] lg:h-[350px] xl:h-[370px] items-center border border-gray-300 py-1 px-1 md:px-2 md:py-2 transition-colors duration-300 hover:border-(--primary-color)"
    >
      <div className="cart-img bg-(--grey-color) mb-1 w-full h-full flex items-center justify-center overflow-hidden">
        <img src={img} alt={name} className="object-cover" />
      </div>
      <div className="cart-details w-full flex flex-col space-y-0 lg:space-y-1">
        <span className="text-(--primary-color) text-[8px] md:text-[12px] font-bold">
          {discount}% OFF
        </span>
        <div className="flex flex-col lg:flex-row gap-1 lg:gap-0 items-start">
          <h3 className="text-[10px] sm:text-[12px] md:text-[14px] font-medium leading-tight line-clamp-2">
            {name}
          </h3>

          <div className="price-container flex items-center space-x-1 lg:space-x-2 ml-0 lg:ml-2">
            <span className="text-gray-500 text-[10px] sm:text-[12px] md:text-[14px] line-through">
              N{oldPrice}
            </span>
            <span className="text-(--primary-color) text-[10px] sm:text-[12px] md:text-[14px] font-bold">
              N{newPrice}
            </span>
          </div>
        </div>

        {quantity === 0 ? (
          <button
            type="button"
            onClick={addToCart}
            className="bg-(--primary-color) text-[10px] md:text-[12px] lg:text-[14px] mt-2 flex space-x-2 items-center justify-center text-white py-2 px-4 cursor-pointer hover:bg-[#573b0f] transition-colors duration-300"
          >
            ADD TO CART
            <ShoppingCart className="size-4 ml-2 hidden md:block" />
          </button>
        ) : (
          <div className="cart-counter mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={decrement}
              aria-label={quantity > 1 ? "Remove one item" : "Remove from cart"}
              className="flex size-9 items-center justify-center border border-gray-300 text-(--primary-color) cursor-pointer transition-colors hover:bg-(--primary-color) hover:text-white"
            >
              {quantity > 1 ? (
                <Minus className="size-4" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </button>

            <span className="flex size-9 items-center justify-center text-[14px] font-bold text-black">
              {quantity}
            </span>

            <button
              type="button"
              onClick={increment}
              aria-label="Add one item"
              className="flex size-9 items-center justify-center border border-gray-300 text-(--primary-color) cursor-pointer transition-colors hover:bg-(--primary-color) hover:text-white"
            >
              <Plus className="size-4" />
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}

export default CartItem;
