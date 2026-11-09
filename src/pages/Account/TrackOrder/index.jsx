import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.js";
import { getOrder } from "../../../api/orders";
import { formatAmount } from "../../../utils/formatCurrency";
import { ORDER_STATUS_LABEL, statusTone } from "../../../utils/orderStatus";
import NavIcon from "../NavIcon";
import ItemImage from "../Orders/ItemImage";
import { productHref, reviewHref, useBuyAgain } from "../Orders/orderActions";

const STEPS = [
  "Order Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Delivered",
];

// How far along the stepper each state sits. Anything absent from this map has
// no position on the track (see `showTracking` below).
const STEP_INDEX = {
  paid: 0,
  processing: 1,
  packed: 2,
  shipped: 3,
  delivered: 4,
  closed: 4,
};

const SUPPORT_EMAIL = "email@zeedara.com";

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

/**
 * Everything that changes between order states, derived from `OrderStatus`.
 * `showTracking: false` hides the stepper — a cancelled or unpaid order has no
 * track to be on. `itemAction` is the button on each item row.
 */
function describe(order) {
  const status = order.status;
  const tone = statusTone(status);
  const badge = {
    label: (ORDER_STATUS_LABEL[status] ?? status).toUpperCase(),
    className: `${tone.bg} ${tone.text}`,
  };
  const paidLine = order.paid_at
    ? `Paid on ${formatOrderDate(order.paid_at)}`
    : "Payment not yet confirmed";

  if (status === "delivered" || status === "closed") {
    return {
      badge,
      showTracking: true,
      heading: "DELIVERED",
      headingColor: "text-[#0f9959]",
      subline: order.delivered_at
        ? `Delivered on ${formatOrderDate(order.delivered_at)}.`
        : paidLine,
      itemAction: "review",
      actions: ["review", "buyAgain"],
    };
  }

  if (status === "shipped") {
    return {
      badge,
      showTracking: true,
      heading: "YOUR ORDER IS ON THE WAY",
      headingColor: "text-[#206f16]",
      subline: paidLine,
      itemAction: "view",
      actions: ["supportSolid"],
    };
  }

  if (status === "cancelled" || status === "payment_failed") {
    return {
      badge,
      showTracking: false,
      heading:
        status === "cancelled" ? "ORDER WAS CANCELLED" : "PAYMENT FAILED",
      headingColor: "text-[#cf251f]",
      subline:
        status === "cancelled"
          ? "This order won't be delivered."
          : "We couldn't take payment for this order.",
      itemAction: "buy",
      actions: ["support", "buyAgain"],
    };
  }

  if (status === "pending_payment") {
    return {
      badge,
      showTracking: false,
      heading: "AWAITING PAYMENT",
      headingColor: "text-[#d99116]",
      subline: paidLine,
      itemAction: "view",
      actions: ["support", "completePayment"],
    };
  }

  // paid / processing / packed, delivery_failed, and the return + refund states.
  return {
    badge,
    showTracking: status in STEP_INDEX,
    heading:
      status in STEP_INDEX
        ? "YOUR ORDER IS BEING PREPARED"
        : (ORDER_STATUS_LABEL[status] ?? status).toUpperCase(),
    headingColor:
      status === "delivery_failed" ? "text-[#cf251f]" : "text-[#206f16]",
    subline: paidLine,
    itemAction: "view",
    actions: ["supportSolid"],
  };
}

const buttonTone = {
  solid: "bg-(--primary-color) text-white hover:bg-[#a06e1c]",
  soft: "bg-[#faf4eb] text-(--primary-color) hover:bg-[#f3e7d2]",
};

function Action({ label, tone, to, href, onClick, disabled, className }) {
  const cls = `flex cursor-pointer items-center justify-center whitespace-nowrap font-semibold leading-[1.4] transition-colors disabled:cursor-wait disabled:opacity-60 ${buttonTone[tone]} ${className}`;
  if (href) {
    return (
      <a href={href} className={cls}>
        {label}
      </a>
    );
  }
  if (to) {
    return (
      <Link to={to} className={cls}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {label}
    </button>
  );
}

function StepDot({ done }) {
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
        done ? "bg-[#0f9959]" : "bg-[#dadde2]"
      }`}
    >
      {done && <Check className="size-4 text-white" strokeWidth={3} />}
    </span>
  );
}

// The five steps need ~560px across. On a narrower card they stack top to
// bottom instead, so every step stays visible without scrolling sideways.
function Stepper({ reached }) {
  return (
    <div className="@container">
      <ol className="flex flex-col @xl:hidden">
        {STEPS.map((label, i) => (
          <li key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepDot done={i <= reached} />
              {i < STEPS.length - 1 && (
                <span
                  className={`h-5 w-1 transition-colors duration-500 ${
                    i + 1 <= reached ? "bg-[#0f9959]" : "bg-[#dadde2]"
                  }`}
                />
              )}
            </div>
            <span className="pt-1.5 text-[14px] font-medium leading-[1.4] text-[#575f71]">
              {label}
            </span>
          </li>
        ))}
      </ol>
      <div className="hidden items-start @xl:flex">
        {STEPS.map((label, i) => {
          const done = i <= reached;
          const isFirst = i === 0;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span
                  className={`h-1 flex-1 transition-colors duration-500 ${
                    isFirst
                      ? "opacity-0"
                      : i <= reached
                        ? "bg-[#0f9959]"
                        : "bg-[#dadde2]"
                  }`}
                />
                <StepDot done={done} />
                <span
                  className={`h-1 flex-1 transition-colors duration-500 ${
                    isLast
                      ? "opacity-0"
                      : i + 1 <= reached
                        ? "bg-[#0f9959]"
                        : "bg-[#dadde2]"
                  }`}
                />
              </div>
              <span className="mt-2 w-[81px] text-center text-[14px] font-medium leading-[1.4] text-[#575f71]">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// The per-item button. Hidden when it would have nowhere to go (product no
// longer on sale, variant gone).
function ItemAction({ item, kind, buyAgain, index }) {
  const className =
    "h-7 w-full px-4 text-[12px] tracking-[0.24px] @lg:w-[149px]";

  if (kind === "buy") {
    if (!buyAgain.canBuyAgain([item])) return null;
    const key = `item-${index}`;
    return (
      <Action
        label={buyAgain.pendingKey === key ? "ADDING…" : "BUY AGAIN"}
        tone="solid"
        disabled={Boolean(buyAgain.pendingKey)}
        onClick={() => buyAgain.buyAgain(key, [item])}
        className={className}
      />
    );
  }

  const to = kind === "review" ? reviewHref(item) : productHref(item);
  if (!to) return null;
  return (
    <Action
      label={kind === "review" ? "LEAVE REVIEW" : "VIEW PRODUCT"}
      tone="solid"
      to={to}
      className={className}
    />
  );
}

function ItemRow({ item, kind, buyAgain, index }) {
  return (
    <div className="@container flex items-stretch gap-1">
      <ItemImage
        item={item}
        tint="bg-[#f5f5f5]"
        className="w-[88px] @lg:w-[108px]"
      />
      {/* Stacked when narrow (name → price → action); one row from 512px. */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 bg-[#f5f5f5] p-3 @lg:flex-row @lg:items-center @lg:justify-between @lg:gap-4 @lg:p-4">
        <div className="flex min-w-0 flex-col gap-2">
          {productHref(item) ? (
            <Link
              to={productHref(item)}
              className="text-[16px] font-semibold leading-[1.4] text-black hover:text-(--primary-color)"
            >
              {item.product_name}
            </Link>
          ) : (
            <h4 className="text-[16px] font-semibold leading-[1.4] text-black">
              {item.product_name}
            </h4>
          )}
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-[14px] font-medium leading-[1.4] text-[#9fa5b2]">
            <span>{item.variant_name}</span>
            <span>Qty: {item.quantity}</span>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 @lg:w-auto @lg:shrink-0 @lg:items-end">
          <p className="text-[16px] font-semibold leading-[1.4] text-black">
            {formatAmount(item.line_total_ngn)}
          </p>
          <ItemAction
            item={item}
            kind={kind}
            buyAgain={buyAgain}
            index={index}
          />
        </div>
      </div>
    </div>
  );
}

/** Order detail, one screen for every state the order can be in. */
function OrderDetail() {
  const navigate = useNavigate();
  const { orderNumber } = useParams();
  const { accessToken } = useAuth();
  const buyAgain = useBuyAgain();

  // Tagged with the order it belongs to, so navigating between orders reads as
  // loading without a separate flag.
  const [loaded, setLoaded] = useState({
    orderNumber: null,
    order: null,
    error: null,
  });

  const isLoading = loaded.orderNumber !== orderNumber;
  const { order, error } = isLoading ? { order: null, error: null } : loaded;

  useEffect(() => {
    let active = true;
    getOrder(orderNumber, { accessToken })
      .then(
        (data) =>
          active && setLoaded({ orderNumber, order: data, error: null }),
      )
      .catch(
        (err) =>
          active && setLoaded({ orderNumber, order: null, error: err.message }),
      );
    return () => {
      active = false;
    };
  }, [orderNumber, accessToken]);

  // Desktop only — on mobile the account layout's Back (up to Orders) shows.
  const back = (
    <button
      type="button"
      onClick={() => navigate("/account/orders")}
      className="hidden h-8 cursor-pointer items-center gap-2 self-start px-3 text-[12px] font-semibold leading-[1.4] text-(--primary-color) lg:flex"
    >
      <NavIcon name="back" box={16} glyphClassName="-rotate-90 -scale-x-100" />
      Back
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 lg:px-8 lg:py-5">
        {back}
        <div className="skeleton-delayed flex flex-col gap-6">
          <div className="skeleton h-4 w-[240px]" />
          <div className="skeleton h-6 w-[120px]" />
          <div className="skeleton h-[92px] w-full" />
          <div className="flex flex-col gap-6 xl:flex-row">
            <div className="skeleton h-[280px] flex-1" />
            <div className="skeleton h-[280px] xl:w-[400px] 2xl:w-[482px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col gap-6 lg:px-8 lg:py-5">
        {back}
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-[16px] font-semibold text-black">
            Order not found
          </h1>
          <p className="max-w-[420px] text-[14px] font-medium text-[#667085]">
            {error || "We couldn't find that order on your account."}
          </p>
          <Link
            to="/account/orders"
            className="bg-(--primary-color) px-6 py-3 text-[14px] font-semibold uppercase tracking-[0.28px] text-white transition-colors hover:bg-[#a06e1c]"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const config = describe(order);
  const reached = STEP_INDEX[order.status] ?? 0;
  const reviewable = order.items.filter((item) => reviewHref(item));
  const support = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `Order ${order.order_number}`,
  )}`;

  // The design's action row, keeping only actions that lead somewhere.
  const ACTIONS = {
    support: { label: "CONTACT SUPPORT", tone: "soft", href: support },
    supportSolid: { label: "CONTACT SUPPORT", tone: "solid", href: support },
    completePayment: {
      label: "COMPLETE PAYMENT",
      tone: "solid",
      to: "/checkout",
    },
    // One product: straight to its review form. Several: each row has its own.
    review: reviewable.length > 0 && {
      label: "LEAVE REVIEW",
      tone: "soft",
      ...(reviewable.length === 1
        ? { to: reviewHref(reviewable[0]) }
        : {
            onClick: () =>
              document
                .getElementById("order-items")
                ?.scrollIntoView({ behavior: "smooth", block: "start" }),
          }),
    },
    buyAgain: buyAgain.canBuyAgain(order.items) && {
      label:
        buyAgain.pendingKey === "order"
          ? "ADDING TO CART…"
          : order.status === "delivered" || order.status === "closed"
            ? "ORDER AGAIN"
            : "BUY AGAIN",
      tone: "solid",
      disabled: Boolean(buyAgain.pendingKey),
      onClick: () => buyAgain.buyAgain("order", order.items),
    },
  };
  const actions = config.actions.map((key) => ACTIONS[key]).filter(Boolean);

  const paymentRows = [
    { label: "Items subtotal", value: formatAmount(order.subtotal_ngn) },
    { label: "Discount", value: `-${formatAmount(order.discount_ngn)}` },
    { label: "Delivery", value: formatAmount(order.delivery_fee_ngn) },
    {
      // Only call it "paid" when it has been.
      label: order.paid_at ? "Total paid" : "Total due",
      value: formatAmount(order.total_ngn),
    },
  ];

  const addressLines = [
    order.delivery_address,
    [order.delivery_city, order.delivery_state].filter(Boolean).join(", "),
    order.customer_phone,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-[25px] lg:px-8 lg:py-5">
      {back}

      <div className="flex flex-col gap-3">
        {/* Order header */}
        <div className="flex flex-col gap-1 text-[14px] font-medium leading-[1.4] text-[#48505e] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <p>Order ID: {order.order_number}</p>
          <p className="sm:text-right">
            Ordered on {formatOrderDate(order.created_at)}
          </p>
        </div>
        <span className="h-px w-full bg-[#dadde2]" />

        <div className="flex flex-col gap-10">
          {/* Status */}
          {/* Heading beside its buttons once this block is 672px wide — sized by
              the block, since the account rail changes how wide it gets. */}
          <div className="@container flex flex-col gap-2">
            <span
              className={`inline-flex w-fit items-center px-3 py-1 text-[14px] font-semibold leading-[1.4] ${config.badge.className}`}
            >
              {config.badge.label}
            </span>
            <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-end @2xl:justify-between">
              <div className="flex flex-col gap-2">
                <h1
                  className={`text-[20px] font-semibold leading-[1.4] lg:text-[24px] ${config.headingColor}`}
                >
                  {config.heading}
                </h1>
                <p className="text-[14px] font-medium leading-[1.4] text-[#575f71]">
                  {config.subline}
                </p>
              </div>
              {actions.length > 0 && (
                <div className="flex flex-col gap-3 @md:flex-row @md:flex-wrap @2xl:justify-end @2xl:gap-4">
                  {actions.map((action) => (
                    <Action
                      key={action.label}
                      {...action}
                      className="h-10 w-full px-4 text-[14px] tracking-[0.28px] @md:w-[207px]"
                    />
                  ))}
                </div>
              )}
            </div>
            {buyAgain.error && (
              <p
                role="alert"
                className="text-[14px] font-medium text-[#cf251f]"
              >
                {buyAgain.error}
              </p>
            )}
          </div>

          {/* Tracking (hidden for cancelled and unpaid orders) */}
          {config.showTracking && (
            <div className="fade-in flex flex-col gap-3 rounded border border-[#dadde2] bg-[#fcfcfc] px-4 py-4 sm:px-5">
              <h2 className="text-[16px] font-semibold leading-[1.4] text-black">
                Tracking Details
              </h2>
              <Stepper reached={reached} />
            </div>
          )}

          {/* Items + Address/Payment — side by side only once this area is
              1024px wide, so the items keep a usable width beside the summary
              however much room the account rail leaves. */}
          <div className="@container">
            <div className="flex flex-col gap-6 @5xl:flex-row @5xl:items-stretch">
              <section
                id="order-items"
                className="flex min-w-0 flex-1 scroll-mt-40 flex-col gap-4 border border-[#dadde2] p-4"
              >
                <h2 className="text-[16px] font-semibold leading-[1.4] text-black">
                  Items in this order
                </h2>
                <div className="flex flex-col gap-3">
                  {order.items.map((item, index) => (
                    <ItemRow
                      key={`${item.sku}-${index}`}
                      item={item}
                      kind={config.itemAction}
                      buyAgain={buyAgain}
                      index={index}
                    />
                  ))}
                </div>
              </section>

              <div className="flex flex-col gap-3 @5xl:w-[400px] @6xl:w-[482px]">
                <section className="flex flex-col gap-4 border border-[#dadde2] p-4">
                  <h2 className="text-[16px] font-semibold leading-[1.4] text-black">
                    Address
                  </h2>
                  <div className="text-[14px] font-medium leading-[1.4] text-[#667085]">
                    <p className="mb-3.5 font-semibold text-[#48505e]">
                      {order.customer_name}
                    </p>
                    {addressLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    {order.delivery_method && (
                      <p className="mt-2 text-[#9fa5b2]">
                        {order.delivery_method}
                      </p>
                    )}
                  </div>
                </section>

                {/* Payment Summary — every figure is the order's own. */}
                <section className="flex flex-1 flex-col justify-between gap-4 border border-[#dadde2] p-4">
                  <h2 className="text-[16px] font-semibold leading-[1.4] text-black">
                    Payment Summary
                  </h2>
                  {paymentRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-4 text-[14px] font-medium leading-[1.4] text-[#667085]"
                    >
                      <span>{row.label}</span>
                      <span className="text-right">{row.value}</span>
                    </div>
                  ))}
                  {order.coupon_code && (
                    <div className="flex items-center justify-between gap-4 text-[14px] font-medium text-[#9fa5b2]">
                      <span>Coupon</span>
                      <span className="text-right">{order.coupon_code}</span>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
