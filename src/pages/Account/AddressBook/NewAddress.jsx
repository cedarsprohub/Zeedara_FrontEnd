import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import nigeriaFlag from "../../../assets/auth/flag_nigeria.svg";
import { useAuth } from "../../../context/AuthContext.js";
import {
  createAddress,
  listAddresses,
  updateAddress,
} from "../../../api/addresses";
import {
  MAX_SAVED_ADDRESSES,
  NIGERIAN_STATES,
} from "../../../utils/deliveryOptions";

const inputCls =
  "h-[52px] w-full border border-[#dadde2] px-[17px] text-[13px] text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]";

const emptyForm = {
  firstName: "",
  lastName: "",
  state: "",
  city: "",
  phone: "",
  deliveryAddress: "",
  isDefault: false,
};

// `recipient_name` is one field on the API but two on this form, so the first
// word is the first name and whatever follows is the surname.
function splitRecipient(name) {
  const parts = (name ?? "").trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function addressToForm(address) {
  return {
    ...splitRecipient(address.recipient_name),
    state: address.state ?? "",
    city: address.city ?? "",
    phone: address.phone ?? "",
    deliveryAddress: address.delivery_address ?? "",
    isDefault: address.is_default ?? false,
  };
}

function Field({ label, children, required = false }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] text-[#667085]">
        {label}
        {required && <span className="text-[#d84c47]"> *</span>}
      </span>
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
        <option value="">Select</option>
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

/**
 * The saved-address form, in both modes: adding a new address
 * (`POST /api/v1/addresses`) and editing an existing one
 * (`PATCH /api/v1/addresses/{id}`), where every field starts populated with what
 * is already saved. This collection is what the checkout address picker reads.
 *
 * `AddressCreate` takes one required `delivery_address` string, so that field is
 * a free-text input. There's no second phone field — the API stores one `phone`
 * per address, and an input that saved nowhere would just lose what was typed.
 */
function NewAddress() {
  const navigate = useNavigate();
  const { addressId } = useParams();
  const { accessToken } = useAuth();

  const isEditing = Boolean(addressId);

  // There's no "get one address" route, so the list serves both jobs: it
  // populates the fields when editing, and counts against the cap when adding.
  const [loaded, setLoaded] = useState({
    token: null,
    addresses: null,
    error: null,
  });
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;

    listAddresses(accessToken)
      .then((rows) => {
        if (!active) return;
        setLoaded({
          token: accessToken,
          addresses: Array.isArray(rows) ? rows : [],
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;
        setLoaded({ token: accessToken, addresses: [], error: err.message });
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  const isLoading = Boolean(accessToken) && loaded.token !== accessToken;
  const addresses = loaded.addresses ?? [];
  const existing = isEditing
    ? (addresses.find((entry) => entry.id === addressId) ?? null)
    : null;

  // Saved values are the baseline; only what's been typed overrides them, so no
  // effect has to copy the address into state once it arrives.
  const baseline = existing ? addressToForm(existing) : emptyForm;
  const form = { ...baseline, ...edits };
  const update = (key) => (value) =>
    setEdits((prev) => ({ ...prev, [key]: value }));

  const atCapacity =
    !isEditing && addresses.length >= MAX_SAVED_ADDRESSES;

  const complete =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.deliveryAddress.trim() &&
    form.phone.trim().length >= 7;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      recipientName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      phone: form.phone.trim(),
      deliveryAddress: form.deliveryAddress.trim(),
      city: form.city.trim(),
      state: form.state,
      isDefault: form.isDefault,
    };

    try {
      if (isEditing) {
        // PATCH is partial, but every field here is on screen and editable, so
        // sending them all keeps what's saved identical to what was shown.
        await updateAddress(
          addressId,
          {
            recipient_name: payload.recipientName,
            phone: payload.phone,
            delivery_address: payload.deliveryAddress,
            city: payload.city || null,
            state: payload.state || null,
            is_default: payload.isDefault,
          },
          accessToken,
        );
      } else {
        await createAddress(payload, accessToken);
      }
      navigate("/account/address-book");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const back = (
    <button
      type="button"
      onClick={() => navigate("/account/address-book")}
      className="hidden cursor-pointer items-center gap-2 self-start p-2 text-[12px] font-semibold text-(--primary-color) lg:flex"
    >
      <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
      Back
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 lg:p-8">
        {back}
        <p className="py-16 text-center text-[13px] font-medium text-[#667085]">
          Loading…
        </p>
      </div>
    );
  }

  // Editing an id that isn't in the book — stale link, or it's been deleted.
  if (isEditing && !existing) {
    return (
      <div className="flex flex-col gap-6 lg:p-8">
        {back}
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-[13px] font-medium text-[#667085]">
            That address is no longer saved to your account.
          </p>
          <Link
            to="/account/address-book"
            className="bg-(--primary-color) px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.28px] text-white transition-opacity hover:opacity-90"
          >
            Back to addresses
          </Link>
        </div>
      </div>
    );
  }

  if (atCapacity) {
    return (
      <div className="flex flex-col gap-6 lg:p-8">
        {back}
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-[16px] font-semibold text-black">
            You&apos;ve saved the maximum of {MAX_SAVED_ADDRESSES} addresses
          </h1>
          <p className="max-w-[420px] text-[13px] font-medium text-[#667085]">
            Edit one of your saved addresses, or delete one to make room for a
            new entry.
          </p>
          <Link
            to="/account/address-book"
            className="bg-(--primary-color) px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.28px] text-white transition-opacity hover:opacity-90"
          >
            Back to addresses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Back (desktop — mobile uses the layout's back button) */}
      {back}

      <h1 className="text-[16px] font-semibold text-black">
        {isEditing ? "Edit Address" : "Add New Address"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {(error || loaded.error) && (
          <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
            {error || loaded.error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="First Name" required>
            <input
              type="text"
              value={form.firstName}
              onChange={(event) => update("firstName")(event.target.value)}
              maxLength={100}
              disabled={saving}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Last Name" required>
            <input
              type="text"
              value={form.lastName}
              onChange={(event) => update("lastName")(event.target.value)}
              maxLength={100}
              disabled={saving}
              required
              className={inputCls}
            />
          </Field>

          <Field label="State">
            <Select
              options={NIGERIAN_STATES}
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
              maxLength={120}
              disabled={saving}
              className={inputCls}
            />
          </Field>

          <Field label="Phone number" required>
            <div className="flex h-[52px] items-center border border-[#dadde2] focus-within:border-(--primary-color)">
              <span className="flex h-full shrink-0 items-center gap-1 border-r border-[#dadde2] pl-4 pr-3">
                <img src={nigeriaFlag} alt="Nigeria" className="size-5" />
                <ChevronDown className="size-4 text-[#9fa5b2]" />
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => update("phone")(event.target.value)}
                placeholder="+234"
                minLength={7}
                maxLength={32}
                disabled={saving}
                required
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-[13px] text-black placeholder:text-[#9fa5b2] focus:outline-none disabled:bg-[#f7f8fa]"
              />
            </div>
          </Field>
        </div>

        <Field label="Delivery Address" required>
          <input
            type="text"
            value={form.deliveryAddress}
            onChange={(event) => update("deliveryAddress")(event.target.value)}
            placeholder="House number, street, area and any landmark"
            maxLength={500}
            disabled={saving}
            required
            className={inputCls}
          />
        </Field>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-[13px] text-[#48505e]">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(event) => update("isDefault")(event.target.checked)}
            disabled={saving}
            className="size-4 accent-(--primary-color)"
          />
          Make this my default delivery address
        </label>

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
