import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown } from "lucide-react";
import nigeriaFlag from "../../../assets/auth/flag_nigeria.svg";
import { useAuth } from "../../../context/AuthContext.js";
import { updateMe } from "../../../api/auth";
import NavIcon from "../NavIcon";

// Every field on this screen is part of `UserProfileUpdate`.
const EDITABLE = ["first_name", "last_name", "gender", "date_of_birth", "phone_number"];

const GENDERS = [
  ["male", "Male"],
  ["female", "Female"],
  ["prefer_not_to_say", "Prefer not to say"],
];
const genderLabel = (value) => GENDERS.find(([key]) => key === value)?.[1] ?? value;

// Read-only boxes mirror the editable inputs — same border, height and type
// scale — so switching between the two states doesn't shift the layout.
const boxCls =
  "flex h-[58px] w-full items-center gap-2 border border-[#dadde2] px-[17px] text-[14px] font-medium text-black";
const inputCls =
  "h-[58px] w-full border border-[#dadde2] bg-white px-[17px] text-[14px] font-medium text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]";

// "1994-01-19" → "19-Jan-1994", the format the design shows.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatBirthdate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const label = MONTHS[Number(month) - 1];
  return label ? `${day}-${label}-${year}` : value;
}

// Today as YYYY-MM-DD in local time, for the birthdate picker's upper bound.
function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function Field({ label, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-[14px] font-medium leading-[1.4] text-[#667085]">{label}</span>
      {children}
    </label>
  );
}

function NotSet() {
  return <span className="text-[#9fa5b2]">Not set</span>;
}

function BasicDetails() {
  const navigate = useNavigate();
  // `RequireAuth` gates this route, so `user` is already loaded by now.
  const { user, accessToken, setUser } = useAuth();

  const [draft, setDraft] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const update = (key) => (event) =>
    setDraft((prev) => ({ ...prev, [key]: event.target.value }));

  // The draft is only read while editing, so seed it from `user` on the way in
  // rather than mirroring props into state with an effect.
  const startEditing = () => {
    setDraft(Object.fromEntries(EDITABLE.map((key) => [key, user?.[key] ?? ""])));
    setError(null);
    setSaved(false);
    setEditing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    // PATCH is partial — send only what changed. An emptied optional field is
    // sent as null rather than an empty string the API would reject.
    const changes = {};
    for (const key of EDITABLE) {
      const next = String(draft[key] ?? "").trim();
      if (next !== (user?.[key] ?? "")) changes[key] = next || null;
    }
    if (changes.first_name === null || changes.last_name === null) {
      setError("First name and surname can't be empty.");
      return;
    }
    if (Object.keys(changes).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMe(changes, accessToken);
      setUser(updated);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Desktop back — on mobile the account layout's Back goes up a level. */}
      <button
        type="button"
        onClick={() => navigate("/account/settings")}
        className="hidden h-8 cursor-pointer items-center gap-2 self-start px-3 text-[12px] font-semibold leading-[1.4] text-(--primary-color) lg:flex"
      >
        <NavIcon name="back" box={16} glyphClassName="-rotate-90 -scale-x-100" />
        Back
      </button>

      <form onSubmit={handleSubmit} noValidate className="@container flex flex-col gap-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[20px] font-semibold leading-[1.4] text-black lg:text-[24px]">
            Basic Details
          </h1>
          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="flex h-10 w-[176px] cursor-pointer items-center justify-center bg-[#faf4eb] px-4 text-[14px] font-semibold tracking-[0.28px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2]"
            >
              EDIT PROFILE
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="bg-[#fae9e9] px-4 py-3 text-[14px] font-medium text-[#cf251f]">
            {error}
          </p>
        )}
        {saved && !editing && (
          <p role="status" className="bg-[#eefeec] px-4 py-3 text-[14px] font-semibold text-[#298d1c]">
            Your details have been saved.
          </p>
        )}

        {/* Names two-up; gender, birthdate and phone three-up when there's
            room — sized by the form, since the account rail changes its width. */}
        <div className="grid grid-cols-1 gap-5 @lg:grid-cols-2">
          <Field label="First Name">
            {editing ? (
              <input
                type="text"
                autoComplete="given-name"
                value={draft.first_name}
                onChange={update("first_name")}
                maxLength={100}
                disabled={saving}
                className={inputCls}
              />
            ) : (
              <span className={boxCls}>{user?.first_name || <NotSet />}</span>
            )}
          </Field>
          <Field label="Surname">
            {editing ? (
              <input
                type="text"
                autoComplete="family-name"
                value={draft.last_name}
                onChange={update("last_name")}
                maxLength={100}
                disabled={saving}
                className={inputCls}
              />
            ) : (
              <span className={boxCls}>{user?.last_name || <NotSet />}</span>
            )}
          </Field>
        </div>

        {/* Stacked in one column the two groups read as one list, so close the
            form's 36px gap down to the 20px between fields. */}
        <div className="-mt-4 grid grid-cols-1 gap-5 @lg:mt-0 @lg:grid-cols-2 @4xl:grid-cols-3">
          <Field label="Gender">
            {editing ? (
              <span className="relative block">
                <select
                  value={draft.gender}
                  onChange={update("gender")}
                  disabled={saving}
                  className={`${inputCls} cursor-pointer appearance-none pr-12 ${
                    draft.gender ? "" : "text-[#9fa5b2]"
                  }`}
                >
                  <option value="">Select</option>
                  {GENDERS.map(([value, label]) => (
                    <option key={value} value={value} className="text-black">
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-[17px] top-1/2 size-5 -translate-y-1/2 text-black"
                  strokeWidth={2}
                />
              </span>
            ) : (
              <span className={`${boxCls} justify-between`}>
                {user?.gender ? genderLabel(user.gender) : <NotSet />}
                <ChevronDown className="size-5 shrink-0 text-black" strokeWidth={2} aria-hidden="true" />
              </span>
            )}
          </Field>

          <Field label="Birthdate">
            {editing ? (
              <input
                type="date"
                value={draft.date_of_birth}
                onChange={update("date_of_birth")}
                min="1900-01-01"
                max={todayIso()}
                disabled={saving}
                className={`${inputCls} cursor-pointer`}
              />
            ) : (
              <span className={boxCls}>
                <Calendar className="size-5 shrink-0 text-[#667085]" strokeWidth={2} aria-hidden="true" />
                {formatBirthdate(user?.date_of_birth) || <NotSet />}
              </span>
            )}
          </Field>

          <Field label="Phone number">
            <div
              className={`flex h-[58px] items-center border border-[#dadde2] bg-white ${
                editing ? "focus-within:border-(--primary-color)" : ""
              }`}
            >
              {/* Country selector — Nigeria only for now */}
              <span className="flex h-full shrink-0 items-center gap-1 border-r border-[#dadde2] pl-4 pr-3">
                <img src={nigeriaFlag} alt="Nigeria" className="size-5" />
                <ChevronDown className="size-4 shrink-0 text-[#9fa5b2]" strokeWidth={2} aria-hidden="true" />
              </span>
              {editing ? (
                <input
                  type="tel"
                  autoComplete="tel"
                  value={draft.phone_number}
                  onChange={update("phone_number")}
                  placeholder="+234 000 000 0000"
                  maxLength={32}
                  disabled={saving}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] font-medium text-black placeholder:text-[#9fa5b2] focus:outline-none disabled:cursor-not-allowed"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate px-3 text-[14px] font-medium text-black">
                  {user?.phone_number || <NotSet />}
                </span>
              )}
            </div>
          </Field>
        </div>

        {editing && (
          <div className="flex flex-col gap-3 @md:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[14px] font-semibold tracking-[0.28px] text-white transition-colors hover:bg-[#a06e1c] disabled:cursor-wait disabled:opacity-60 @md:w-[176px]"
            >
              {saving ? "SAVING…" : "SAVE"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setEditing(false);
              }}
              disabled={saving}
              className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#f0f1f3] px-4 text-[14px] font-semibold tracking-[0.28px] text-[#48505e] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-60 @md:w-[176px]"
            >
              CANCEL
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default BasicDetails;
