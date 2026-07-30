import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.js";
import { changePassword } from "../../../api/auth";
import { ApiError } from "../../../api/client";
import SuccessPanel from "./SuccessPanel";

// Same rules and thresholds as the auth screens (see Auth/ChangePassword) so a
// password judged "Strong" there reads the same here.
const requirements = [
  { key: "length", label: "8 characters minimum", test: (v) => v.length >= 8 },
  { key: "number", label: "a number", test: (v) => /\d/.test(v) },
  { key: "upper", label: "an UPPERCASE letter", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "a lowercase letter", test: (v) => /[a-z]/.test(v) },
];

const MESSAGES = {
  wrongOld: "The current password you entered is incorrect.",
  unmetRules: "Your password does not meet the requirements.",
  mismatch: "The passwords do not match.",
};

const noErrors = { old: [], confirm: [] };

// Password field with the show/hide eye toggle, plus any validation messages
// beneath it — italic red, per the error-state design.
function PasswordField({ id, label, value, onChange, disabled, errors = [] }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex w-full max-w-[421px] flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium text-[#667085]">
        {label}
      </label>
      <div
        className={`flex h-[52px] items-center gap-2 border px-[17px] ${
          errors.length
            ? "border-[#cf251f]"
            : "border-[#dadde2] focus-within:border-(--primary-color)"
        }`}
      >
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-invalid={errors.length > 0}
          autoComplete={
            id === "old-password" ? "current-password" : "new-password"
          }
          className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-black placeholder:text-[#9fa5b2] focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="shrink-0 cursor-pointer text-[#9fa5b2] transition-colors hover:text-[#667085]"
        >
          {visible ? (
            <Eye className="size-5" strokeWidth={2} />
          ) : (
            <EyeOff className="size-5" strokeWidth={2} />
          )}
        </button>
      </div>
      {errors.map((message) => (
        <p
          key={message}
          className="text-[13px] font-medium italic leading-[1.4] text-[#cf251f]"
        >
          {message}
        </p>
      ))}
    </div>
  );
}

function ChangePassword() {
  const navigate = useNavigate();
  const { accessToken, logout } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState(noErrors);
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const metCount = requirements.filter((r) => r.test(password)).length;
  const strength =
    metCount <= 2 ? "Weak" : metCount === 3 ? "Medium" : "Strong";
  const strengthColor =
    metCount <= 1 ? "#cf251f" : metCount <= 3 ? "#e7ba6c" : "#0f9959";
  const strengthWidth = password ? (metCount / requirements.length) * 100 : 0;

  // Enabled once all three fields have something in them — the rule and match
  // checks report as inline errors on submit rather than blocking the button.
  const canSubmit =
    Boolean(oldPassword) && Boolean(password) && Boolean(confirm) && !busy;

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Collect every applicable message — the design shows the unmet-rules and
    // mismatch errors stacked together.
    const confirmErrors = [];
    if (metCount < requirements.length) confirmErrors.push(MESSAGES.unmetRules);
    if (password !== confirm) confirmErrors.push(MESSAGES.mismatch);

    if (confirmErrors.length) {
      setErrors({ old: [], confirm: confirmErrors });
      return;
    }

    setErrors(noErrors);
    setFailure("");
    setBusy(true);
    try {
      await changePassword(oldPassword, password, accessToken);
      setOldPassword("");
      setPassword("");
      setConfirm("");
      setSaved(true);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setFailure("Something went wrong. Please try again.");
        return;
      }
      // A rejected current password is the one failure the design gives a field
      // slot to; 422 is the backend re-running its own rules on the new one.
      if (err.status === 422) {
        setErrors({ old: [], confirm: [err.message] });
      } else if ([400, 401, 403].includes(err.status)) {
        setErrors({ old: [MESSAGES.wrongOld], confirm: [] });
      } else {
        setFailure(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  // The design replaces the whole form with a confirmation panel on success.
  // The backend revokes every refresh token on a password change, so this
  // session is spent — end it here rather than letting it die mid-browse.
  if (saved) {
    return (
      <SuccessPanel
        message="Password updated successfully. Please sign in again with your new password."
        closeLabel="SIGN IN"
        onClose={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Back to the settings list (desktop — mobile uses the layout's back) */}
      <button
        type="button"
        onClick={() => navigate("/account/settings")}
        className="hidden cursor-pointer items-center gap-2 self-start p-2 text-[12px] font-semibold text-(--primary-color) lg:flex"
      >
        <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
        Back
      </button>

      {failure && (
        <p className="max-w-[699px] bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
          {failure}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-9">
        <div className="flex flex-col gap-3">
          <h1 className="text-[16px] font-semibold leading-[1.4] text-black">
            Change Password
          </h1>
          <p className="max-w-[466px] text-[13px] font-medium leading-[1.4] text-black">
            Enter your current password, then create a new one.
          </p>
          <Link
            to="/forgot-password"
            className="text-[13px] font-semibold text-(--primary-color) hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <PasswordField
          id="old-password"
          label="Old Password"
          value={oldPassword}
          onChange={setOldPassword}
          disabled={busy}
          errors={errors.old}
        />

        <div className="flex w-full max-w-[421px] flex-col gap-5">
          <PasswordField
            id="new-password"
            label="New Password"
            value={password}
            onChange={setPassword}
            disabled={busy}
          />
          <PasswordField
            id="confirm-password"
            label="Confirm Password"
            value={confirm}
            onChange={setConfirm}
            disabled={busy}
            errors={errors.confirm}
          />

          {/* Strength meter */}
          <div className="h-3 w-full overflow-hidden rounded-lg bg-[#dadde2]">
            <div
              className="h-full rounded-lg transition-all duration-300"
              style={{
                width: `${strengthWidth}%`,
                backgroundColor: strengthColor,
              }}
            />
          </div>

          {/* Requirements — the strength label sits on the first row */}
          <div className="flex flex-col gap-2">
            {requirements.map((requirement, index) => {
              const met = requirement.test(password);
              const item = (
                <span className="flex items-center gap-2">
                  {met ? (
                    <CheckCircle2
                      className="size-5 shrink-0 text-[#0f9959]"
                      strokeWidth={2}
                    />
                  ) : (
                    <XCircle
                      className="size-5 shrink-0 text-[#cf251f]"
                      strokeWidth={2}
                    />
                  )}
                  <span className="text-[13px] font-medium text-[#575f71]">
                    {requirement.label}
                  </span>
                </span>
              );

              return index === 0 ? (
                <div
                  key={requirement.key}
                  className="flex items-center justify-between gap-2"
                >
                  {item}
                  <span className="text-[13px] font-semibold text-black">
                    {strength}
                  </span>
                </div>
              ) : (
                <div key={requirement.key}>{item}</div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[12px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#bdc2cb] disabled:opacity-100 sm:w-[263px]"
        >
          {busy ? "UPDATING…" : "UPDATE PASSWORD"}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
