import { Check } from "lucide-react";
import { useId, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { formatCurrency } from "../../../../utils/formatCurrency";

function Summary({ subtotal }) {
  const checkboxId = useId();
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  return (
    <section
      aria-label="Cart summary and actions"
      className="flex w-full flex-col items-start gap-3"
    >
      <div className="flex w-full items-center justify-between">
        <h2 className="text-base font-semibold text-black">Subtotal</h2>
        <output aria-label="Subtotal amount" className="text-lg font-semibold text-black">
          {formatCurrency(subtotal)}
        </output>
      </div>

      <div className="flex w-full flex-col items-start gap-2">
        <p className="text-sm text-gray-500">
          Shipping, taxes and discount codes are calculated at checkout
        </p>
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
            <label htmlFor={checkboxId} className="inline-flex cursor-pointer items-center justify-center">
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
      </div>

      <div className="flex w-full items-center gap-3">
        <Link
          to="/cart"
          className="flex h-[52px] flex-1 items-center justify-center border border-(--primary-color) text-sm font-semibold uppercase tracking-wide text-(--primary-color) transition-colors hover:bg-[#faf4eb]"
        >
          View Cart
        </Link>
        <Link
          to="/checkout"
          aria-disabled={!agreedToTerms}
          onClick={(event) => {
            if (!agreedToTerms) event.preventDefault();
          }}
          className="flex h-[52px] flex-1 items-center justify-center bg-(--primary-color) text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:opacity-90 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
          Checkout
        </Link>
      </div>
    </section>
  );
}

export default Summary;
