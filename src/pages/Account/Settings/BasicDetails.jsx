import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react";
import nigeriaFlag from "../../../assets/auth/flag_nigeria.svg";
import { useAuth } from "../../../context/AuthContext.js";
import { updateMe } from "../../../api/auth";

// `UserProfileUpdate` only accepts these three of the fields on this screen —
// the API has no gender or birthdate, so those two stay read-only (see the
// note on `Field` usage below).
const EDITABLE = ["first_name", "last_name", "phone_number"];

const emptyDraft = { first_name: "", last_name: "", phone_number: "" };

// Read-only boxes mirror the editable inputs — same border, height and type
// scale — so switching between the two states doesn't shift the layout.
const boxCls =
  "flex h-[52px] w-full items-center gap-2 border border-[#dadde2] px-[17px] text-[13px] font-medium text-black";
const inputCls =
  "h-[52px] w-full border border-[#dadde2] px-[17px] text-[13px] font-medium text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]";

// "1994-01-19" → "19-Jan-1994", the format the design shows.
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatBirthdate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const label = MONTHS[Number(month) - 1];
  return label ? `${day}-${label}-${year}` : value;
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-[#667085]">{label}</span>
      {children}
    </label>
  );
}

// Placeholder for a value the account API doesn't return yet.
function NotSet() {
  return <span className="text-[#9fa5b2]">Not set</span>;
}

function BasicDetails() {
  const navigate = useNavigate();
  // `RequireAuth` gates this route, so `user` is already loaded by now.
  const { user, accessToken, setUser } = useAuth();

  const [draft, setDraft] = useState(emptyDraft);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const update = (key) => (event) =>
    setDraft((prev) => ({ ...prev, [key]: event.target.value }));

  // The draft is only read while editing, so seed it from `user` on the way in
  // rather than mirroring props into state with an effect.
  const startEditing = () => {
    setDraft({
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      phone_number: user?.phone_number ?? "",
    });
    setError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setError(null);
    setEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    // PATCH is partial — send only what actually changed.
    const changes = {};
    for (const key of EDITABLE) {
      const next = draft[key].trim();
      if (next !== (user?.[key] ?? "")) changes[key] = next;
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
        onClick={() => navigate("/account/settings")}
        className="hidden cursor-pointer items-center gap-2 self-start p-2 text-[12px] font-semibold text-(--primary-color) lg:flex"
      >
        <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
        Back
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[16px] font-semibold leading-[1.4] text-black">
            Basic Details
          </h1>

          {editing ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="flex h-10 w-[133px] cursor-pointer items-center justify-center bg-[#f0f0f0] px-4 text-[12px] font-semibold tracking-[0.28px] text-[#667085] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex h-10 w-[133px] cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[12px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "SAVING…" : "SAVE"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="flex h-10 w-[176px] cursor-pointer items-center justify-center bg-[#faf4eb] px-4 text-[12px] font-semibold tracking-[0.28px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2]"
            >
              EDIT PROFILE
            </button>
          )}
        </div>

        {error && (
          <p className="border border-[#fae9e9] bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
            {error}
          </p>
        )}

        {/* Names sit two-up; the row below is three-up, per the design */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="First Name">
            {editing ? (
              <input
                type="text"
                value={draft.first_name}
                onChange={update("first_name")}
                maxLength={100}
                disabled={saving}
                className={inputCls}
              />
            ) : (
              <span className={boxCls}>
                {user?.first_name || <NotSet />}
              </span>
            )}
          </Field>
          <Field label="Surname">
            {editing ? (
              <input
                type="text"
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Gender and Birthdate are display-only — `UserPublic` carries no
              such fields, so there's nothing to read or persist yet. They read
              straight off `user`, so they light up if the API adds them. */}
          <Field label="Gender">
            <span className={`${boxCls} justify-between bg-[#f7f8fa]`}>
              {user?.gender || <NotSet />}
              <ChevronDown
                className="size-5 shrink-0 text-[#9fa5b2]"
                strokeWidth={2}
              />
            </span>
          </Field>

          <Field label="Birthdate">
            <span className={`${boxCls} bg-[#f7f8fa]`}>
              <Calendar
                className="size-5 shrink-0 text-[#9fa5b2]"
                strokeWidth={2}
              />
              {formatBirthdate(user?.date_of_birth) || <NotSet />}
            </span>
          </Field>

          <Field label="Phone number">
            <div
              className={`flex h-[52px] items-center border border-[#dadde2] ${
                editing ? "focus-within:border-(--primary-color)" : ""
              }`}
            >
              {/* Country selector — Nigeria only for now */}
              <span className="flex h-full shrink-0 items-center gap-1 border-r border-[#dadde2] pl-4 pr-3">
                <img src={nigeriaFlag} alt="Nigeria" className="size-5" />
                <ChevronDown
                  className="size-4 shrink-0 text-[#9fa5b2]"
                  strokeWidth={2}
                />
              </span>
              {editing ? (
                <input
                  type="tel"
                  value={draft.phone_number}
                  onChange={update("phone_number")}
                  placeholder="+234 000 000 0000"
                  maxLength={32}
                  disabled={saving}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-[13px] font-medium text-black placeholder:text-[#9fa5b2] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate px-3 text-[13px] font-medium text-black">
                  {user?.phone_number || <NotSet />}
                </span>
              )}
            </div>
          </Field>
        </div>
      </form>
    </div>
  );
}

export default BasicDetails;
