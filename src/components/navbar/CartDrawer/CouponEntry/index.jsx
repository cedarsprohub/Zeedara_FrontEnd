import { useId, useState } from "react";

function CouponEntry() {
  const inputId = useId();
  const [couponCode, setCouponCode] = useState("");

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
      <form
        className="flex w-full items-stretch gap-2"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <input
          id={inputId}
          type="text"
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value)}
          aria-label="Coupon code"
          placeholder="Enter coupon code"
          className="h-10 min-w-0 flex-1 border border-gray-300 bg-white px-3 text-sm outline-none focus:border-(--primary-color)"
        />
        <button
          type="submit"
          className="h-10 shrink-0 cursor-pointer bg-(--primary-color) px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Apply
        </button>
      </form>
    </section>
  );
}

export default CouponEntry;
