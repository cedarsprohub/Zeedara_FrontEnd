import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import { useStickyNavHeight } from "../../../context/NavbarHeightContext";
import { listMyOrders } from "../../../api/orders";
import { formatAmount } from "../../../utils/formatCurrency";
import {
  ORDER_STATUS_LABEL,
  ORDER_TABS,
  statusTone,
} from "../../../utils/orderStatus";

const PAGE_SIZE = 20;

function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
}

function StatusBadge({ status }) {
  const tone = statusTone(status);
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-[9.6px] font-bold uppercase leading-none ${tone.bg} ${tone.text}`}
    >
      {ORDER_STATUS_LABEL[status] ?? status}
    </span>
  );
}

/**
 * One row of `OrderListItem`. That shape carries the order number, status,
 * total and date — not the line items — so the card links through to the order
 * for the full breakdown rather than inventing a product name and thumbnail.
 */
function OrderCard({ order }) {
  const href = `/order-received/${order.order_number}`;
  const unpaid =
    order.status === "pending_payment" || order.status === "payment_failed";

  return (
    <div className="flex flex-col gap-3 border border-[#dadde2] bg-white px-4 py-4 transition-colors hover:border-[#bf8322] sm:px-5 sm:py-5">
      <div className="flex flex-col gap-1 text-[13px] font-medium text-[#48505e] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <p>
          Order ID: <span className="text-black">{order.order_number}</span>
        </p>
        <p className="sm:shrink-0 sm:text-right">
          Ordered on {formatOrderDate(order.created_at)}
        </p>
      </div>

      <span className="h-px w-full bg-[#dadde2]" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <StatusBadge status={order.status} />

        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <p className="text-[16px] font-semibold text-black">
            {formatAmount(order.total_ngn)}
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              to={href}
              className="flex h-9 w-full shrink-0 items-center justify-center whitespace-nowrap bg-[#faf4eb] px-4 text-[12px] font-semibold tracking-[0.28px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2] sm:w-auto"
            >
              VIEW ORDER
            </Link>
            {unpaid && (
              <Link
                to="/checkout"
                className="flex h-9 w-full shrink-0 items-center justify-center whitespace-nowrap bg-(--primary-color) px-4 text-[12px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                COMPLETE PAYMENT
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const { accessToken } = useAuth();
  const stickyNavHeight = useStickyNavHeight();

  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  // `GET /orders` returns a bare array, so one extra row tells us whether
  // there's another page. Results carry the page they belong to, which is also
  // what marks the list as loading.
  const [result, setResult] = useState({
    page: 0,
    orders: [],
    hasNextPage: false,
    error: null,
  });

  const isLoading = result.page !== page;
  const { orders, hasNextPage, error } = result;

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;

    listMyOrders(
      { limit: PAGE_SIZE + 1, offset: (page - 1) * PAGE_SIZE },
      accessToken,
    )
      .then((rows) => {
        if (!active) return;
        const list = Array.isArray(rows) ? rows : [];
        setResult({
          page,
          orders: list.slice(0, PAGE_SIZE),
          hasNextPage: list.length > PAGE_SIZE,
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;
        setResult({ page, orders: [], hasNextPage: false, error: err.message });
      });

    return () => {
      active = false;
    };
  }, [accessToken, page]);

  // The customer orders endpoint has no status filter, so the tabs narrow the
  // page that's loaded rather than re-querying.
  const visibleOrders = useMemo(() => {
    const tab = ORDER_TABS.find((entry) => entry.label === activeTab);
    if (!tab?.statuses) return orders;
    return orders.filter((order) => tab.statuses.includes(order.status));
  }, [activeTab, orders]);

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
          {ORDER_TABS.map((tab) => {
            const active = tab.label === activeTab;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(tab.label)}
                className={`relative -mb-px shrink-0 cursor-pointer px-3 py-3 text-[13px] font-semibold uppercase tracking-[0.28px] transition-colors sm:px-4 ${
                  active
                    ? "text-(--primary-color) after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-(--primary-color)"
                    : "text-[#667085] hover:text-(--primary-color)"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
          {error}
        </p>
      )}

      {/* Order list */}
      <div className="flex flex-col gap-5">
        {isLoading ? (
          <p className="py-16 text-center text-[13px] font-medium text-[#667085]">
            Loading your orders…
          </p>
        ) : visibleOrders.length > 0 ? (
          visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="flex flex-col items-center gap-4 py-16">
            <p className="text-[13px] font-medium text-[#667085]">
              No {activeTab === "All" ? "" : `${activeTab.toLowerCase()} `}orders
              yet.
            </p>
            <Link
              to="/products"
              className="bg-(--primary-color) px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.28px] text-white transition-opacity hover:opacity-90"
            >
              Start shopping
            </Link>
          </div>
        )}
      </div>

      {(page > 1 || hasNextPage) && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || isLoading}
            className="flex h-9 cursor-pointer items-center justify-center bg-[#f0f1f3] px-4 text-[13px] font-medium text-[#575f71] transition-colors hover:bg-[#e6e8eb] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[13px] font-medium text-[#667085]">
            Page {page}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!hasNextPage || isLoading}
            className="flex h-9 cursor-pointer items-center justify-center bg-[#f0f1f3] px-4 text-[13px] font-medium text-[#575f71] transition-colors hover:bg-[#e6e8eb] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Orders;
