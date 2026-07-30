import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import productImg from "../../../assets/ui/sampleImg.png";
import { useStickyNavHeight } from "../../../context/NavbarHeightContext";

// Detail page each order status opens when its card is clicked.
const DETAIL_ROUTE = {
  shipped: "/account/orders/track",
  delivered: "/account/orders/delivered",
  cancelled: "/account/orders/cancelled",
};

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
    { label: "LEAVE REVIEW", variant: "solid", to: "/account/orders/delivered" },
  ],
  cancelled: [{ label: "ORDER AGAIN", variant: "soft" }],
  returned: [{ label: "ORDER AGAIN", variant: "soft" }],
};

function ActionButton({ label, variant, to }) {
  const styles =
    variant === "solid"
      ? "bg-(--primary-color) text-white hover:opacity-90"
      : "bg-[#faf4eb] text-(--primary-color) hover:bg-[#f3e7d2]";
  const cls = `flex h-9 w-full shrink-0 items-center justify-center whitespace-nowrap px-4 text-[12px] font-semibold tracking-[0.28px] transition-colors sm:w-auto ${styles}`;
  // Stop the click bubbling to the card (which navigates to the order detail).
  const stop = (e) => e.stopPropagation();

  return to ? (
    <Link to={to} className={cls} onClick={stop}>
      {label}
    </Link>
  ) : (
    <button type="button" className={cls} onClick={stop}>
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
  const navigate = useNavigate();
  const detail = DETAIL_ROUTE[order.status];

  return (
    <div
      onClick={detail ? () => navigate(detail) : undefined}
      className={`flex border border-[#dadde2] bg-white ${
        detail ? "cursor-pointer transition-colors hover:border-[#bf8322]" : ""
      }`}
    >
      {/* Product image — full-height panel flush to the card's left edge */}
      <div className="w-[88px] shrink-0 overflow-hidden bg-[#f0f1f3] sm:w-[163px]">
        <img
          src={productImg}
          alt={order.name}
          className="size-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 py-4 sm:py-5">
        {/* Order id + date — stacked on phones, one row from sm up */}
        <div className="flex flex-col gap-1 text-[13px] font-medium text-[#48505e] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <p>
            Order ID: <span>{order.id}</span>
          </p>
          <p className="sm:shrink-0 sm:text-right">Ordered on {order.date}</p>
        </div>

        <span className="h-px w-full bg-[#dadde2]" />

        {/* Product + price/actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-[14px] font-semibold text-black">
                {order.name}
              </h3>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-[13px] font-medium text-[#667085] sm:whitespace-nowrap">
                <span>
                  Color: {order.color}/Size: {order.size}
                </span>
                <span>Qty: {order.qty}</span>
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end sm:gap-4">
            <p className="text-[16px] font-semibold text-black">
              &#8358;{order.price}
            </p>
            {/* Buttons stack full-width beside the thumbnail on phones — two
                of them side by side don't fit the remaining column. */}
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
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
            className={`flex h-8 items-center justify-center text-[13px] font-medium transition-colors ${
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
  const stickyNavHeight = useStickyNavHeight();

  const visibleOrders = useMemo(() => {
    if (activeTab === "All") return ORDERS;
    return ORDERS.filter(
      (o) => STATUS[o.status].label === activeTab.toUpperCase(),
    );
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-5 lg:p-8">
      {/* Filter tabs — pinned below the main nav so the status filters stay
          reachable while the order list scrolls under them. `pb-5 -mb-5`
          keeps the visual gap while extending the white backdrop over it. */}
      <div
        className="sticky z-10 -mb-5 bg-white pb-5"
        style={{ top: `${stickyNavHeight}px` }}
      >
        {/* Tabs scroll sideways on narrow screens instead of wrapping into
            three rows (which would make the sticky bar eat the viewport). */}
        <div className="flex overflow-x-auto border-b border-[#dadde2] [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative -mb-px shrink-0 cursor-pointer px-3 py-3 text-[13px] font-semibold uppercase tracking-[0.28px] transition-colors sm:px-4 ${
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
      </div>

      {/* Order list */}
      <div className="flex flex-col gap-5">
        {visibleOrders.length > 0 ? (
          visibleOrders.map((order, i) => (
            <OrderCard key={`${order.id}-${i}`} order={order} />
          ))
        ) : (
          <p className="py-16 text-center text-[13px] font-medium text-[#667085]">
            No {activeTab.toLowerCase()} orders yet.
          </p>
        )}
      </div>

      {visibleOrders.length > 0 && <Pagination />}
    </div>
  );
}

export default Orders;
