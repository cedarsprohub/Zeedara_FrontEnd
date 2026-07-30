import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import { useStickyNavHeight } from "../../../context/NavbarHeightContext";
import { getOrder, listMyOrders } from "../../../api/orders";
import { formatAmount } from "../../../utils/formatCurrency";
import {
  ORDER_STATUS_LABEL,
  ORDER_TABS,
  statusTone,
} from "../../../utils/orderStatus";

const PAGE_SIZE = 10;

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

// The card's button, per state. Everything here leads somewhere real.
function primaryAction(order, firstItemName) {
  switch (order.status) {
    case "pending_payment":
    case "payment_failed":
      return { label: "COMPLETE PAYMENT", to: "/checkout", variant: "solid" };
    case "paid":
    case "processing":
    case "packed":
    case "shipped":
      return {
        label: "TRACK ORDER",
        to: `/account/orders/${order.order_number}`,
        variant: "solid",
      };
    case "delivered":
    case "closed":
      // No product id on order items, so a review starts from a catalog search.
      return firstItemName
        ? {
            label: "LEAVE REVIEW",
            to: `/products?q=${encodeURIComponent(firstItemName)}`,
            variant: "solid",
          }
        : null;
    case "cancelled":
      return firstItemName
        ? {
            label: "ORDER AGAIN",
            to: `/products?q=${encodeURIComponent(firstItemName)}`,
            variant: "soft",
          }
        : null;
    default:
      return {
        label: "VIEW ORDER",
        to: `/account/orders/${order.order_number}`,
        variant: "soft",
      };
  }
}

function StatusBadge({ status }) {
  const tone = statusTone(status);
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-[9.6px] font-bold uppercase leading-[1.4] ${tone.bg} ${tone.text}`}
    >
      {ORDER_STATUS_LABEL[status] ?? status}
    </span>
  );
}

/**
 * One order, in the designed card layout: image panel on the left, order id and
 * date across the top, then the product with its options, quantity and status,
 * and the total plus action on the right.
 *
 * `detail` is the full order — `OrderListItem` has no line items, so the list
 * fetches each order to fill in the product row (see the note in `Orders`).
 * Until it lands the row shows a skeleton rather than an empty gap.
 */
function OrderCard({ order, detail }) {
  const navigate = useNavigate();
  const href = `/account/orders/${order.order_number}`;

  const items = detail?.items ?? [];
  const first = items[0] ?? null;
  const extraCount = Math.max(items.length - 1, 0);
  const action = primaryAction(order, first?.product_name ?? "");

  return (
    <div
      onClick={() => navigate(href)}
      className="flex cursor-pointer border border-[#dadde2] bg-white transition-colors duration-200 hover:border-[#bf8322]"
    >
      {/* Full-height panel flush to the card's left edge. Order items carry no
          image, so it's the product's initial on a tint. */}
      <div className="flex w-[88px] shrink-0 items-center justify-center bg-[#f0f1f3] text-[32px] font-semibold text-[#c9ccd3] sm:w-[163px]">
        {first ? first.product_name.charAt(0).toUpperCase() : "•"}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 py-4 sm:py-5">
        <div className="flex flex-col gap-1 text-[13px] font-medium text-[#48505e] sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:text-[14px]">
          <p>
            Order ID: <span className="text-black">{order.order_number}</span>
          </p>
          <p className="sm:shrink-0 sm:text-right">
            Ordered on {formatOrderDate(order.created_at)}
          </p>
        </div>

        <span className="h-px w-full bg-[#dadde2]" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3">
            {first ? (
              <div className="flex flex-col gap-2">
                <h3 className="text-[14px] font-semibold text-black sm:text-[16px]">
                  {first.product_name}
                </h3>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-[13px] font-medium text-[#667085] sm:whitespace-nowrap sm:text-[14px]">
                  <span>{first.variant_name}</span>
                  <span>Qty: {first.quantity}</span>
                  {extraCount > 0 && (
                    <span className="text-(--primary-color)">
                      +{extraCount} more{" "}
                      {extraCount === 1 ? "item" : "items"}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="skeleton-delayed flex flex-col gap-2">
                <div className="skeleton h-4 w-[180px]" />
                <div className="skeleton h-3 w-[120px]" />
              </div>
            )}
            <StatusBadge status={order.status} />
          </div>

          <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end sm:gap-4">
            <p className="text-[16px] font-semibold text-black sm:text-[20px]">
              {formatAmount(order.total_ngn)}
            </p>
            {action && (
              <Link
                to={action.to}
                // The whole card navigates to the detail; the button has its own
                // destination, so its click must not bubble into that.
                onClick={(event) => event.stopPropagation()}
                className={`flex h-10 w-full shrink-0 items-center justify-center whitespace-nowrap px-4 text-[12px] font-semibold tracking-[0.28px] transition-colors sm:w-[207px] ${
                  action.variant === "soft"
                    ? "bg-[#faf4eb] text-(--primary-color) hover:bg-[#f3e7d2]"
                    : "bg-(--primary-color) text-white hover:opacity-90"
                }`}
              >
                {action.label}
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
  // order_number → OrderPublic, for the product row on each card.
  const [details, setDetails] = useState({});

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

  // The designed card shows the product, its options and quantity — none of
  // which `OrderListItem` carries. So each order on the page is read in full,
  // in parallel, and merged in as it arrives. It's one request per card (10 per
  // page); a list endpoint that returned items would remove them all.
  useEffect(() => {
    if (!accessToken || orders.length === 0) return undefined;
    let active = true;

    const missing = orders.filter((order) => !details[order.order_number]);
    if (missing.length === 0) return undefined;

    Promise.all(
      missing.map((order) =>
        getOrder(order.order_number, { accessToken })
          .then((full) => [order.order_number, full])
          .catch(() => null),
      ),
    ).then((pairs) => {
      const resolved = pairs.filter(Boolean);
      if (!active || resolved.length === 0) return;
      setDetails((prev) => ({ ...prev, ...Object.fromEntries(resolved) }));
    });

    return () => {
      active = false;
    };
    // `details` is intentionally not a dependency: it's written by this effect,
    // and re-running on every write would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, orders]);

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
          <div className="skeleton-delayed flex flex-col gap-5">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="skeleton h-[168px] w-full" />
            ))}
          </div>
        ) : visibleOrders.length > 0 ? (
          visibleOrders.map((order) => (
            <div key={order.id} className="fade-in">
              <OrderCard
                order={order}
                detail={details[order.order_number]}
              />
            </div>
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
