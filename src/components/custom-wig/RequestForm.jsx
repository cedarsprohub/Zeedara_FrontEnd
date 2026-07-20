import { useState } from "react";
import { ChevronDown, CircleCheck } from "lucide-react";

const hairPreferenceOptions = [
  "Full Lace Wig",
  "Lace Frontal Wig",
  "Closure Wig",
  "Braided Wig",
  "Bundles",
];

const budgetOptions = [
  "Below ₦50,000",
  "₦50,000 - ₦100,000",
  "₦100,000 - ₦200,000",
  "Above ₦200,000",
];

const inputWrapperClass =
  "flex h-[52px] items-center gap-2 border border-[#dadde2] px-[17px] focus-within:border-(--primary-color)";
const inputClass =
  "min-w-0 flex-1 bg-transparent text-[14px] text-black placeholder:text-[#9fa5b2] focus:outline-none";
const labelClass = "text-[14px] font-medium text-[#575f71]";

function RequestForm() {
  const [budget, setBudget] = useState(null);
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (event) => {
    setFileName(event.target.files?.[0]?.name ?? "");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 border border-gray-200 px-6 py-16 text-center">
        <CircleCheck
          className="size-12 text-(--primary-color)"
          strokeWidth={1.5}
        />
        <h3 className="font-['Anton'] text-2xl capitalize text-black">
          Request Received
        </h3>
        <p className="max-w-[420px] text-sm text-gray-500">
          Thank you! Our VIP representative will review your request and reach
          out to you with the final quote and next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h3 className="font-['Anton'] text-lg capitalize text-black">
            Contact Details
          </h3>
          <div className="flex flex-col gap-2">
            <label htmlFor="wig-full-name" className={labelClass}>
              Full Name
            </label>
            <div className={inputWrapperClass}>
              <input
                id="wig-full-name"
                type="text"
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="wig-whatsapp" className={labelClass}>
              WhatsApp Number
            </label>
            <div className={inputWrapperClass}>
              <input
                id="wig-whatsapp"
                type="tel"
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-['Anton'] text-lg capitalize text-black">
            Hair Preference
          </h3>
          <div className="flex flex-col gap-2">
            <label htmlFor="wig-preference" className={labelClass}>
              What do you want?
            </label>
            <div className={`relative ${inputWrapperClass}`}>
              <select
                id="wig-preference"
                required
                defaultValue=""
                className={`${inputClass} appearance-none pr-6`}
              >
                <option value="" disabled>
                  Select
                </option>
                {hairPreferenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-[17px] size-5 shrink-0 text-[#9fa5b2]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-['Anton'] text-lg capitalize text-black">
          Budget Range
        </h3>
        <div className="flex flex-wrap gap-3">
          {budgetOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setBudget(option)}
              aria-pressed={budget === option}
              className={`cursor-pointer border px-4 py-2 text-sm font-medium transition-colors ${
                budget === option
                  ? "border-(--primary-color) bg-(--primary-color) text-white"
                  : "border-gray-300 text-gray-700 hover:border-(--primary-color)"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-['Anton'] text-lg capitalize text-black">
          Upload Inspiration Image
        </h3>
        <div className="flex items-center gap-3">
          <label
            htmlFor="wig-inspiration-image"
            className="cursor-pointer border border-[#dadde2] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#f7f8fa]"
          >
            Choose file
          </label>
          <input
            id="wig-inspiration-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
          <span className="text-sm text-[#9fa5b2]">
            {fileName || "No file chosen"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="wig-notes" className={labelClass}>
          Notes (optional)
        </label>
        <textarea
          id="wig-notes"
          rows={4}
          placeholder="Please include more details like your hair texture, color, wig type, length, and any important information..."
          className="border border-[#dadde2] p-[17px] text-[14px] text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none"
        />
      </div>

      <p className="text-xs text-gray-500">
        I understand the final price will be confirmed after Zeedara reviews my
        request.
      </p>

      <button
        type="submit"
        className="w-full cursor-pointer bg-(--primary-color) px-6 py-4 text-center text-[16px] font-bold uppercase text-white transition-opacity hover:opacity-90"
      >
        Submit Custom Request
      </button>
    </form>
  );
}

export default RequestForm;
