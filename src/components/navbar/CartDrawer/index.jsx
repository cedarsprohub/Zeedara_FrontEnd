import { X } from "lucide-react";
import { useEffect, useState } from "react";
import CartItemList from "./CartItemList";
import CouponEntry from "./CouponEntry";
import Summary from "./Summary";
import sampleImg from "../../../assets/ui/sampleImg.png";

const initialItems = [
  {
    id: 1,
    image: sampleImg,
    originalPrice: 150000,
    salePrice: 122000,
    name: "Bare Lace 13X6 Wig Lacefrontal",
    description: "Color: Black / Size: 20ml",
    quantity: 1,
  },
  {
    id: 2,
    image: sampleImg,
    originalPrice: 150000,
    salePrice: 122000,
    name: "Bare Lace 13X6 Wig Lacefrontal",
    description: "Color: Black / Size: 20ml",
    quantity: 1,
  },
];

function CartDrawer({ isOpen, onClose }) {
  const [items, setItems] = useState(initialItems);

  // Disable main page scrollbar and allow Escape to close while drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const incrementQuantity = (id) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decrementQuantity = (id) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    );
  };

  const removeItem = (id) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce(
    (total, item) => total + item.salePrice * item.quantity,
    0,
  );

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-50 flex h-screen w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-[450px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900">
            Your Cart ({items.length})
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart panel"
            className="cursor-pointer p-2 -mr-2 text-gray-500 transition-colors hover:text-gray-900"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <CartItemList
            items={items}
            onIncrement={incrementQuantity}
            onDecrement={decrementQuantity}
            onRemove={removeItem}
          />
        </div>

        <div className="flex flex-col gap-6 border-t border-gray-100 p-6">
          <CouponEntry />
          <Summary subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
