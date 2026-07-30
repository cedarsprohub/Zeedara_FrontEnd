import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.js";
import { requestEmailChange, confirmEmailChange } from "../../../api/auth";
import { ApiError } from "../../../api/client";
import SuccessPanel from "./SuccessPanel";

const CODE_LENGTH = 6;

// The API re-authenticates the caller with their current password rather than
// by mailing a code to the old address, so the flow is two steps: request the
// change, then confirm the code sent to the new address.
const STEPS = {
  REQUEST: "request",
  VERIFY: "verify",
  DONE: "done",
};

const WRONG_PASSWORD = "The password you entered is incorrect.";

const inputCls =
  "h-[52px] w-full border border-[#dadde2] pl-11 pr-[17px] text-[13px] font-medium text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]";

// Primary (amber), secondary (tinted) and disabled button treatments, all at
// the design's 247px width.
const primaryBtn =
  "flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[12px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#bdc2cb] disabled:opacity-100 sm:w-[247px]";
const secondaryBtn =
  "flex h-10 w-full cursor-pointer items-center justify-center bg-[#faf4eb] px-4 text-[12px] font-semibold tracking-[0.28px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[247px]";

function StepHeader({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-[16px] font-semibold leading-[1.4] text-black">
        {title}
      </h1>
      <p className="max-w-[699px] text-[13px] font-medium leading-[1.4] text-black">
        {children}
      </p>
    </div>
  );
}

// Email field with the leading mail icon from the design. Used twice on the
// first step: read-only for the address already on file, editable for the new
// one.
function EmailField({
  label = "Email",
  value,
  onChange,
  disabled,
  readOnly,
  placeholder,
}) {
  return (
    <label className="flex w-full max-w-[421px] flex-col gap-2">
      <span className="text-[13px] font-medium text-[#667085]">{label}</span>
      <div className="relative">
        <Mail
          className="pointer-events-none absolute left-[17px] top-1/2 size-5 -translate-y-1/2 text-[#667085]"
          strokeWidth={2}
        />
        {readOnly ? (
          <span className="flex h-[52px] w-full items-center border border-[#dadde2] bg-[#f7f8fa] pl-11 pr-[17px] text-[13px] font-medium text-black">
            {value}
          </span>
        ) : (
          <input
            type="email"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="email"
            className={inputCls}
          />
        )}
      </div>
    </label>
  );
}

// Current-password field — the API requires it to re-authenticate the caller
// before it will mail a code to a new address.
function PasswordField({ value, onChange, disabled, error }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex w-full max-w-[421px] flex-col gap-2">
      <span className="text-[13px] font-medium text-[#667085]">
        Current Password
      </span>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-[17px] top-1/2 size-5 -translate-y-1/2 text-[#667085]"
          strokeWidth={2}
        />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          autoComplete="current-password"
          className={`${inputCls} pr-11 ${error ? "border-[#cf251f]" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-[17px] top-1/2 -translate-y-1/2 cursor-pointer text-[#9fa5b2] transition-colors hover:text-[#667085]"
        >
          {visible ? (
            <Eye className="size-5" strokeWidth={2} />
          ) : (
            <EyeOff className="size-5" strokeWidth={2} />
          )}
        </button>
      </div>
      {error && (
        <p className="text-[13px] font-medium italic leading-[1.4] text-[#cf251f]">
          {error}
        </p>
      )}
    </label>
  );
}

// Six digit boxes with the dash after the third, matching the design and the
// existing confirm-email screen's keyboard behaviour.
function OtpFields({ code, setCode, disabled }) {
  const inputsRef = useRef([]);

  const focusInput = (index) => inputsRef.current[index]?.focus();

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < CODE_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH)
      .split("");
    if (!digits.length) return;
    setCode((prev) => {
      const next = [...prev];
      digits.forEach((digit, i) => (next[i] = digit));
      return next;
    });
    focusInput(Math.min(digits.length, CODE_LENGTH - 1));
  };

  return (
    <div className="flex w-full max-w-[421px] items-center gap-3">
      {code.map((digit, index) => (
        <div key={index} className="contents">
          <input
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            aria-label={`Digit ${index + 1}`}
            className="h-[52px] min-w-0 flex-1 border-[0.8px] border-[#bdc2cb] text-center text-[16px] font-semibold text-black focus:border-(--primary-color) focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]"
          />
          {index === 2 && (
            <span className="h-px w-3 shrink-0 bg-[#828a9b]" />
          )}
        </div>
      ))}
    </div>
  );
}

function ChangeEmail() {
  const navigate = useNavigate();
  const { user, setUser, accessToken, logout } = useAuth();
  const currentEmail = user?.email ?? "";

  // Google-only accounts have no password for the backend to check, so the
  // field is theirs to skip (current_password is nullable for exactly this).
  const needsPassword = user?.auth_provider !== "GOOGLE";

  const [step, setStep] = useState(STEPS.REQUEST);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const resetCode = () => setCode(Array(CODE_LENGTH).fill(""));
  const codeComplete = code.every(Boolean);

  const describe = (err) =>
    err instanceof ApiError ? err.message : "Something went wrong.";

  // Step 1 — mail an EMAIL_CHANGE code to the new address. The account isn't
  // modified until the code comes back.
  const submitRequest = async () => {
    setError("");
    setPasswordError("");
    setBusy(true);
    try {
      await requestEmailChange(
        newEmail.trim(),
        needsPassword ? password : null,
        accessToken,
      );
      resetCode();
      setStep(STEPS.VERIFY);
    } catch (err) {
      // A rejected password gets the field slot; everything else — address
      // already in use, rate limits — reads as a banner.
      const rejected =
        err instanceof ApiError && [400, 401, 403].includes(err.status);
      if (rejected && needsPassword) {
        setPasswordError(WRONG_PASSWORD);
      } else {
        setError(describe(err));
      }
    } finally {
      setBusy(false);
    }
  };

  // Step 2 — confirm the code and move the account across. The response is the
  // updated UserPublic, so context takes it verbatim.
  const submitConfirm = async () => {
    setError("");
    setBusy(true);
    try {
      const updated = await confirmEmailChange(
        newEmail.trim(),
        code.join(""),
        accessToken,
      );
      setUser(updated);
      setStep(STEPS.DONE);
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  };

  const goBack = (target) => {
    setError("");
    resetCode();
    setStep(target);
  };

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Back to the settings list (desktop — mobile uses the layout's back) */}
      {step !== STEPS.DONE && (
        <button
          type="button"
          onClick={() => navigate("/account/settings")}
          className="hidden cursor-pointer items-center gap-2 self-start p-2 text-[12px] font-semibold text-(--primary-color) lg:flex"
        >
          <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
          Back
        </button>
      )}

      {error && (
        <p className="max-w-[699px] bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
          {error}
        </p>
      )}

      {step === STEPS.REQUEST && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitRequest();
          }}
          className="flex flex-col gap-9"
        >
          <StepHeader title="Change Email Address">
            {needsPassword
              ? "The email address below is currently associated to your profile. Enter the address you would like to move to, confirm your password, and we will send a six digit code to the new address."
              : "The email address below is currently associated to your profile. Enter the address you would like to move to and we will send a six digit code to the new address."}
          </StepHeader>

          <div className="flex flex-col gap-6">
            <EmailField label="Current Email" value={currentEmail} readOnly />

            <EmailField
              label="New Email"
              value={newEmail}
              onChange={setNewEmail}
              disabled={busy}
              placeholder="you@example.com"
            />

            {needsPassword && (
              <PasswordField
                value={password}
                onChange={setPassword}
                disabled={busy}
                error={passwordError}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={busy || !newEmail.trim() || (needsPassword && !password)}
            className={primaryBtn}
          >
            {busy ? "SENDING…" : "SEND OTP"}
          </button>
        </form>
      )}

      {step === STEPS.VERIFY && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitConfirm();
          }}
          className="flex flex-col gap-9"
        >
          <StepHeader title="Verify new email">
            Enter the six digit code sent to{" "}
            <span className="text-(--primary-color) underline">{newEmail}</span>
          </StepHeader>

          <OtpFields code={code} setCode={setCode} disabled={busy} />

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-9">
            <button
              type="button"
              onClick={() => goBack(STEPS.REQUEST)}
              disabled={busy}
              className={secondaryBtn}
            >
              BACK
            </button>
            <button
              type="submit"
              disabled={busy || !codeComplete}
              className={primaryBtn}
            >
              {busy ? "VERIFYING…" : "VERIFY"}
            </button>
          </div>
        </form>
      )}

      {/* Changing the recovery address revokes every refresh token, so this
          session is spent — end it here rather than letting it die mid-browse. */}
      {step === STEPS.DONE && (
        <SuccessPanel
          message="Email address successfully changed. Please sign in again with your new email."
          closeLabel="SIGN IN"
          onClose={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        />
      )}
    </div>
  );
}

export default ChangeEmail;
