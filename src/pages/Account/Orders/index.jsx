import { useMemo, useState } from "react";
import productImg from "../../../assets/ui/sampleImg.png";

const TABS = ["All", "Shipped", "Delivered", "Cancelled", "Returned"];

// Visual config per order status.
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
  shipped: [{ label: "TRACK ORDER", variant: "solid" }],
  delivered: [
    { label: "ORDER AGAIN", variant: "soft" },
    { label: "LEAVE REVIEW", variant: "solid" },
  ],
  cancelled: [{ label: "ORDER AGAIN", variant: "soft" }],
  returned: [{ label: "ORDER AGAIN", variant: "soft" }],
};

function ActionButton({ label, variant }) {
  const styles =
    variant === "solid"
      ? "bg-(--primary-color) text-white hover:opacity-90"
      : "bg-[#faf4eb] text-(--primary-color) hover:bg-[#f3e7d2]";
  return (
    <button
      type="button"
      className={`flex h-9 min-w-[128px] cursor-pointer items-center justify-center px-4 text-[13px] font-semibold tracking-[0.28px] transition-colors ${styles}`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-[10px] font-semibold leading-none ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

function OrderCard({ order }) {
  return (
    <div className="flex gap-4 border border-[#dadde2] bg-white p-4">
      {/* Product image */}
      <div className="size-[86px] shrink-0 overflow-hidden bg-[#f0f1f3]">
        <img
          src={productImg}
          alt={order.name}
          className="size-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[13px] font-medium text-[#667085]">
            Order ID: <span className="text-black">{order.id}</span>
          </p>
          <p className="shrink-0 text-[13px] font-medium text-[#667085]">
            Ordered on {order.date}
          </p>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate text-[16px] font-semibold text-black">
              {order.name}
            </h3>
            <p className="text-[14px] font-medium text-[#667085]">
              Color: {order.color}/Size: {order.size}
              <span className="ml-4">Qty: {order.qty}</span>
            </p>
          </div>
          <p className="shrink-0 text-[16px] font-semibold text-black">
            &#8358;{order.price}
          </p>
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <StatusBadge status={order.status} />
          <div className="flex flex-wrap gap-3">
            {ACTIONS[order.status].map((action) => (
              <ActionButton key={action.label} {...action} />
            ))}
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
        return (
          <button
            key={`${page}-${i}`}
            type="button"
            className={`flex h-9 min-w-9 cursor-pointer items-center justify-center border px-3 text-[13px] font-medium transition-colors ${
              active
                ? "border-(--primary-color) bg-[#faf4eb] text-(--primary-color)"
                : "border-[#dadde2] text-[#667085] hover:bg-[#faf4eb]"
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
    return ORDERS.filter((o) => STATUS[o.status].label === activeTab.toUpperCase());
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-6 border-b border-[#dadde2]">
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative -mb-px cursor-pointer pb-3 text-[14px] font-semibold uppercase tracking-[0.28px] transition-colors ${
                active
                  ? "text-(--primary-color) after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-(--primary-color)"
                  : "text-[#667085] hover:text-(--primary-color)"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Order list */}
      <div className="flex flex-col gap-4">
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
