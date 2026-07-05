function CartItem({ img, name, oldPrice, newPrice, discount, quantity }) {
  return (
    <div className="cart-item w-[296px] 2xl:w-[376px] flex flex-col items-center space-y-2 border border-gray-300">
      <div className="cart-img bg-(--grey-color) w-full h-[260px] 2xl:h-[320px] flex items-center justify-center overflow-hidden">
        <img src={img} alt={name} className="object-cover" />
      </div>
      <div className="cart-details flex flex-col py-3 px-4 space-y-1">
        <span className="text-(--primary-color) text-[12px] font-bold">
          {discount}% OFF
        </span>
        <div className="flex items-start">
          <h3 className="text-[14px] font-medium">{name}</h3>

          <div className="price-container flex items-center space-x-2 ml-2">
            <span className="text-gray-500 text-[14px] line-through">
              N{oldPrice}
            </span>
            <span className="text-(--primary-color) text-[14px] font-bold">
              N{newPrice}
            </span>
          </div>
        </div>
        <button className="bg-(--primary-color) text-[14px] mt-2 flex space-x-2 items-center justify-center text-white py-2 px-4 cursor-pointer hover:bg-[#573b0f] transition-colors duration-300">
          ADD TO CART
          <img
            src="/src/assets/ui/cart_white_icon.svg"
            alt="cart_icon"
            className="object-cover ml-2"
          />
        </button>
      </div>
    </div>
  );
}

export default CartItem;
