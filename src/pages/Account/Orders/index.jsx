import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import { useStickyNavHeight } from "../../../context/NavbarHeightContext";
import { listMyOrders } from "../../../api/orders";
import { formatAmount } from "../../../utils/formatCurrency";
import {
  ORDER_STATUS_LABEL,
  ORDER_TABS,
  statusTone,
} from "../../../utils/orderStatus";
import ItemImage from "./ItemImage";
import { reviewHref, useBuyAgain } from "./orderActions";

const PAGE_SIZE = 10;

const solidButton =
  "bg-(--primary-color) text-white hover:bg-[#a06e1c]";
const softButton =
  "bg-[#faf4eb] text-(--primary-color) hover:bg-[#f3e7d2]";
const buttonShape =
  "flex h-10 w-full shrink-0 cursor-pointer items-center justify-center whitespace-nowrap px-4 text-[14px] font-semibold leading-[1.4] tracking-[0.28px] transition-colors disabled:cursor-wait disabled:opacity-60 @xl:w-[207px]";

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

// The card's buttons, per state, as designed. Every one leads somewhere real:
// "Order again" refills the cart, "Leave review" opens the product's review
// form when there's one product to review (the order page lists each item's
// own button when there are several).
function cardActions(order) {
  const detail = `/account/orders/${order.order_number}`;
  const reviewable = order.items.filter((item) => reviewHref(item));
  const reviewTo = reviewable.length === 1 ? reviewHref(reviewable[0]) : detail;

  switch (order.status) {
    case "pending_payment":
    case "payment_failed":
      return [{ label: "COMPLETE PAYMENT", to: "/checkout", tone: "solid" }];
    case "paid":
    case "processing":
    case "packed":
    case "shipped":
    case "delivery_failed":
      return [{ label: "TRACK ORDER", to: detail, tone: "solid" }];
    case "delivered":
    case "closed":
      return [
        { label: "ORDER AGAIN", buyAgain: true, tone: "soft" },
        reviewable.length > 0 && {
          label: "LEAVE REVIEW",
          to: reviewTo,
          tone: "solid",
        },
      ].filter(Boolean);
    case "cancelled":
      return [{ label: "ORDER AGAIN", buyAgain: true, tone: "soft" }];
    default:
      return [{ label: "VIEW ORDER", to: detail, tone: "soft" }];
  }
}

function StatusBadge({ status }) {
  const tone = statusTone(status);
  return (
    <span
      className={`inline-flex w-fit min-w-[78px] items-center justify-center px-2 py-1 text-[9.6px] font-bold uppercase leading-[1.4] ${tone.bg} ${tone.text}`}
    >
      {ORDER_STATUS_LABEL[status] ?? status}
    </span>
  );
}

/**
 * One order, in the designed card: product image flush left, order id and date
 * across the top, then the first product with its options, quantity and
 * status, and the total plus actions on the right. Laid out by the card's own
 * width — stacked when narrow, the design's row from 576px.
 */
function OrderCard({ order, buyAgain }) {
  const navigate = useNavigate();
  const href = `/account/orders/${order.order_number}`;
  const [first] = order.items;
  const extraCount = Math.max(order.items.length - 1, 0);
  const actions = cardActions(order);
  const rebuyable = buyAgain.canBuyAgain(order.items);
  const pending = buyAgain.pendingKey === order.order_number;

  return (
    <article
      onClick={() => navigate(href)}
      className="@container cursor-pointer border border-[#dadde2] bg-white transition-colors duration-200 hover:border-(--primary-color)"
    >
      <div className="flex">
        <ItemImage item={first} className="w-[88px] self-stretch @xl:w-[163px]" />

        <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 py-4 @xl:py-5">
          <div className="flex flex-col gap-1 text-[14px] font-medium leading-[1.4] text-[#48505e] @xl:flex-row @xl:items-start @xl:justify-between @xl:gap-4">
            <p>Order ID: {order.order_number}</p>
            <p className="@xl:shrink-0 @xl:text-right">
              Ordered on {formatOrderDate(order.created_at)}
            </p>
          </div>

          <span className="h-px w-full bg-[#dadde2]" />

          <div className="flex flex-col gap-4 @xl:flex-row @xl:items-center @xl:justify-between">
            <div className="flex min-w-0 flex-col gap-3">
              {first && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-[16px] font-semibold leading-[1.4] text-black">
                    {first.product_name}
                  </h3>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-[14px] font-medium leading-[1.4] text-[#667085]">
                    <span>{first.variant_name}</span>
                    <span>Qty: {first.quantity}</span>
                    {extraCount > 0 && (
                      <span className="text-(--primary-color)">
                        +{extraCount} more {extraCount === 1 ? "item" : "items"}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <StatusBadge status={order.status} />
            </div>

            <div className="flex w-full flex-col items-start gap-3 @xl:w-auto @xl:items-end @xl:gap-4">
              <p className="text-[18px] font-semibold leading-[1.4] text-black @xl:text-[20px]">
                {formatAmount(order.total_ngn)}
              </p>
              <div className="flex w-full flex-col gap-3 @xl:w-auto @xl:flex-row @xl:gap-4">
                {actions.map((action) =>
                  action.buyAgain ? (
                    rebuyable && (
                      <button
                        key={action.label}
                        type="button"
                        disabled={Boolean(buyAgain.pendingKey)}
                        onClick={(event) => {
                          // The card itself opens the order; this button has
                          // its own job.
                          event.stopPropagation();
                          buyAgain.buyAgain(order.order_number, order.items);
                        }}
                        className={`${buttonShape} ${softButton}`}
                      >
                        {pending ? "ADDING TO CART…" : action.label}
                      </button>
                    )
                  ) : (
                    <Link
                      key={action.label}
                      to={action.to}
                      onClick={(event) => event.stopPropagation()}
                      className={`${buttonShape} ${
                        action.tone === "soft" ? softButton : solidButton
                      }`}
                    >
                      {action.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// The design's pager: numbered squares around the current page, then Next and
// Last. Previous/First appear once you've moved off page 1.
function pageWindow(page, pageCount) {
  const start = Math.max(1, Math.min(page - 1, pageCount - 2));
  const end = Math.min(pageCount, start + 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function Pager({ page, pageCount, onChange, disabled }) {
  if (pageCount <= 1) return null;
  const pages = pageWindow(page, pageCount);
  const square =
    "flex h-8 min-w-8 cursor-pointer items-center justify-center px-3 text-[14px] font-medium leading-[1.4] transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const idle = "bg-[#f0f1f3] text-[#575f71] hover:bg-[#e6e8eb]";

  return (
    <nav
      aria-label="Order pages"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 && (
        <>
          <button
            type="button"
            onClick={() => onChange(1)}
            disabled={disabled}
            className={`${square} ${idle}`}
          >
            First
          </button>
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={disabled}
            className={`${square} ${idle}`}
          >
            Prev
          </button>
        </>
      )}
      {pages[0] > 1 && <span className={`${square} ${idle} cursor-default`}>…</span>}
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onChange(number)}
          disabled={disabled}
          aria-current={number === page ? "page" : undefined}
          className={`${square} px-0 ${
            number === page ? "bg-(--primary-color) text-white" : idle
          }`}
        >
          {number}
        </button>
      ))}
      {pages[pages.length - 1] < pageCount && (
        <span className={`${square} ${idle} cursor-default`}>…</span>
      )}
      {page < pageCount && (
        <>
          <button
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={disabled}
            className={`${square} ${idle}`}
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => onChange(pageCount)}
            disabled={disabled}
            className={`${square} ${idle}`}
          >
            Last
          </button>
        </>
      )}
    </nav>
  );
}

function Orders() {
  const { accessToken } = useAuth();
  const stickyNavHeight = useStickyNavHeight();
  const buyAgain = useBuyAgain();

  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  // Tagged with the query it answers, so a tab or page change reads as loading
  // without a separate flag, and a slow response can't overwrite a newer one.
  const queryKey = `${activeTab}:${page}`;
  const [result, setResult] = useState({
    key: null,
    orders: [],
    total: 0,
    error: null,
  });

  const isLoading = result.key !== queryKey;
  const { orders, total, error } = result;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    const tab = ORDER_TABS.find((entry) => entry.label === activeTab);

    listMyOrders(
      {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        statuses: tab?.statuses ?? undefined,
      },
      accessToken,
    )
      .then((data) => {
        if (!active) return;
        setResult({
          key: queryKey,
          orders: Array.isArray(data?.items) ? data.items : [],
          total: Number(data?.total) || 0,
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;
        setResult({ key: queryKey, orders: [], total: 0, error: err.message });
      });

    return () => {
      active = false;
    };
  }, [accessToken, activeTab, page, queryKey]);

  const changePage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-[25px] lg:p-8">
      {/* Filter tabs — pinned below the main nav so they stay reachable while
          the list scrolls. `pb-5 -mb-5` keeps the gap while extending the white
          backdrop over it. */}
      <div
        className="sticky z-10 -mb-5 bg-white pb-5"
        style={{ top: `${stickyNavHeight}px` }}
      >
        {/* Scroll sideways on narrow screens rather than wrapping. */}
        <div
          role="tablist"
          className="flex w-full overflow-x-auto border-b border-[#dadde2] [-ms-overflow-style:none] [scrollbar-width:none] sm:w-fit [&::-webkit-scrollbar]:hidden"
        >
          {ORDER_TABS.map((tab) => {
            const selected = tab.label === activeTab;
            return (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setActiveTab(tab.label);
                  setPage(1);
                }}
                className={`relative -mb-px shrink-0 cursor-pointer px-4 py-3 text-[14px] font-semibold uppercase leading-[1.4] transition-colors ${
                  selected
                    ? "text-(--primary-color) after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-(--primary-color)"
                    : "text-[#667085] hover:text-(--primary-color)"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {(error || buyAgain.error) && (
        <p
          role="alert"
          className="bg-[#fae9e9] px-4 py-3 text-[14px] font-medium text-[#cf251f]"
        >
          {error || buyAgain.error}
        </p>
      )}

      <div className="flex flex-col gap-5">
        {isLoading ? (
          <div className="skeleton-delayed flex flex-col gap-5">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="skeleton h-[168px] w-full" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="fade-in">
              <OrderCard order={order} buyAgain={buyAgain} />
            </div>
          ))
        ) : (
          !error && (
            <div className="flex flex-col items-center gap-4 py-16">
              <p className="text-[14px] font-medium text-[#667085]">
                No {activeTab === "All" ? "" : `${activeTab.toLowerCase()} `}
                orders yet.
              </p>
              <Link
                to="/products"
                className="bg-(--primary-color) px-6 py-3 text-[14px] font-semibold uppercase tracking-[0.28px] text-white transition-colors hover:bg-[#a06e1c]"
              >
                Start shopping
              </Link>
            </div>
          )
        )}
      </div>

      <Pager
        page={page}
        pageCount={pageCount}
        onChange={changePage}
        disabled={isLoading}
      />
    </div>
  );
}

export default Orders;
