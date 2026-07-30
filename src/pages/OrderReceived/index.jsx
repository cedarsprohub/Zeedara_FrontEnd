import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CircleCheck, Clock } from "lucide-react";
import YouMayAlsoLike from "../../components/shared/YouMayAlsoLike";
import { useAuth } from "../../context/AuthContext.js";
import { getOrder } from "../../api/orders";
import { formatAmount } from "../../utils/formatCurrency";
import { ORDER_STATUS_LABEL, isPaidStatus } from "../../utils/orderStatus";

const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";

function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

function Cell({ label, children }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
        {label}
      </p>
      <p className="text-[13px] font-medium text-black">{children}</p>
    </div>
  );
}

/** Receipt for a single order, read back from the API by order number. */
function OrderReceived() {
  const { orderNumber } = useParams();
  const { accessToken } = useAuth();

  // Keyed by order number so navigating between orders reads as loading.
  const [state, setState] = useState({
    orderNumber: null,
    order: null,
    error: null,
  });

  const isLoading = state.orderNumber !== orderNumber;
  const { order, error } = isLoading ? { order: null, error: null } : state;

  useEffect(() => {
    let active = true;

    getOrder(orderNumber, { accessToken })
      .then(
        (data) => active && setState({ orderNumber, order: data, error: null }),
      )
      .catch(
        (err) =>
          active &&
          setState({ orderNumber, order: null, error: err.message }),
      );

    return () => {
      active = false;
    };
  }, [orderNumber, accessToken]);

  if (isLoading) {
    return (
      <div className={`mx-auto max-w-[1920px] ${sidePadding} py-24 text-center`}>
        <p className="text-sm text-gray-500">Loading your order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className={`mx-auto flex max-w-[1920px] flex-col items-center gap-4 ${sidePadding} py-24 text-center`}
      >
        <h1 className="text-2xl font-semibold text-black">Order not found</h1>
        <p className="max-w-[460px] text-sm text-gray-500">
          {error || "We couldn't find that order on your account."}
        </p>
        <Link
          to="/account/orders"
          className="bg-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-white transition-opacity hover:opacity-90"
        >
          My orders
        </Link>
      </div>
    );
  }

  const paid = isPaidStatus(order.status);
  const deliveryAddress = [
    order.delivery_address,
    order.delivery_city,
    order.delivery_state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={`mx-auto max-w-[1920px] ${sidePadding} py-8`}>
      <div className="mb-8 flex flex-col items-center gap-6 text-center">
        {/* Status is the order's, not an assumption that landing here means paid. */}
        {paid ? (
          <div className="flex items-center gap-2 bg-green-50 px-6 py-4 text-green-700">
            <CircleCheck className="size-5 shrink-0" />
            <p className="text-[13px] font-medium">
              Thank you. Your order has been received.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[#fbf4e8] px-6 py-4 text-[#d99116]">
            <Clock className="size-5 shrink-0" />
            <p className="text-[13px] font-medium">
              This order is awaiting payment.
            </p>
          </div>
        )}
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </p>
      </div>

      <div className="mb-16 grid grid-cols-2 gap-6 bg-gray-50 p-6 text-center sm:grid-cols-4">
        <Cell label="Order Number">{order.order_number}</Cell>
        <Cell label="Date">{formatOrderDate(order.created_at)}</Cell>
        <Cell label="Total">{formatAmount(order.total_ngn)}</Cell>
        <Cell label="Payment">
          {order.paid_at ? `Paid ${formatOrderDate(order.paid_at)}` : "Pending"}
        </Cell>
      </div>

      <div className="mb-16">
        <h2 className="mb-4 text-[18px] font-semibold text-black">
          Order details
        </h2>
        <div className="border-t border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 py-3 text-xs font-semibold uppercase text-gray-500">
            <span>Items</span>
            <span>Price</span>
          </div>
          {order.items.map((item, index) => (
            <div
              key={`${item.sku}-${index}`}
              className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 text-[13px]"
            >
              <span className="min-w-0">
                <span className="block text-black">{item.product_name}</span>
                <span className="block text-gray-500">
                  {item.variant_name} · SKU {item.sku} ×{item.quantity}
                </span>
              </span>
              <span className="shrink-0 text-black">
                {formatAmount(item.line_total_ngn)}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between border-b border-gray-100 py-2 text-[13px]">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-black">{formatAmount(order.subtotal_ngn)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 py-2 text-[13px]">
            <span className="text-gray-600">
              {order.coupon_code ? `Discount (${order.coupon_code})` : "Discount"}
            </span>
            <span className="text-black">
              −{formatAmount(order.discount_ngn)}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 py-2 text-[13px]">
            <span className="text-gray-600">Delivery fee</span>
            <span className="text-black">
              {formatAmount(order.delivery_fee_ngn)}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 text-[13px] font-semibold">
            <span className="text-black">Total</span>
            <span className="text-black">{formatAmount(order.total_ngn)}</span>
          </div>
        </div>
      </div>

      <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="border border-gray-200 p-6">
          <h3 className="mb-2 text-[16px] font-semibold text-black">
            Contact
          </h3>
          <p className="text-[13px] leading-relaxed text-gray-600">
            {order.customer_name}
            <br />
            {order.customer_email}
            <br />
            {order.customer_phone}
          </p>
        </div>
        <div className="border border-gray-200 p-6">
          <h3 className="mb-2 text-[16px] font-semibold text-black">
            Delivery Address
          </h3>
          <p className="text-[13px] leading-relaxed text-gray-600">
            {deliveryAddress || "—"}
            {order.delivery_method && (
              <>
                <br />
                {order.delivery_method}
              </>
            )}
          </p>
          {order.customer_note && (
            <p className="mt-2 text-[13px] italic text-gray-500">
              “{order.customer_note}”
            </p>
          )}
        </div>
      </div>

      <YouMayAlsoLike />
    </div>
  );
}

export default OrderReceived;
