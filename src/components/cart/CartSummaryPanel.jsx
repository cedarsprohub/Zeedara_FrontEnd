import { Check } from "lucide-react";
import { useId, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency";
import visaIcon from "../../assets/ui/visaIcon.svg";
import mastercardIcon from "../../assets/ui/masterCardIcon.svg";

/**
 * Cart-page order summary.
 *
 * Shows the server's subtotal and nothing it would have to invent. The delivery
 * fee and any discount are set by the API when the order is created, so they're
 * named here but not guessed at — the real figures appear on the checkout review
 * step, before payment.
 */
function CartSummaryPanel({ subtotal, hasIssues = false }) {
  const checkboxId = useId();
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const blocked = !agreedToTerms || hasIssues;

  return (
    <section
      aria-label="Order summary"
      className="flex w-full flex-col gap-4 bg-gray-50 p-6"
    >
      <div className="flex w-full items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-base font-semibold text-black">Subtotal</h2>
        <output className="text-lg font-semibold text-black">
          {formatCurrency(subtotal)}
        </output>
      </div>

      <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Delivery fee</span>
          <span className="text-gray-500">Calculated at checkout</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Discount</span>
          <span className="text-gray-500">Coupon applied at checkout</span>
        </div>
      </div>

      {hasIssues && (
        <p className="bg-[#fae9e9] px-3 py-2 text-xs font-medium text-[#cf251f]">
          Some items need attention before you can check out.
        </p>
      )}

      <div className="inline-flex items-center gap-2">
        <div className="relative inline-flex items-center justify-center">
          <input
            id={checkboxId}
            type="checkbox"
            checked={agreedToTerms}
            onChange={(event) => setAgreedToTerms(event.target.checked)}
            aria-describedby={`${checkboxId}-label`}
            className="peer absolute h-5 w-5 cursor-pointer opacity-0"
          />
          <label
            htmlFor={checkboxId}
            className="inline-flex cursor-pointer items-center justify-center"
          >
            <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-(--primary-color) peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--primary-color)">
              {agreedToTerms ? <Check className="size-4 text-white" /> : null}
            </span>
          </label>
        </div>
        <label
          id={`${checkboxId}-label`}
          htmlFor={checkboxId}
          className="cursor-pointer text-sm text-gray-700"
        >
          I agree with the{" "}
          <NavLink to="/terms" className="underline">
            terms and conditions
          </NavLink>
        </label>
      </div>

      <Link
        to="/checkout"
        aria-disabled={blocked}
        onClick={(event) => {
          if (blocked) event.preventDefault();
        }}
        className="flex h-[52px] w-full items-center justify-center bg-(--primary-color) text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:opacity-90 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
      >
        Proceed to Checkout
      </Link>

      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <p className="text-xs font-medium text-gray-500">
          Guaranteed Safe And Secure Checkout
        </p>
        <div className="flex items-center gap-3 text-gray-400">
          <img src={visaIcon} alt="Visa" className="object-cover" />
          <img src={mastercardIcon} alt="Mastercard" className="object-cover" />
        </div>
      </div>
    </section>
  );
}

export default CartSummaryPanel;
