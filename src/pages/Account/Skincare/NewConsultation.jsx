import { useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import {
  checkoutConsultation,
  createConsultation,
  uploadConsultationPhoto,
} from "../../../api/skincare";
import NavIcon from "../NavIcon";
import { Glyph } from "./Glyph";
import {
  AVAILABILITY,
  CONCERNS,
  LIST_ROUTE,
  MAX_CONCERNS,
  SKIN_TYPES,
} from "./options";

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const labelCls = "text-[14px] font-medium leading-[1.4] text-[#575f71]";
// Colour is left out of the shared box so the select can grey its placeholder
// without two text-colour utilities fighting over it.
const boxCls =
  "h-[58px] w-full border border-[#dadde2] bg-white px-[17px] text-[14px] font-medium placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none aria-invalid:border-[#cf251f]";
const inputCls = `${boxCls} text-black`;
const headingCls =
  "font-['Anton'] text-[24px] leading-[1.4] text-black sm:text-[30px]";

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="text-[13px] font-medium text-[#cf251f]">
      {children}
    </p>
  );
}

function Chip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`cursor-pointer border px-[17px] py-[9px] text-[14px] font-semibold leading-[1.4] transition-colors ${
        selected
          ? "border-(--primary-color) bg-[#faf4eb] text-(--primary-color)"
          : "border-[#575f71] text-[#575f71] hover:border-(--primary-color) hover:text-(--primary-color)"
      }`}
    >
      {children}
    </button>
  );
}

function validate(form, photoError) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Enter your full name.";
  if (form.phone.replace(/\D/g, "").length < 7)
    errors.phone = "Enter a WhatsApp number we can reach you on.";
  if (!form.skinType) errors.skinType = "Select your skin type.";
  if (form.concerns.length === 0)
    errors.concerns = "Choose at least one concern.";
  if (form.availability.length === 0)
    errors.availability = "Choose at least one time that works for you.";
  if (photoError) errors.photo = photoError;
  if (!form.agreed) errors.agreed = "Please confirm to continue.";
  return errors;
}

function NewConsultation() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const ids = useId();
  const fileInput = useRef(null);

  const [form, setForm] = useState(() => ({
    fullName: [user?.first_name, user?.last_name].filter(Boolean).join(" "),
    phone: user?.phone_number ?? "",
    skinType: "",
    concerns: [],
    availability: [],
    description: "",
    agreed: false,
  }));
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(null); // null | "saving" | "uploading" | "paying"
  const [submitError, setSubmitError] = useState(null);
  // Once the request exists, a retry must not create a second one.
  const [createdId, setCreatedId] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggle = (key, value, max) => {
    const list = form[key];
    if (list.includes(value)) set(key)(list.filter((v) => v !== value));
    else if (!max || list.length < max) set(key)([...list, value]);
  };

  const choosePhoto = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setPhoto(null);
      setPhotoError(null);
      return;
    }
    // Mirrors the server's check so a bad file fails here, before anything is
    // saved or charged.
    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Upload a JPEG, PNG or WebP image.");
    } else if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Photos must be 5 MB or smaller.");
    } else {
      setPhotoError(null);
    }
    setPhoto(file);
    setErrors((prev) => ({ ...prev, photo: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step) return;

    const found = validate(form, photoError);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Take the customer to the first problem rather than leaving them to
      // hunt for it on a long form — after React has applied `aria-invalid`.
      const formEl = event.currentTarget;
      requestAnimationFrame(() => {
        const first = formEl.querySelector("[aria-invalid='true']");
        first?.focus({ preventScroll: true });
        first?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }

    setSubmitError(null);
    let id = createdId;
    try {
      if (!id) {
        setStep("saving");
        const created = await createConsultation(
          {
            fullName: form.fullName.trim(),
            phoneNumber: form.phone.trim(),
            skinType: form.skinType,
            concerns: form.concerns,
            availability: form.availability,
            description: form.description.trim(),
          },
          accessToken,
        );
        id = created.id;
        setCreatedId(id);
      }

      // Tracked by file, so a retry re-sends a photo whose upload failed (or a
      // newly chosen one) without creating a second request.
      if (photo && uploadedPhoto !== photo) {
        setStep("uploading");
        await uploadConsultationPhoto(id, photo, accessToken);
        setUploadedPhoto(photo);
      }

      setStep("paying");
      const { authorization_url: url } = await checkoutConsultation(
        id,
        accessToken,
      );
      // Full-page redirect to Paystack; it returns to /payment/callback.
      window.location.assign(url);
    } catch (err) {
      setStep(null);
      setSubmitError(err.message);
    }
  };

  const busyLabel = {
    saving: "Saving your request…",
    uploading: "Uploading your photo…",
    paying: "Opening secure checkout…",
  }[step];

  const describedBy = (key) =>
    errors[key] ? `${ids}-${key}-error` : undefined;

  return (
    <div className="flex flex-col gap-6 lg:px-8 lg:py-5">
      {/* Desktop back — on mobile the account layout's own Back is shown. */}
      <button
        type="button"
        onClick={() => navigate(LIST_ROUTE)}
        className="hidden h-8 cursor-pointer items-center gap-2 self-start px-3 text-[12px] font-semibold leading-[1.4] text-(--primary-color) lg:flex"
      >
        <NavIcon name="back" box={16} glyphClassName="-rotate-90 -scale-x-100" />
        Back
      </button>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="@container flex w-full max-w-[851px] flex-col gap-9"
      >
        <h1 className="text-[20px] font-semibold leading-[1.4] text-black lg:text-[24px]">
          Skincare Consultation
        </h1>

        {/* Contact details | skin type — side by side once the form has room. */}
        <div className="flex flex-col gap-9 @2xl:flex-row @2xl:gap-7">
          <fieldset className="flex min-w-0 flex-1 flex-col gap-4">
            <legend className={`${headingCls} mb-4`}>Contact Details</legend>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Full Name</span>
              <input
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => set("fullName")(e.target.value)}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={describedBy("fullName")}
                className={inputCls}
              />
              <FieldError id={`${ids}-fullName-error`}>
                {errors.fullName}
              </FieldError>
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>WhatsApp Number</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy("phone")}
                className={inputCls}
              />
              <FieldError id={`${ids}-phone-error`}>{errors.phone}</FieldError>
            </label>
          </fieldset>

          <fieldset className="flex min-w-0 flex-1 flex-col gap-4">
            <legend className={`${headingCls} mb-4`}>Skin Type</legend>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>What is your skin type?</span>
              <span className="relative block">
                <select
                  value={form.skinType}
                  onChange={(e) => set("skinType")(e.target.value)}
                  aria-invalid={Boolean(errors.skinType)}
                  aria-describedby={describedBy("skinType")}
                  className={`${boxCls} cursor-pointer appearance-none pr-12 ${
                    form.skinType ? "text-black" : "text-[#9fa5b2]"
                  }`}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {SKIN_TYPES.map(([value, label]) => (
                    <option key={value} value={value} className="text-black">
                      {label}
                    </option>
                  ))}
                </select>
                <Glyph
                  name="arrowDown"
                  className="pointer-events-none absolute right-[17px] top-1/2 -translate-y-1/2 text-black"
                />
              </span>
              <FieldError id={`${ids}-skinType-error`}>
                {errors.skinType}
              </FieldError>
            </label>
          </fieldset>
        </div>

        {/* Concerns */}
        <fieldset className="flex flex-col gap-4">
          <legend className={`${headingCls} mb-4`}>Main Skin Concern</legend>
          <p className={labelCls}>
            Choose up to {MAX_CONCERNS}.
            {form.concerns.length > 0 &&
              ` ${form.concerns.length} of ${MAX_CONCERNS} selected.`}
          </p>
          <div
            className="flex flex-wrap gap-3 sm:gap-5"
            aria-invalid={Boolean(errors.concerns)}
            aria-describedby={describedBy("concerns")}
            tabIndex={errors.concerns ? -1 : undefined}
          >
            {CONCERNS.map(([value, label]) => (
              <Chip
                key={value}
                selected={form.concerns.includes(value)}
                onClick={() => toggle("concerns", value, MAX_CONCERNS)}
              >
                {label}
              </Chip>
            ))}
          </div>
          <FieldError id={`${ids}-concerns-error`}>{errors.concerns}</FieldError>
        </fieldset>

        {/* Availability */}
        <fieldset className="flex flex-col gap-4">
          <legend className={`${headingCls} mb-4`}>Preferred Availability</legend>
          <div
            className="flex flex-wrap gap-3 sm:gap-5"
            aria-invalid={Boolean(errors.availability)}
            aria-describedby={describedBy("availability")}
            tabIndex={errors.availability ? -1 : undefined}
          >
            {AVAILABILITY.map(([value, label]) => (
              <Chip
                key={value}
                selected={form.availability.includes(value)}
                onClick={() => toggle("availability", value)}
              >
                {label}
              </Chip>
            ))}
          </div>
          <FieldError id={`${ids}-availability-error`}>
            {errors.availability}
          </FieldError>
        </fieldset>

        {/* Photo */}
        <fieldset className="flex flex-col gap-4">
          <legend className={`${headingCls} mb-4`}>Upload a Photo</legend>
          <div className="flex min-w-0 flex-wrap items-center gap-[11px] px-1">
            <input
              ref={fileInput}
              id={`${ids}-photo`}
              type="file"
              accept={PHOTO_TYPES.join(",")}
              onChange={choosePhoto}
              className="sr-only"
              aria-invalid={Boolean(errors.photo)}
              aria-describedby={describedBy("photo")}
            />
            <label
              htmlFor={`${ids}-photo`}
              className="cursor-pointer border border-[#48505e] bg-white px-[17px] py-[9px] text-[14px] font-semibold leading-[1.4] text-[#48505e] shadow-[0_0_2px_4px_#f2f4f7] transition-colors hover:border-(--primary-color) hover:text-(--primary-color)"
            >
              Choose file
            </label>
            <span className="min-w-0 truncate text-[14px] font-semibold leading-[1.4] text-[#48505e]">
              {photo ? photo.name : "No file chosen"}
            </span>
            {photo && (
              <button
                type="button"
                onClick={() => {
                  setPhoto(null);
                  setPhotoError(null);
                  if (fileInput.current) fileInput.current.value = "";
                }}
                className="cursor-pointer text-[13px] font-semibold text-(--primary-color) underline"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-[12px] italic text-[#575f71]">
            Optional. A clear photo in good lighting, without filters or heavy
            makeup. JPEG, PNG or WebP, up to 5 MB.
          </p>
          <FieldError id={`${ids}-photo-error`}>
            {errors.photo ?? photoError}
          </FieldError>
        </fieldset>

        {/* Notes */}
        <label className="flex flex-col gap-2">
          <span className={labelCls}>Describe your concern (optional)</span>
          <textarea
            rows={4}
            maxLength={5000}
            value={form.description}
            onChange={(e) => set("description")(e.target.value)}
            placeholder="Tell us what you've noticed, how long it's been happening, and the products you currently use…"
            className={`${inputCls} h-auto min-h-[100px] resize-y py-[17px]`}
          />
        </label>

        {/* Consent */}
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-start gap-3">
            <span className="relative mt-0.5 flex size-5 shrink-0">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => set("agreed")(e.target.checked)}
                aria-invalid={Boolean(errors.agreed)}
                aria-describedby={describedBy("agreed")}
                className="peer absolute inset-0 cursor-pointer appearance-none rounded-[6px] border border-[#9fa5b2] bg-white checked:border-[#faf4eb] checked:bg-(--primary-color) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-color) aria-invalid:border-[#cf251f]"
              />
              <Glyph
                name="check"
                className="pointer-events-none relative hidden text-white peer-checked:flex"
              />
            </span>
            <span className="text-[14px] font-medium leading-[1.4] text-[#48505e]">
              I understand the consultation fee must be paid before my request
              is reviewed, and Zeedara will send my confirmed date and time
              after reviewing it.
            </span>
          </label>
          <FieldError id={`${ids}-agreed-error`}>{errors.agreed}</FieldError>
        </div>

        {submitError && (
          <div
            role="alert"
            className="flex flex-col gap-1 bg-[#fae9e9] px-4 py-3 text-[14px] font-medium text-[#cf251f]"
          >
            <p>{submitError}</p>
            {createdId && (
              <p className="text-[#48505e]">
                Your request has been saved. You can try again here or pay
                later from{" "}
                <Link to={LIST_ROUTE} className="font-semibold underline">
                  your consultations
                </Link>
                .
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={Boolean(step)}
          className="w-full cursor-pointer bg-(--primary-color) px-6 py-4 text-[16px] font-bold leading-[1.4] text-white transition-colors hover:bg-[#a06e1c] disabled:cursor-wait disabled:opacity-70"
        >
          {busyLabel ?? "PROCEED TO PAYMENT"}
        </button>
      </form>
    </div>
  );
}

export default NewConsultation;
