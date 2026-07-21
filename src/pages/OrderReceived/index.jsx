import { useState } from "react";
import { CircleCheck } from "lucide-react";
import YouMayAlsoLike from "../../components/shared/YouMayAlsoLike";
import { formatCurrency } from "../../utils/formatCurrency";

const orderItems = [
  { id: 1, name: "Bare Lace 13X6 Wig Lacefrontal", price: 12000 },
  { id: 2, name: "Bare Lace 13X6 Wig Lacefrontal", price: 12000 },
  { id: 3, name: "Bare Lace 13X6 Wig Lacefrontal", price: 12000 },
  { id: 4, name: "Bare Lace 13X6 Wig Lacefrontal", price: 12000 },
  { id: 5, name: "Bare Lace 13X6 Wig Lacefrontal", price: 12000 },
  { id: 6, name: "Bare Lace 13X6 Wig Lacefrontal", price: 12000 },
];

const ADDRESS =
  "Omma Mall Ground floor, Moore Jackson street, Bonny Island, Rivers state, Nigeria.";

function OrderReceived() {
  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";
  const total = orderItems.reduce((sum, item) => sum + item.price, 0);

  const [orderNumber] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const [orderDate] = useState(() =>
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );

  return (
    <div className={`mx-auto max-w-[1920px] ${sidePadding} py-8`}>
      <div className="mb-8 flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2 bg-green-50 px-6 py-4 text-green-700">
          <CircleCheck className="size-5 shrink-0" />
          <p className="text-sm font-medium">
            Thank you. Your order has been received.
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Pay With Cash On Delivery
        </p>
      </div>

      <div className="mb-16 grid grid-cols-2 gap-6 bg-gray-50 p-6 text-center sm:grid-cols-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
            Order Number
          </p>
          <p className="text-sm font-medium text-black">{orderNumber}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
            Date
          </p>
          <p className="text-sm font-medium text-black">{orderDate}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
            Total
          </p>
          <p className="text-sm font-medium text-black">
            {formatCurrency(total)}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
            Payment Method
          </p>
          <p className="text-sm font-medium text-black">Cash on Delivery</p>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="mb-4 text-xl font-semibold text-black">
          Order details
        </h2>
        <div className="border-t border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 py-3 text-xs font-semibold uppercase text-gray-500">
            <span>Items</span>
            <span>Price</span>
          </div>
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-gray-100 py-3 text-sm"
            >
              <span className="text-black">{item.name}</span>
              <span className="text-black">{formatCurrency(item.price)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 text-sm font-semibold">
            <span className="text-black">Total</span>
            <span className="text-black">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="border border-gray-200 p-6">
          <h3 className="mb-2 text-lg font-semibold text-black">
            Billing Address
          </h3>
          <p className="text-sm text-gray-600">{ADDRESS}</p>
        </div>
        <div className="border border-gray-200 p-6">
          <h3 className="mb-2 text-lg font-semibold text-black">
            Shipping Address
          </h3>
          <p className="text-sm text-gray-600">{ADDRESS}</p>
        </div>
      </div>

      <YouMayAlsoLike />
    </div>
  );
}

export default OrderReceived;
