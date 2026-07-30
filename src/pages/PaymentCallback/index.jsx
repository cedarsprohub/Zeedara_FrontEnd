import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import { useCart } from "../../context/CartContext.js";
import { verifyPayment } from "../../api/payments";
import {
  clearPendingPayment,
  readPendingPayment,
} from "../../utils/pendingPayment";

/**
 * Where Paystack returns the customer.
 *
 * The only thing this page trusts is `GET /payments/paystack/verify/{reference}`
 * — the server checks the transaction with Paystack, marks the order paid and
 * deducts stock exactly once. A `?paid=true` in the URL, or an edited
 * sessionStorage entry, gets nobody an order: the reference is all this reads
 * from the outside, and the verdict comes back from the API.
 */
function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useCart();

  // `null` while the request is in flight; then either the verify response or
  // the reason it couldn't be checked.
  const [outcome, setOutcome] = useState(null);

  // Paystack uses `reference`; `trxref` is the legacy alias it also appends.
  const pending = readPendingPayment();
  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    pending?.reference ||
    "";
  const orderNumber = pending?.orderNumber ?? null;

  const result = outcome?.response ?? null;
  const error = reference
    ? (outcome?.error ?? null)
    : "No payment reference was returned, so this payment can't be checked.";

  // Derived, so there's no window where the badge says one thing and the state
  // another. `paid` is only ever what the server said.
  const status = !reference
    ? "failed"
    : outcome === null
      ? "verifying"
      : result?.paid
        ? "paid"
        : "failed";

  // StrictMode mounts effects twice in development; verification is idempotent
  // server-side, but there's no reason to ask twice.
  const verified = useRef(false);

  useEffect(() => {
    if (!reference || verified.current) return;
    verified.current = true;

    verifyPayment(reference)
      .then((response) => {
        setOutcome({ response, error: null });
        if (response.paid) {
          clearPendingPayment();
          // The cart has been consumed by the order — resync so the badge and
          // drawer don't keep showing lines that are now paid for.
          refresh();
        }
      })
      .catch((err) => {
        setOutcome({ response: null, error: err.message });
      });
  }, [reference, refresh]);

  // Hand off to the receipt as soon as the server says it's paid.
  useEffect(() => {
    if (status !== "paid" || !result?.order_number) return;
    const timer = setTimeout(
      () => navigate(`/order-received/${result.order_number}`, { replace: true }),
      1200,
    );
    return () => clearTimeout(timer);
  }, [status, result, navigate]);

  const sidePadding = "px-[clamp(1rem,6.25vw,7.5rem)]";
  const fallbackOrder = result?.order_number ?? orderNumber;

  return (
    <div
      className={`mx-auto flex max-w-[1920px] flex-col items-center gap-6 ${sidePadding} py-24 text-center`}
    >
      {status === "verifying" && (
        <>
          <Loader2 className="size-8 animate-spin text-(--primary-color)" />
          <h1 className="text-2xl font-semibold text-black">
            Confirming your payment
          </h1>
          <p className="max-w-[420px] text-sm text-gray-500">
            Don&apos;t close this page — we&apos;re checking the transaction with
            Paystack.
          </p>
        </>
      )}

      {status === "paid" && (
        <>
          <CircleCheck className="size-10 text-green-600" />
          <h1 className="text-2xl font-semibold text-black">Payment confirmed</h1>
          <p className="text-sm text-gray-500">
            Taking you to your order…
          </p>
        </>
      )}

      {status === "failed" && (
        <>
          <CircleX className="size-10 text-[#cf251f]" />
          <h1 className="text-2xl font-semibold text-black">
            Payment not confirmed
          </h1>
          <p className="max-w-[460px] text-sm text-gray-500">
            {error ||
              result?.message ||
              "Paystack hasn't confirmed this payment. If you were charged, it will be reconciled automatically — don't pay twice."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {fallbackOrder && (
              <Link
                to={`/order-received/${fallbackOrder}`}
                className="bg-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-white transition-opacity hover:opacity-90"
              >
                View order
              </Link>
            )}
            <Link
              to="/account/orders"
              className="border border-(--primary-color) px-6 py-3 text-[13px] font-semibold uppercase text-(--primary-color) transition-colors hover:bg-[#faf4eb]"
            >
              My orders
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default PaymentCallback;
