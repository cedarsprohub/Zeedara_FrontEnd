import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import { createRequest, uploadInspirationImage } from "../../../api/customWig";
import {
  Chip,
  ConsentCheckbox,
  FieldError,
  FilePicker,
  SelectBox,
} from "../../../components/account/FormControls";
import {
  IMAGE_TYPES,
  imageError,
  inputCls,
  labelCls,
} from "../../../components/account/formStyles";
import NavIcon from "../NavIcon";
import { BUDGETS, HAIR_PREFERENCES, LIST_ROUTE } from "./options";

const headingCls = "text-[16px] font-bold leading-[1.4] text-black";

function validate(form, photoError) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Enter your full name.";
  if (form.whatsapp.replace(/\D/g, "").length < 7)
    errors.whatsapp = "Enter a WhatsApp number we can reach you on.";
  if (!form.hairPreference) errors.hairPreference = "Choose what you'd like.";
  if (!form.budget) errors.budget = "Choose a budget range.";
  if (photoError) errors.photo = photoError;
  if (!form.agreed) errors.agreed = "Please confirm to continue.";
  return errors;
}

function NewRequest() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const ids = useId();

  const [form, setForm] = useState(() => ({
    fullName: [user?.first_name, user?.last_name].filter(Boolean).join(" "),
    whatsapp: user?.phone_number ?? "",
    hairPreference: "",
    budget: "",
    notes: "",
    agreed: false,
  }));
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(null); // null | "saving" | "uploading"
  const [submitError, setSubmitError] = useState(null);
  // Once saved, a retry must not create a second request; it only re-tries the
  // image upload.
  const [createdId, setCreatedId] = useState(null);

  const photoError = imageError(photo);

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const describedBy = (key) =>
    errors[key] ? `${ids}-${key}-error` : undefined;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step) return;

    const found = validate(form, photoError);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const formEl = event.currentTarget;
      requestAnimationFrame(() => {
        const first = formEl.querySelector("[aria-invalid='true']");
        first?.focus({ preventScroll: true });
        first?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }

    setSubmitError(null);
    try {
      let id = createdId;
      if (!id) {
        setStep("saving");
        const created = await createRequest(
          {
            fullName: form.fullName.trim(),
            whatsappNumber: form.whatsapp.trim(),
            hairPreference: form.hairPreference,
            budgetRange: form.budget,
            notes: form.notes.trim(),
          },
          accessToken,
        );
        id = created.id;
        setCreatedId(id);
      }
      if (photo) {
        setStep("uploading");
        await uploadInspirationImage(id, photo, accessToken);
      }
      navigate(LIST_ROUTE, { state: { submitted: id } });
    } catch (err) {
      setStep(null);
      setSubmitError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 lg:p-8">
      {/* Desktop back — on mobile the account layout's Back goes up a level. */}
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
        className="@container flex w-full flex-col gap-9"
      >
        <h1 className="text-[20px] font-semibold leading-[1.4] text-black lg:text-[24px]">
          Custom Wig Request Form
        </h1>

        {/* Contact details | hair preference — one row once the form is wide
            enough; the two contact fields pair up sooner. */}
        <div className="flex flex-col gap-9 @4xl:flex-row @4xl:gap-4">
          <fieldset className="flex min-w-0 flex-col gap-4 @4xl:w-[58%]">
            <legend className={`${headingCls} mb-4`}>Contact Details</legend>
            <div className="flex flex-col gap-4 @lg:flex-row">
              <label className="flex min-w-0 flex-1 flex-col gap-2">
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
                <FieldError id={`${ids}-fullName-error`}>{errors.fullName}</FieldError>
              </label>
              <label className="flex min-w-0 flex-1 flex-col gap-2">
                <span className={labelCls}>WhatsApp Number</span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp")(e.target.value)}
                  aria-invalid={Boolean(errors.whatsapp)}
                  aria-describedby={describedBy("whatsapp")}
                  className={inputCls}
                />
                <FieldError id={`${ids}-whatsapp-error`}>{errors.whatsapp}</FieldError>
              </label>
            </div>
          </fieldset>

          <fieldset className="flex min-w-0 flex-1 flex-col gap-4">
            <legend className={`${headingCls} mb-4`}>Hair Preference</legend>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>What do you want?</span>
              <SelectBox
                value={form.hairPreference}
                onChange={set("hairPreference")}
                options={HAIR_PREFERENCES}
                aria-invalid={Boolean(errors.hairPreference)}
                aria-describedby={describedBy("hairPreference")}
              />
              <FieldError id={`${ids}-hairPreference-error`}>
                {errors.hairPreference}
              </FieldError>
            </label>
          </fieldset>
        </div>

        <fieldset className="flex flex-col gap-4">
          <legend className={`${headingCls} mb-4`}>Budget Range</legend>
          <div
            className="flex flex-wrap gap-3 sm:gap-5"
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={describedBy("budget")}
            tabIndex={errors.budget ? -1 : undefined}
          >
            {BUDGETS.map(([value, label]) => (
              <Chip
                key={value}
                selected={form.budget === value}
                onClick={() => set("budget")(value)}
              >
                {label}
              </Chip>
            ))}
          </div>
          <FieldError id={`${ids}-budget-error`}>{errors.budget}</FieldError>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className={`${headingCls} mb-4`}>Upload Inspiration Image</legend>
          <FilePicker
            id={`${ids}-photo`}
            accept={IMAGE_TYPES.join(",")}
            file={photo}
            onChoose={(file) => {
              setPhoto(file);
              setErrors((prev) => ({ ...prev, photo: undefined }));
            }}
            onRemove={() => setPhoto(null)}
            invalid={Boolean(errors.photo ?? photoError)}
            describedBy={describedBy("photo")}
          />
          <p className="text-[12px] italic text-[#575f71]">
            Optional. JPEG, PNG or WebP, up to 5 MB.
          </p>
          <FieldError id={`${ids}-photo-error`}>{errors.photo ?? photoError}</FieldError>
        </fieldset>

        <label className="flex flex-col gap-2">
          <span className={labelCls}>Notes (optional)</span>
          <textarea
            rows={4}
            maxLength={5000}
            value={form.notes}
            onChange={(e) => set("notes")(e.target.value)}
            placeholder="Please include more details like your hair texture, color, wig type, length, and any important information…"
            className={`${inputCls} h-auto min-h-[100px] resize-y py-[17px]`}
          />
        </label>

        <div className="flex flex-col gap-2">
          <ConsentCheckbox
            checked={form.agreed}
            onChange={set("agreed")}
            aria-invalid={Boolean(errors.agreed)}
            aria-describedby={describedBy("agreed")}
          >
            I understand the final price will be confirmed after Zeedara
            reviews my request.
          </ConsentCheckbox>
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
                Your request has been saved without the image. Try again, or
                view it in{" "}
                <Link to={LIST_ROUTE} className="font-semibold underline">
                  your requests
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
          {step === "saving"
            ? "SUBMITTING…"
            : step === "uploading"
              ? "UPLOADING IMAGE…"
              : "SUBMIT CUSTOM REQUEST"}
        </button>
      </form>
    </div>
  );
}

export default NewRequest;
