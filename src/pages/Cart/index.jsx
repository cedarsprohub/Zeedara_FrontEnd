import { Check } from "lucide-react";
import { useState } from "react";
import CartItemList from "../../components/navbar/CartDrawer/CartItemList";
import CartSummaryPanel from "../../components/cart/CartSummaryPanel";
import YouMayAlsoLike from "../../components/shared/YouMayAlsoLike";
import sampleImg from "../../assets/ui/sampleImg.png";

const initialItems = [
  {
    id: 1,
    image: sampleImg,
    originalPrice: 150000,
    salePrice: 122000,
    name: "Bare Lace 13X6 Wig Lacefrontal",
    description: "Color: Black / Size: 30ml",
    quantity: 1,
  },
  {
    id: 2,
    image: sampleImg,
    originalPrice: 150000,
    salePrice: 122000,
    name: "Bare Lace 13X6 Wig Lacefrontal",
    description: "Color: Black / Size: 30ml",
    quantity: 1,
  },
  {
    id: 3,
    image: sampleImg,
    originalPrice: 150000,
    salePrice: 122000,
    name: "Bare Lace 13X6 Wig Lacefrontal",
    description: "Color: Black / Size: 30ml",
    quantity: 1,
  },
  {
    id: 4,
    image: sampleImg,
    originalPrice: 150000,
    salePrice: 122000,
    name: "Bare Lace 13X6 Wig Lacefrontal",
    description: "Color: Black / Size: 30ml",
    quantity: 1,
  },
];

function Cart() {
  const [items, setItems] = useState(initialItems);
  const [selectedIds, setSelectedIds] = useState(
    initialItems.map((item) => item.id),
  );

  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";
  const allSelected = selectedIds.length === items.length && items.length > 0;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  const incrementQuantity = (id) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decrementQuantity = (id) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    );
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedIds((current) => current.filter((itemId) => itemId !== id));
  };

  const subtotal = items
    .filter((item) => selectedIds.includes(item.id))
    .reduce((total, item) => total + item.salePrice * item.quantity, 0);

  return (
    <div className={`mx-auto max-w-[1920px] ${sidePadding} py-8`}>
      <h1 className="mb-4 text-2xl font-semibold text-black">Cart Summary</h1>

      <label className="mb-6 flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-700">
        <span className="relative inline-flex items-center justify-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="peer absolute h-5 w-5 cursor-pointer opacity-0"
          />
          <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-white peer-checked:border-(--primary-color) peer-checked:bg-(--primary-color)">
            {allSelected && <Check className="size-4 text-white" />}
          </span>
        </span>
        Select all
      </label>

      <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <CartItemList
          items={items}
          onIncrement={incrementQuantity}
          onDecrement={decrementQuantity}
          onRemove={removeItem}
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />
        <CartSummaryPanel
          subtotal={subtotal}
          address="Omma Mall, Moore Jackson street, Bonny Island, Rivers state, Nigeria."
        />
      </div>

      <YouMayAlsoLike />
    </div>
  );
}

export default Cart;
