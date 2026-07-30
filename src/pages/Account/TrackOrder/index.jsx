import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.js";
import { getOrder } from "../../../api/orders";
import { formatAmount } from "../../../utils/formatCurrency";
import { ORDER_STATUS_LABEL, statusTone } from "../../../utils/orderStatus";

const STEPS = ["Order Confirmed", "Processing", "Packed", "Shipped", "Delivered"];

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

/**
 * Everything that changes between order states, derived from `OrderStatus`.
 * `showTracking: false` hides the progress stepper — a cancelled or unpaid order
 * has no track to be on.
 */
function describe(order) {
  const status = order.status;
  const tone = statusTone(status);
  const badge = {
    label: ORDER_STATUS_LABEL[status] ?? status,
    bg: tone.bg,
    text: tone.text,
  };

  if (status === "delivered" || status === "closed") {
    return {
      badge,
      showTracking: true,
      heading: "DELIVERED",
      headingColor: "text-[#206f16]",
      itemActionLabel: "LEAVE REVIEW",
    };
  }

  if (status === "shipped") {
    return {
      badge,
      showTracking: true,
      heading: "YOUR ORDER IS ON THE WAY",
      headingColor: "text-[#206f16]",
      itemActionLabel: "VIEW PRODUCT",
    };
  }

  if (status === "cancelled" || status === "payment_failed") {
    return {
      badge,
      showTracking: false,
      heading:
        status === "cancelled" ? "ORDER WAS CANCELLED" : "PAYMENT FAILED",
      headingColor: "text-[#cf251f]",
      itemActionLabel: "BUY AGAIN",
      buyAgain: true,
    };
  }

  if (status === "pending_payment") {
    return {
      badge,
      showTracking: false,
      heading: "AWAITING PAYMENT",
      headingColor: "text-[#d99116]",
      itemActionLabel: "VIEW PRODUCT",
      completePayment: true,
    };
  }

  // paid / processing / packed, and the return + refund states.
  return {
    badge,
    showTracking: status in STEP_INDEX,
    heading:
      status in STEP_INDEX
        ? "YOUR ORDER IS BEING PREPARED"
        : (ORDER_STATUS_LABEL[status] ?? status).toUpperCase(),
    headingColor: "text-[#206f16]",
    itemActionLabel: "VIEW PRODUCT",
  };
}

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

function PillButton({ label, variant, to, href, className }) {
  const styles =
    variant === "soft"
      ? "bg-[#faf4eb] text-(--primary-color) hover:bg-[#f3e7d2]"
      : "bg-(--primary-color) text-white hover:opacity-90";
  const cls = `flex items-center justify-center whitespace-nowrap font-semibold transition-colors ${styles} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {label}
      </a>
    );
  }
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

function Stepper({ reached }) {
  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex min-w-[560px] items-start">
        {STEPS.map((label, i) => {
          const done = i <= reached;
          const leftGreen = i <= reached; // segment entering this step
          const rightGreen = i + 1 <= reached; // segment leaving this step
          const isFirst = i === 0;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span
                  className={`h-1 flex-1 rounded transition-colors duration-500 ${
                    isFirst ? "opacity-0" : leftGreen ? "bg-[#0f9959]" : "bg-[#dadde2]"
                  }`}
                />
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
                    done ? "bg-[#0f9959]" : "bg-[#dadde2]"
                  }`}
                >
                  {done && <Check className="size-4 text-white" strokeWidth={3} />}
                </span>
                <span
                  className={`h-1 flex-1 rounded transition-colors duration-500 ${
                    isLast ? "opacity-0" : rightGreen ? "bg-[#0f9959]" : "bg-[#dadde2]"
                  }`}
                />
              </div>
              <span className="mt-2 w-[81px] text-center text-[13px] font-medium text-[#575f71]">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ItemRow({ item, actionLabel }) {
  return (
    <div className="flex items-stretch bg-[#f5f5f5]">
      {/* `OrderItemPublic` carries no image, so the panel shows the product's
          initial rather than a stand-in photo of something else. */}
      <div className="flex w-[88px] shrink-0 items-center justify-center bg-[#e9e9e9] text-2xl font-semibold text-gray-400 sm:w-[108px]">
        {item.product_name.charAt(0).toUpperCase()}
      </div>
      {/* Stacked on phones (name → price → action); one row from sm up. */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
        <div className="flex min-w-0 flex-col gap-2">
          <h4 className="text-[14px] font-semibold text-black">
            {item.product_name}
          </h4>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-[13px] font-medium text-[#9fa5b2] sm:whitespace-nowrap">
            <span>{item.variant_name}</span>
            <span>Qty: {item.quantity}</span>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:items-end">
          <p className="text-[14px] font-semibold text-black">
            {formatAmount(item.line_total_ngn)}
          </p>
          {/* Order items identify their product by SKU only — no id or slug —
              so "view product" can only search the catalog by name. */}
          <PillButton
            label={actionLabel}
            variant="solid"
            to={`/products?q=${encodeURIComponent(item.product_name)}`}
            className="h-7 w-full px-4 text-[12px] tracking-[0.24px] sm:w-[149px]"
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

  // Tagged with the order it belongs to, so navigating between orders reads as
  // loading without a separate flag.
  const [loaded, setLoaded] = useState({
    orderNumber: null,
    order: null,
    error: null,
  });

  const isLoading = loaded.orderNumber !== orderNumber;
  const { order, error } = isLoading
    ? { order: null, error: null }
    : loaded;

  useEffect(() => {
    let active = true;

    getOrder(orderNumber, { accessToken })
      .then(
        (data) =>
          active && setLoaded({ orderNumber, order: data, error: null }),
      )
      .catch(
        (err) =>
          active &&
          setLoaded({ orderNumber, order: null, error: err.message }),
      );

    return () => {
      active = false;
    };
  }, [orderNumber, accessToken]);

  const back = (
    <button
      type="button"
      onClick={() => navigate("/account/orders")}
      className="hidden cursor-pointer items-center gap-2 self-start p-2 text-[12px] font-semibold text-(--primary-color) transition-colors hover:text-[#8a5f19] lg:flex"
    >
      <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
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
          <p className="max-w-[420px] text-[13px] font-medium text-[#667085]">
            {error || "We couldn't find that order on your account."}
          </p>
          <Link
            to="/account/orders"
            className="bg-(--primary-color) px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.28px] text-white transition-opacity hover:opacity-90"
          >
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const config = describe(order);
  const reached = STEP_INDEX[order.status] ?? 0;
  const firstItemName = order.items[0]?.product_name ?? "";

  // The design's action row, with only actions that actually lead somewhere.
  const actions = [
    {
      label: "CONTACT SUPPORT",
      variant: config.completePayment || config.buyAgain ? "soft" : "solid",
      href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `Order ${order.order_number}`,
      )}`,
    },
    config.completePayment && {
      label: "COMPLETE PAYMENT",
      variant: "solid",
      to: "/checkout",
    },
    config.buyAgain &&
      firstItemName && {
        label: "BUY AGAIN",
        variant: "solid",
        to: `/products?q=${encodeURIComponent(firstItemName)}`,
      },
  ].filter(Boolean);

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
    <div className="flex flex-col gap-6 lg:px-8 lg:py-5">
      {/* Back (desktop — on mobile the layout provides it) */}
      {back}

      {/* Order header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4 text-[13px] font-medium text-[#48505e]">
          <p>Order ID: {order.order_number}</p>
          <p className="text-right">
            Ordered on {formatOrderDate(order.created_at)}
          </p>
        </div>
        <span className="h-px w-full bg-[#dadde2]" />
      </div>

      {/* Status */}
      <div className="flex flex-col gap-3">
        <span
          className={`inline-flex w-fit items-center px-3 py-1 text-[13px] font-semibold ${config.badge.bg} ${config.badge.text}`}
        >
          {config.badge.label}
        </span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2
              className={`text-[20px] font-semibold leading-[1.4] ${config.headingColor}`}
            >
              {config.heading}
            </h2>
            {/* The design showed an estimated delivery window; the API returns no
                such date, so this states what it does know. */}
            <p className="text-[13px] font-medium text-[#575f71]">
              {order.paid_at
                ? `Paid on ${formatOrderDate(order.paid_at)}`
                : "Payment not yet confirmed"}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            {actions.map((action) => (
              <PillButton
                key={action.label}
                {...action}
                className="h-10 w-full px-4 text-[13px] tracking-[0.28px] sm:w-auto sm:min-w-[150px]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tracking (hidden for cancelled and unpaid orders) */}
      {config.showTracking && (
        <div className="fade-in flex flex-col gap-4 rounded border border-[#dadde2] bg-[#fcfcfc] px-5 py-4">
          <h3 className="text-[14px] font-semibold text-black">
            Tracking Details
          </h3>
          <Stepper reached={reached} />
        </div>
      )}

      {/* Items + Address/Payment */}
      {/* Side by side only from xl — at lg the 300px account rail leaves the
          content column too narrow for a 482px summary beside the items. */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
        <div className="flex flex-1 flex-col gap-4 border border-[#dadde2] p-4">
          <h3 className="text-[14px] font-semibold text-black">
            Items in this order
          </h3>
          <div className="flex flex-col gap-3">
            {order.items.map((item, index) => (
              <ItemRow
                key={`${item.sku}-${index}`}
                item={item}
                actionLabel={config.itemActionLabel}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:w-[400px] 2xl:w-[482px]">
          {/* Address */}
          <div className="flex flex-col gap-4 border border-[#dadde2] p-4">
            <h3 className="text-[14px] font-semibold text-black">Address</h3>
            <div className="text-[#575f71]">
              <p className="mb-3.5 text-[13px] font-semibold text-[#48505e]">
                {order.customer_name}
              </p>
              <p className="text-[13px] font-medium leading-[1.4]">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              {order.delivery_method && (
                <p className="mt-2 text-[13px] font-medium text-[#9fa5b2]">
                  {order.delivery_method}
                </p>
              )}
            </div>
          </div>

          {/* Payment Summary — every figure is the order's own. */}
          <div className="flex flex-1 flex-col gap-4 border border-[#dadde2] p-4">
            <h3 className="text-[14px] font-semibold text-black">
              Payment Summary
            </h3>
            <div className="flex flex-col gap-4 text-[13px] font-medium text-[#575f71]">
              {paymentRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4"
                >
                  <span>{row.label}</span>
                  <span className="text-right">{row.value}</span>
                </div>
              ))}
              {order.coupon_code && (
                <div className="flex items-center justify-between gap-4 text-[#9fa5b2]">
                  <span>Coupon</span>
                  <span className="text-right">{order.coupon_code}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
