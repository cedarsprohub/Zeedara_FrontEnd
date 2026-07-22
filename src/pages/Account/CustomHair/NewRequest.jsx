import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";

const PREFERENCES = [
  "Wig",
  "Frontal Wig",
  "Closure Wig",
  "Bundles",
  "Custom Unit",
];

const BUDGETS = [
  "Below ₦50,000",
  "₦50,000 - ₦100,000",
  "₦100,000 - ₦200,000",
  "Above ₦200,000",
];

const inputCls =
  "h-[52px] w-full border border-[#dadde2] px-[17px] text-[14px] text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none";

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[14px] text-[#667085]">{label}</span>
      {children}
    </label>
  );
}

function NewRequest() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(2); // ₦100,000 - ₦200,000
  const [agreed, setAgreed] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder submit — return to the requests list.
    navigate("/account/custom-hair");
  };

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Back (desktop — mobile uses the layout's back button) */}
      <button
        type="button"
        onClick={() => navigate("/account/custom-hair")}
        className="hidden cursor-pointer items-center gap-2 self-start p-2 text-[12px] font-semibold text-(--primary-color) lg:flex"
      >
        <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
        Back
      </button>

      <h1 className="text-[24px] font-semibold leading-[1.4] text-black">
        Custom Wig Request Form
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Contact details + hair preference */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <div className="flex flex-1 flex-col gap-4">
            <h2 className="text-[16px] font-semibold text-black">
              Contact Details
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Full Name">
                <input type="text" className={inputCls} />
              </Field>
              <Field label="WhatsApp Number">
                <input type="tel" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:w-[360px]">
            <h2 className="text-[16px] font-semibold text-black">
              Hair Preference
            </h2>
            <Field label="What do you want?">
              <div className="relative">
                <select
                  defaultValue=""
                  className={`${inputCls} cursor-pointer appearance-none pr-10`}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {PREFERENCES.map((option) => (
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
            </Field>
          </div>
        </div>

        {/* Budget range */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[16px] font-semibold text-black">Budget Range</h2>
          <div className="flex flex-wrap gap-4">
            {BUDGETS.map((label, i) => {
              const active = i === budget;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setBudget(i)}
                  className={`h-10 cursor-pointer border px-4 text-[14px] font-medium transition-colors ${
                    active
                      ? "border-(--primary-color) bg-[#faf4eb] text-(--primary-color)"
                      : "border-[#dadde2] text-[#48505e] hover:border-(--primary-color)"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[16px] font-semibold text-black">
            Upload Inspiration Image
          </h2>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-[14px] text-[#667085] file:mr-3 file:cursor-pointer file:border file:border-[#dadde2] file:bg-white file:px-4 file:py-2 file:text-[14px] file:text-black hover:file:border-(--primary-color)"
          />
        </div>

        {/* Notes */}
        <Field label="Notes (optional)">
          <textarea
            rows={4}
            placeholder="Please include more details like your hair texture, color, wig type, length, and any important information…"
            className="w-full resize-none border border-[#dadde2] p-[17px] text-[14px] text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none"
          />
        </Field>

        {/* Consent */}
        <label className="flex items-start gap-3 text-[14px] text-[#48505e]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#bf8322]"
          />
          <span>
            I understand the final price will be confirmed after Zeedara reviews
            my request.
          </span>
        </label>

        <button
          type="submit"
          disabled={!agreed}
          className="h-[52px] w-full cursor-pointer bg-(--primary-color) text-[14px] font-semibold uppercase tracking-[0.28px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Custom Request
        </button>
      </form>
    </div>
  );
}

export default NewRequest;
