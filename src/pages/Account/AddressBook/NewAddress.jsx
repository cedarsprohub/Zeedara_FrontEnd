import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import nigeriaFlag from "../../../assets/auth/flag_nigeria.svg";
import { useAuth } from "../../../context/AuthContext.js";
import { updateMe } from "../../../api/auth";

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
const DELIVERY_OPTIONS = ["Home Address", "Office Address", "Pickup Station"];

const inputCls =
  "h-[52px] w-full border border-[#dadde2] px-[17px] text-[13px] text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]";

const emptyForm = {
  firstName: "",
  lastName: "",
  state: "",
  city: "",
  phone: "",
  additionalPhone: "",
  deliveryType: "",
};

// `UserProfileUpdate.address` is a single 500-char string, so the form's parts
// are joined into the lines the address card renders back. Anything the user
// left blank is dropped rather than leaving an empty line behind.
function composeAddress({
  firstName,
  lastName,
  state,
  city,
  phone,
  additionalPhone,
  deliveryType,
}) {
  const phones = [phone, additionalPhone].map((p) => p.trim()).filter(Boolean);

  return [
    `${firstName.trim()} ${lastName.trim()}`.trim(),
    [city.trim(), state.trim()].filter(Boolean).join(", "),
    phones.join(" / "),
    deliveryType,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 500);
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] text-[#667085]">{label}</span>
      {children}
    </label>
  );
}

function Select({ options, value, onChange, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
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

function PhoneField({ label, value, onChange, disabled }) {
  return (
    <Field label={label}>
      <div className="flex h-[52px] items-center border border-[#dadde2] focus-within:border-(--primary-color)">
        <span className="flex h-full shrink-0 items-center gap-1 border-r border-[#dadde2] pl-4 pr-3">
          <img src={nigeriaFlag} alt="Nigeria" className="size-5" />
          <ChevronDown className="size-4 text-[#9fa5b2]" />
        </span>
        <input
          type="tel"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder="+234"
          maxLength={32}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[13px] text-black placeholder:text-[#9fa5b2] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]"
        />
      </div>
    </Field>
  );
}

function NewAddress() {
  const navigate = useNavigate();
  // `RequireAuth` gates this route, so `user` is already loaded by now.
  const { accessToken, setUser } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const update = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const complete =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.state &&
    form.city.trim() &&
    form.phone.trim();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const updated = await updateMe(
        { address: composeAddress(form) },
        accessToken,
      );
      setUser(updated);
      navigate("/account/address-book");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
        {error && (
          <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="First Name">
            <input
              type="text"
              value={form.firstName}
              onChange={(event) => update("firstName")(event.target.value)}
              disabled={saving}
              maxLength={100}
              className={inputCls}
            />
          </Field>
          <Field label="Last Name">
            <input
              type="text"
              value={form.lastName}
              onChange={(event) => update("lastName")(event.target.value)}
              disabled={saving}
              maxLength={100}
              className={inputCls}
            />
          </Field>

          <Field label="State">
            <Select
              options={STATES}
              value={form.state}
              onChange={update("state")}
              disabled={saving}
            />
          </Field>
          <Field label="City">
            <input
              type="text"
              value={form.city}
              onChange={(event) => update("city")(event.target.value)}
              disabled={saving}
              maxLength={100}
              className={inputCls}
            />
          </Field>

          <PhoneField
            label="Phone number"
            value={form.phone}
            onChange={update("phone")}
            disabled={saving}
          />
          <PhoneField
            label="Additional Phone number"
            value={form.additionalPhone}
            onChange={update("additionalPhone")}
            disabled={saving}
          />
        </div>

        <Field label="Delivery Address">
          <Select
            options={DELIVERY_OPTIONS}
            value={form.deliveryType}
            onChange={update("deliveryType")}
            disabled={saving}
          />
        </Field>

        <button
          type="submit"
          disabled={saving || !complete}
          className="flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[13px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#bdc2cb] disabled:opacity-100 sm:w-[133px] sm:self-start"
        >
          {saving ? "SAVING…" : "SAVE"}
        </button>
      </form>
    </div>
  );
}

export default NewAddress;
