import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheck, ChevronDown, Lock } from "lucide-react";
import CouponEntry from "../../components/navbar/CartDrawer/CouponEntry";
import { useAuth } from "../../context/AuthContext.js";
import { useCart } from "../../context/CartContext.js";
import { listAddresses } from "../../api/addresses";
import { checkout, getOrder } from "../../api/orders";
import { initializePayment } from "../../api/payments";
import { formatAmount, formatCurrency } from "../../utils/formatCurrency";
import {
  DELIVERY_METHODS,
  NIGERIAN_STATES,
} from "../../utils/deliveryOptions";
import { isPaidStatus, ORDER_STATUS_LABEL } from "../../utils/orderStatus";
import { savePendingPayment } from "../../utils/pendingPayment";

// Where the customer is sent to pay. Anything that isn't Paystack over TLS is
// refused rather than followed, so a tampered or misconfigured
// `authorization_url` can't be used to bounce shoppers off-site.
function isTrustedPaymentUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "paystack.com" || url.hostname.endsWith(".paystack.com"))
    );
  } catch {
    return false;
  }
}

const inputCls =
  "h-[52px] w-full border border-[#dadde2] px-[17px] text-[13px] font-medium text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]";

function Field({ label, children, required = false }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-[#667085]">
        {label}
        {required && <span className="text-[#d84c47]"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Select({ options, value, onChange, disabled, placeholder = "Select" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`${inputCls} cursor-pointer appearance-none pr-10`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#667085]"
        strokeWidth={2}
      />
    </div>
  );
}

function TotalRow({ label, value, strong = false, muted = false }) {
  return (
    <div className="flex items-center justify-between py-2 text-[13px]">
      <span className={strong ? "font-semibold text-black" : "text-gray-600"}>
        {label}
      </span>
      <span
        className={
          strong
            ? "text-[16px] font-semibold text-black"
            : muted
              ? "text-gray-500"
              : "text-black"
        }
      >
        {value}
      </span>
    </div>
  );
}

// Fields the saved-address picker fills in. Picking a different address drops
// any edits to these so the form can't show one address and submit another.
const ADDRESS_FIELDS = [
  "customerName",
  "customerPhone",
  "deliveryAddress",
  "deliveryCity",
  "deliveryState",
];

function Checkout() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const { cartId, items, subtotal, hasIssues, isLoading, refresh } = useCart();

  // Which step we're on lives in the URL, not in state. An order that exists
  // server-side survives a reload, a back/forward, and a re-mount, so
  // `/checkout?order=…` is the review step and bare `/checkout` is the form —
  // there's no way to be looking at a review whose order the page has forgotten.
  const [searchParams, setSearchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");
  const step = orderNumber ? "review" : "details";

  // Only what the shopper typed lives in state; everything else is derived from
  // the account and the selected address, so there are no prefill effects that
  // could race the data they copy from.
  const [edits, setEdits] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  // Tagged with the order number it was loaded for, so the review step can never
  // show one order's figures under another's number.
  const [loadedOrder, setLoadedOrder] = useState({
    orderNumber: null,
    order: null,
    error: null,
  });
  // An order the shopper stepped back from. It's still a real unpaid order, so
  // the empty-cart state below points at it rather than dead-ending.
  const [abandonedOrder, setAbandonedOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const isOrderCurrent = loadedOrder.orderNumber === orderNumber;
  const order = isOrderCurrent ? loadedOrder.order : null;
  const orderError = isOrderCurrent ? loadedOrder.error : null;
  const isOrderLoading = Boolean(orderNumber) && !isOrderCurrent;

  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";

  // Reads the order back when the page arrives at the review step without it in
  // hand — a reload, or a link straight to `?order=…`. `createOrder` seeds this
  // from its own response, so the common path doesn't refetch.
  useEffect(() => {
    if (!orderNumber || !accessToken || isOrderCurrent) return undefined;
    let active = true;

    getOrder(orderNumber, { accessToken })
      .then(
        (data) =>
          active && setLoadedOrder({ orderNumber, order: data, error: null }),
      )
      .catch(
        (err) =>
          active &&
          setLoadedOrder({ orderNumber, order: null, error: err.message }),
      );

    return () => {
      active = false;
    };
  }, [orderNumber, accessToken, isOrderCurrent]);

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    listAddresses(accessToken)
      .then((rows) => {
        if (!active) return;
        const list = Array.isArray(rows) ? rows : [];
        setAddresses(list);
        const preferred = list.find((address) => address.is_default) ?? list[0];
        if (preferred) setAddressId(preferred.id);
      })
      .catch(() => {
        // The address book is a convenience — the form still works without it.
        if (active) setAddresses([]);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  const selectedAddress =
    addresses.find((entry) => entry.id === addressId) ?? null;

  const defaults = {
    customerName:
      selectedAddress?.recipient_name ||
      [user?.first_name, user?.last_name].filter(Boolean).join(" "),
    customerEmail: user?.email ?? "",
    customerPhone: selectedAddress?.phone || user?.phone_number || "",
    deliveryAddress: selectedAddress?.delivery_address ?? "",
    deliveryCity: selectedAddress?.city ?? "",
    deliveryState: selectedAddress?.state ?? "",
    deliveryMethod: DELIVERY_METHODS[0],
    customerNote: "",
  };

  // An edit wins over the derived default; `undefined` means "not touched".
  const form = { ...defaults, ...edits };
  const update = (key) => (value) =>
    setEdits((prev) => ({ ...prev, [key]: value }));

  const selectAddress = (id) => {
    setAddressId(id);
    setEdits((prev) => {
      const next = { ...prev };
      for (const field of ADDRESS_FIELDS) delete next[field];
      return next;
    });
  };

  const detailsComplete =
    form.customerName.trim() &&
    form.customerEmail.trim() &&
    form.customerPhone.trim().length >= 7 &&
    form.deliveryAddress.trim();

  const createOrder = async (event) => {
    event.preventDefault();
    setError(null);

    if (!cartId) {
      setError("Your cart is no longer available. Add an item and try again.");
      return;
    }

    setBusy(true);
    try {
      // No amounts are sent — the server prices the order from the cart and the
      // coupon code, and its response is what the customer is shown.
      const created = await checkout(
        {
          cartId,
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim(),
          deliveryAddress: form.deliveryAddress.trim(),
          deliveryCity: form.deliveryCity.trim(),
          deliveryState: form.deliveryState.trim(),
          deliveryMethod: form.deliveryMethod,
          couponCode,
          customerNote: form.customerNote.trim(),
        },
        accessToken,
      );
      setLoadedOrder({
        orderNumber: created.order_number,
        order: created,
        error: null,
      });
      setAbandonedOrder(null);
      // The cart has been spent creating the order. Resync it so the navbar
      // badge and the drawer stop offering lines that are now on an order.
      refresh();
      // Replaces rather than pushes: the form behind us can't be submitted again
      // against a cart the order now holds, so Back should leave checkout.
      setSearchParams({ order: created.order_number }, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Steps back to the form. The order isn't cancelled — there's no endpoint for
  // that, and it's still payable from the order history — so it's remembered
  // here and surfaced instead of vanishing.
  const changeDetails = async () => {
    setError(null);
    setAbandonedOrder(orderNumber);
    setBusy(true);
    try {
      // The cart may or may not have survived creating the order; read it back
      // rather than showing a form built on what it held a moment ago.
      await refresh();
    } finally {
      setBusy(false);
    }
    setSearchParams({}, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pay = async () => {
    setError(null);
    setBusy(true);
    try {
      const session = await initializePayment(order.order_number, accessToken);

      if (!isTrustedPaymentUrl(session.authorization_url)) {
        setError(
          "The payment link returned by the server was not recognised. Your order is saved — contact support before trying again.",
        );
        return;
      }

      savePendingPayment({
        orderNumber: order.order_number,
        reference: session.reference,
      });

      window.location.assign(session.authorization_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // The cart only gates the form. Once an order exists it's the order that
  // matters, and the cart behind it may already be spent.
  if (step === "review" ? isOrderLoading : isLoading) {
    return (
      <div className={`mx-auto max-w-[1920px] ${sidePadding} py-24 text-center`}>
        <p className="text-sm text-gray-500">
          {step === "review" ? "Loading your order…" : "Loading your cart…"}
        </p>
      </div>
    );
  }

  // A `?order=` the API won't return — someone else's, cancelled, mistyped.
  if (step === "review" && !order) {
    return (
      <div
        className={`mx-auto flex max-w-[1920px] flex-col items-center gap-4 ${sidePadding} py-24 text-center`}
      >
        <h1 className="text-2xl font-semibold text-black">Order not found</h1>
        <p className="max-w-[460px] text-sm text-gray-500">
          {orderError || "We couldn't find that order on your account."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/account/orders"
            className="bg-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-white transition-opacity hover:opacity-90"
          >
            My orders
          </Link>
          <Link
            to="/cart"
            className="border border-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-(--primary-color) transition-colors hover:bg-[#faf4eb]"
          >
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  if (step === "details" && items.length === 0) {
    return (
      <div
        className={`mx-auto flex max-w-[1920px] flex-col items-center gap-4 ${sidePadding} py-24 text-center`}
      >
        <h1 className="text-2xl font-semibold text-black">
          Your cart is empty
        </h1>
        {/* Stepping back from a created order empties the cart — the order holds
            those lines now. Saying so, with the way back, beats a bare empty
            state that looks like the order was lost. */}
        {abandonedOrder ? (
          <>
            <p className="max-w-[460px] text-sm text-gray-500">
              Order {abandonedOrder} holds those items and is still awaiting
              payment.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/checkout?order=${encodeURIComponent(abandonedOrder)}`}
                className="bg-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-white transition-opacity hover:opacity-90"
              >
                Review and pay
              </Link>
              <Link
                to="/account/orders"
                className="border border-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-(--primary-color) transition-colors hover:bg-[#faf4eb]"
              >
                My orders
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              Add something to it before checking out.
            </p>
            <Link
              to="/products"
              className="bg-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-white transition-opacity hover:opacity-90"
            >
              Continue shopping
            </Link>
          </>
        )}
      </div>
    );
  }

  // Everything below is the server's, straight off the order. `items` has been
  // optional on `OrderResponse` in practice, and a missing array shouldn't take
  // the page down with it.
  const orderItems = order?.items ?? [];
  const orderPaid = Boolean(order) && isPaidStatus(order.status);
  const discount = Number(order?.discount_ngn ?? 0);

  return (
    <div className={`mx-auto max-w-[1920px] ${sidePadding} py-8`}>
      <h1 className="mb-6 text-2xl font-semibold text-black">
        {step === "details" ? "Checkout" : "Review your order"}
      </h1>

      {error && (
        <p className="mb-6 max-w-[699px] bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
          {error}
        </p>
      )}

      {step === "details" ? (
        <form
          onSubmit={createOrder}
          className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"
        >
          <div className="flex flex-col gap-6">
            {hasIssues && (
              <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
                Some cart items are unavailable or have been repriced.{" "}
                <Link to="/cart" className="font-semibold underline">
                  Review your cart
                </Link>{" "}
                before continuing.
              </p>
            )}

            {/* Submitting again makes a second order — the first one isn't
                cancelled by stepping back — so say so before they do. */}
            {abandonedOrder && (
              <p className="bg-[#fbf4e8] px-4 py-3 text-[13px] font-medium text-[#d99116]">
                Order {abandonedOrder} is still awaiting payment. Continuing here
                creates a separate order —{" "}
                <Link
                  to={`/checkout?order=${encodeURIComponent(abandonedOrder)}`}
                  className="font-semibold underline"
                >
                  go back to it
                </Link>{" "}
                instead if you only wanted to pay.
              </p>
            )}

            {addresses.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[16px] font-semibold text-black">
                  Deliver to
                </h2>
                <div className="flex flex-col gap-2">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                        addressId === address.id
                          ? "border-(--primary-color) bg-[#faf4eb]"
                          : "border-[#dadde2] hover:border-(--primary-color)"
                      }`}
                    >
                      <input
                        type="radio"
                        name="saved-address"
                        checked={addressId === address.id}
                        onChange={() => selectAddress(address.id)}
                        className="mt-1 size-4 accent-(--primary-color)"
                      />
                      <span className="flex flex-col gap-0.5 text-[13px]">
                        <span className="font-semibold text-black">
                          {address.recipient_name}
                          {address.is_default ? " · Default" : ""}
                        </span>
                        <span className="text-[#48505e]">
                          {[
                            address.delivery_address,
                            address.city,
                            address.state,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                        <span className="text-[#667085]">{address.phone}</span>
                      </span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => selectAddress("")}
                    className="w-fit cursor-pointer text-[13px] font-semibold text-(--primary-color) underline"
                  >
                    Enter a different address
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <h2 className="text-[16px] font-semibold text-black">
                Delivery details
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Full name" required>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => update("customerName")(e.target.value)}
                    maxLength={200}
                    disabled={busy}
                    required
                    className={inputCls}
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => update("customerEmail")(e.target.value)}
                    autoComplete="email"
                    disabled={busy}
                    required
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone number" required>
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => update("customerPhone")(e.target.value)}
                    minLength={7}
                    maxLength={32}
                    autoComplete="tel"
                    disabled={busy}
                    required
                    className={inputCls}
                  />
                </Field>
                <Field label="Delivery method">
                  <Select
                    options={DELIVERY_METHODS}
                    value={form.deliveryMethod}
                    onChange={update("deliveryMethod")}
                    disabled={busy}
                  />
                </Field>
              </div>

              <Field label="Delivery address" required>
                <input
                  type="text"
                  value={form.deliveryAddress}
                  onChange={(e) => update("deliveryAddress")(e.target.value)}
                  maxLength={300}
                  disabled={busy}
                  required
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="City">
                  <input
                    type="text"
                    value={form.deliveryCity}
                    onChange={(e) => update("deliveryCity")(e.target.value)}
                    maxLength={120}
                    disabled={busy}
                    className={inputCls}
                  />
                </Field>
                <Field label="State">
                  <Select
                    options={NIGERIAN_STATES}
                    value={form.deliveryState}
                    onChange={update("deliveryState")}
                    disabled={busy}
                  />
                </Field>
              </div>

              <Field label="Order note (optional)">
                <textarea
                  value={form.customerNote}
                  onChange={(e) => update("customerNote")(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  disabled={busy}
                  className="w-full border border-[#dadde2] p-[17px] text-[13px] font-medium text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none disabled:bg-[#f7f8fa]"
                />
              </Field>
            </div>
          </div>

          <aside className="flex h-fit w-full flex-col gap-4 bg-gray-50 p-6">
            <h2 className="text-[16px] font-semibold text-black">
              {items.length} {items.length === 1 ? "item" : "items"}
            </h2>

            <div className="flex flex-col divide-y divide-gray-200">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 py-2 text-[13px]"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-black">
                      {item.product_name}
                    </span>
                    <span className="block text-gray-500">
                      {item.variant_name} × {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 text-black">
                    {formatAmount(item.line_total_ngn)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-2">
              <TotalRow label="Subtotal" value={formatCurrency(subtotal)} />
              <TotalRow
                label="Delivery fee"
                value="Confirmed on the next step"
                muted
              />
            </div>

            <CouponEntry
              code={couponCode}
              onCodeChange={setCouponCode}
              orderAmount={subtotal}
              disabled={busy}
            />

            <button
              type="submit"
              disabled={busy || !detailsComplete || hasIssues}
              className="flex h-[52px] w-full cursor-pointer items-center justify-center bg-(--primary-color) text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#bdc2cb]"
            >
              {busy ? "Creating order…" : "Continue to review"}
            </button>

            <p className="text-center text-xs text-gray-500">
              Nothing is charged until you confirm the total on the next step.
            </p>
          </aside>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-6">
            {/* The banner is the order's real status, not an assumption that
                being on this step means unpaid — landing here from history, or
                after paying and hitting Back, are both normal. */}
            {orderPaid ? (
              <div className="flex items-center gap-2 bg-[#eefeec] px-4 py-3 text-[13px] font-medium text-[#298d1c]">
                <CircleCheck className="size-4 shrink-0" />
                Order {order.order_number} is paid —{" "}
                {ORDER_STATUS_LABEL[order.status] ?? order.status}. Nothing more
                to do here.
              </div>
            ) : (
              <div className="bg-[#fbf4e8] px-4 py-3 text-[13px] font-medium text-[#d99116]">
                Order {order.order_number} is reserved and awaiting payment.
              </div>
            )}

            <div>
              <h2 className="mb-3 text-[16px] font-semibold text-black">
                Items
              </h2>
              <div className="border-t border-gray-200">
                {orderItems.map((item, index) => (
                  <div
                    key={`${item.sku}-${index}`}
                    className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 text-[13px]"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium text-black">
                        {item.product_name}
                      </span>
                      <span className="block text-gray-500">
                        {item.variant_name} · SKU {item.sku} ×{item.quantity}
                      </span>
                    </span>
                    <span className="shrink-0 text-black">
                      {formatAmount(item.line_total_ngn)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 p-6">
              <h3 className="mb-2 text-[16px] font-semibold text-black">
                Delivering to
              </h3>
              <p className="text-[13px] leading-relaxed text-gray-600">
                {order.customer_name}
                <br />
                {[order.delivery_address, order.delivery_city, order.delivery_state]
                  .filter(Boolean)
                  .join(", ")}
                <br />
                {order.customer_phone}
                <br />
                {order.customer_email}
              </p>
              {order.delivery_method && (
                <p className="mt-2 text-[13px] text-gray-500">
                  Method: {order.delivery_method}
                </p>
              )}
            </div>

            {!orderPaid && (
              <button
                type="button"
                onClick={changeDetails}
                disabled={busy}
                className="w-fit cursor-pointer text-[13px] font-semibold text-(--primary-color) underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Change delivery details
              </button>
            )}
          </div>

          {/* Every figure here is the server's, straight off the created order. */}
          <aside className="flex h-fit w-full flex-col gap-4 bg-gray-50 p-6">
            <h2 className="text-[16px] font-semibold text-black">
              Order total
            </h2>

            <div>
              <TotalRow
                label="Subtotal"
                value={formatAmount(order.subtotal_ngn)}
              />
              {/* A zero discount row read as though a coupon had failed. Only
                  shown when there's actually one to show. */}
              {discount > 0 && (
                <TotalRow
                  label={
                    order.coupon_code
                      ? `Discount (${order.coupon_code})`
                      : "Discount"
                  }
                  value={`−${formatAmount(order.discount_ngn)}`}
                />
              )}
              <TotalRow
                label="Delivery fee"
                value={formatAmount(order.delivery_fee_ngn)}
              />
              <div className="border-t border-gray-200">
                <TotalRow
                  label="Total"
                  value={formatAmount(order.total_ngn)}
                  strong
                />
              </div>
            </div>

            {/* Never offer to pay an order the server already considers paid —
                that's the one action on this page that costs money twice. */}
            {orderPaid ? (
              <Link
                to={`/order-received/${encodeURIComponent(order.order_number)}`}
                className="flex h-[52px] w-full items-center justify-center bg-(--primary-color) text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
              >
                View your order
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={pay}
                  disabled={busy}
                  className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 bg-(--primary-color) text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#bdc2cb]"
                >
                  <Lock className="size-4" />
                  {busy
                    ? "Opening payment…"
                    : `Pay ${formatAmount(order.total_ngn)}`}
                </button>

                <p className="text-center text-xs text-gray-500">
                  You&apos;ll be taken to Paystack to pay securely. Your order is
                  confirmed only after we verify the payment.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/account/orders")}
                  className="cursor-pointer text-center text-xs font-semibold text-(--primary-color) underline"
                >
                  Pay later from my orders
                </button>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default Checkout;
