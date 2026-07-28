import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import nigeriaFlag from "../../../assets/auth/flag_nigeria.svg";

const STATES = [
  "Abia",
  "Abuja (FCT)",
  "Anambra",
  "Delta",
  "Enugu",
  "Kano",
  "Lagos",
  "Ogun",
  "Oyo",
  "Rivers",
];

// Delivery options offered at checkout — door delivery to one of the saved
// address types, or collection at a Zeedara pickup station.
const DELIVERY_OPTIONS = [
  "Home Address",
  "Office Address",
  "Pickup Station",
];

const inputCls =
  "h-[52px] w-full border border-[#dadde2] px-[17px] text-[13px] text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none";

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] text-[#667085]">{label}</span>
      {children}
    </label>
  );
}

function Select({ options }) {
  return (
    <div className="relative">
      <select
        defaultValue=""
        className={`${inputCls} cursor-pointer appearance-none pr-10`}
      >
        <option value="" disabled>
          Select
        </option>
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

function PhoneField({ label }) {
  return (
    <Field label={label}>
      <div className="flex h-[52px] items-center border border-[#dadde2] focus-within:border-(--primary-color)">
        <button
          type="button"
          className="flex h-full cursor-pointer items-center gap-1 border-r border-[#dadde2] pl-4 pr-3"
        >
          <img src={nigeriaFlag} alt="Nigeria" className="size-5" />
          <ChevronDown className="size-4 text-[#9fa5b2]" />
        </button>
        <input
          type="tel"
          placeholder="+234"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[13px] text-black placeholder:text-[#9fa5b2] focus:outline-none"
        />
      </div>
    </Field>
  );
}

function NewAddress() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder submit — return to the saved addresses list.
    navigate("/account/address-book");
  };

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Back (desktop — mobile uses the layout's back button) */}
      <button
        type="button"
        onClick={() => navigate("/account/address-book")}
        className="hidden cursor-pointer items-center gap-2 self-start p-2 text-[12px] font-semibold text-(--primary-color) lg:flex"
      >
        <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
        Back
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="First Name">
            <input type="text" className={inputCls} />
          </Field>
          <Field label="Last Name">
            <input type="text" className={inputCls} />
          </Field>

          <Field label="State">
            <Select options={STATES} />
          </Field>
          <Field label="City">
            <input type="text" className={inputCls} />
          </Field>

          <PhoneField label="Phone number" />
          <PhoneField label="Additional Phone number" />
        </div>

        <Field label="Delivery Address">
          <Select options={DELIVERY_OPTIONS} />
        </Field>

        <button
          type="submit"
          className="flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[13px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-[133px] sm:self-start"
        >
          SAVE
        </button>
      </form>
    </div>
  );
}

export default NewAddress;
