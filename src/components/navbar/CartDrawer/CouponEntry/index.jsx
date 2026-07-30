import { useId, useState } from "react";
import { validateCoupon } from "../../../../api/coupons";
import { formatAmount } from "../../../../utils/formatCurrency";

/**
 * Coupon field for the checkout form.
 *
 * `POST /coupons/validate` is a preview only: it tells the shopper whether a
 * code works and roughly what it's worth. The discount that ends up on the order
 * is recalculated by the server from the `coupon_code` sent to `/checkout`, so
 * the number shown here never feeds a total.
 */
function CouponEntry({ code, onCodeChange, orderAmount, disabled = false }) {
  const inputId = useId();
  const [draft, setDraft] = useState(code ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const apply = async (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    setError(null);
    setResult(null);

    if (!trimmed) {
      onCodeChange("");
      return;
    }

    setBusy(true);
    try {
      const response = await validateCoupon({
        code: trimmed,
        orderAmount,
      });
      setResult(response);
      // Only carry a code forward that the server recognised.
      onCodeChange(response.valid ? trimmed : "");
    } catch (err) {
      setError(err.message);
      onCodeChange("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="flex w-full flex-col items-start gap-3"
      aria-labelledby={`${inputId}-label`}
    >
      <label
        id={`${inputId}-label`}
        htmlFor={inputId}
        className="text-sm font-medium text-black"
      >
        Apply coupon here
      </label>
      <form className="flex w-full items-stretch gap-2" onSubmit={apply}>
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label="Coupon code"
          placeholder="Enter coupon code"
          maxLength={40}
          disabled={disabled || busy}
          className="h-10 min-w-0 flex-1 border border-gray-300 bg-white px-3 text-sm outline-none focus:border-(--primary-color) disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={disabled || busy}
          className="h-10 shrink-0 cursor-pointer bg-(--primary-color) px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Checking…" : "Apply"}
        </button>
      </form>

      {error && (
        <p className="text-xs font-medium text-[#cf251f]">{error}</p>
      )}

      {result && (
        <p
          className={`text-xs font-medium ${
            result.valid ? "text-[#298d1c]" : "text-[#cf251f]"
          }`}
        >
          {result.message}
          {result.valid && (
            <>
              {" "}
              &mdash; about {formatAmount(result.discount_amount)} off. The exact
              discount is confirmed on your order.
            </>
          )}
        </p>
      )}
    </section>
  );
}

export default CouponEntry;
