import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import productImg from "../../../assets/ui/sampleImg.png";

const TABS = ["All", "Shipped", "Delivered", "Cancelled", "Returned"];

// Visual config per order status (colours taken from the design tokens).
const STATUS = {
  shipped: { label: "SHIPPED", text: "text-[#d99116]", bg: "bg-[#fbf4e8]" },
  delivered: { label: "DELIVERED", text: "text-[#298d1c]", bg: "bg-[#eefeec]" },
  cancelled: { label: "CANCELLED", text: "text-[#cf251f]", bg: "bg-[#fae9e9]" },
  returned: { label: "RETURNED", text: "text-[#667085]", bg: "bg-[#f0f1f3]" },
};

const ORDERS = [
  { id: "241344", name: "Bare Lace 13X6 Wig Lacefrontal", color: "Black", size: "30ml", qty: 1, price: "122,000", date: "02 July 2026", status: "shipped" },
  { id: "241344", name: "Bare Lace 13X6 Wig Lacefrontal", color: "Black", size: "30ml", qty: 1, price: "122,000", date: "02 July 2026", status: "delivered" },
  { id: "241344", name: "Bare Lace 13X6 Wig Lacefrontal", color: "Black", size: "30ml", qty: 1, price: "122,000", date: "02 July 2026", status: "shipped" },
  { id: "241344", name: "Bare Lace 13X6 Wig Lacefrontal", color: "Black", size: "30ml", qty: 1, price: "122,000", date: "02 July 2026", status: "cancelled" },
  { id: "241344", name: "Bare Lace 13X6 Wig Lacefrontal", color: "Black", size: "30ml", qty: 1, price: "122,000", date: "02 July 2026", status: "delivered" },
  { id: "241344", name: "Bare Lace 13X6 Wig Lacefrontal", color: "Black", size: "30ml", qty: 1, price: "122,000", date: "02 July 2026", status: "cancelled" },
];

// Actions available per status.
const ACTIONS = {
  shipped: [{ label: "TRACK ORDER", variant: "solid", to: "/account/orders/track" }],
  delivered: [
    { label: "ORDER AGAIN", variant: "soft" },
    { label: "LEAVE REVIEW", variant: "solid" },
  ],
  cancelled: [{ label: "ORDER AGAIN", variant: "soft" }],
  returned: [{ label: "ORDER AGAIN", variant: "soft" }],
};

function ActionButton({ label, variant, to }) {
  const styles =
    variant === "solid"
      ? "bg-(--primary-color) text-white hover:opacity-90"
      : "bg-[#faf4eb] text-(--primary-color) hover:bg-[#f3e7d2]";
  const cls = `flex h-9 shrink-0 items-center justify-center whitespace-nowrap px-4 text-[12px] font-semibold tracking-[0.28px] transition-colors ${styles}`;

  return to ? (
    <Link to={to} className={cls}>
      {label}
    </Link>
  ) : (
    <button type="button" className={cls}>
      {label}
    </button>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex w-[78px] items-center justify-center px-2 py-1 text-[9.6px] font-bold leading-none ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

function OrderCard({ order }) {
  return (
    <div className="flex border border-[#dadde2] bg-white">
      {/* Product image — full-height panel flush to the card's left edge */}
      <div className="w-[120px] shrink-0 overflow-hidden bg-[#f0f1f3] sm:w-[163px]">
        <img
          src={productImg}
          alt={order.name}
          className="size-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 py-5">
        {/* Order id + date */}
        <div className="flex items-start justify-between gap-4 text-[14px] font-medium text-[#48505e]">
          <p>
            Order ID: <span>{order.id}</span>
          </p>
          <p className="shrink-0 text-right">Ordered on {order.date}</p>
        </div>

        <span className="h-px w-full bg-[#dadde2]" />

        {/* Product + price/actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-[16px] font-semibold text-black">
                {order.name}
              </h3>
              <div className="flex gap-2 whitespace-nowrap text-[14px] font-medium text-[#667085]">
                <span>
                  Color: {order.color}/Size: {order.size}
                </span>
                <span>Qty: {order.qty}</span>
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="flex flex-col items-start gap-4 sm:items-end">
            <p className="text-[20px] font-semibold text-black">
              &#8358;{order.price}
            </p>
            <div className="flex flex-row gap-2 sm:justify-end">
              {ACTIONS[order.status].map((action) => (
                <ActionButton key={action.label} {...action} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination() {
  const pages = ["1", "2", "3", "Next", "...", "Last", ">>"];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      {pages.map((page, i) => {
        const active = page === "1";
        const wide = page === "Next" || page === "Last" || page === ">>";
        return (
          <button
            key={`${page}-${i}`}
            type="button"
            className={`flex h-8 items-center justify-center text-[14px] font-medium transition-colors ${
              wide ? "px-3" : "size-8"
            } ${
              active
                ? "bg-(--primary-color) text-white"
                : "bg-[#f0f1f3] text-[#575f71] hover:bg-[#e6e8eb]"
            }`}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
}

function Orders() {
  const [activeTab, setActiveTab] = useState("All");

  const visibleOrders = useMemo(() => {
    if (activeTab === "All") return ORDERS;
    return ORDERS.filter(
      (o) => STATUS[o.status].label === activeTab.toUpperCase(),
    );
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-5 lg:p-8">
      {/* Filter tabs */}
      <div className="flex flex-wrap border-b border-[#dadde2]">
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative -mb-px cursor-pointer px-4 py-3 text-[14px] font-semibold uppercase tracking-[0.28px] transition-colors ${
                active
                  ? "text-(--primary-color) after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-(--primary-color)"
                  : "text-[#667085] hover:text-(--primary-color)"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Order list */}
      <div className="flex flex-col gap-5">
        {visibleOrders.length > 0 ? (
          visibleOrders.map((order, i) => (
            <OrderCard key={`${order.id}-${i}`} order={order} />
          ))
        ) : (
          <p className="py-16 text-center text-[14px] font-medium text-[#667085]">
            No {activeTab.toLowerCase()} orders yet.
          </p>
        )}
      </div>

      {visibleOrders.length > 0 && <Pagination />}
    </div>
  );
}

export default Orders;
