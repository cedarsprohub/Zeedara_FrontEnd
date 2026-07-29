import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.js";
import { resendOtp as sendOtp, verifyOtp } from "../../../api/auth";
import { ApiError } from "../../../api/client";
import emailChangedImg from "../../../assets/account/email_changed.svg";

const CODE_LENGTH = 6;

// The API has no dedicated email-change event — EMAIL_VERIFICATION is the only
// OTPEvent that fits sending a code to an address. See the note on `commit`.
const OTP_EVENT = "EMAIL_VERIFICATION";

const STEPS = {
  CURRENT: "current",
  VERIFY_OLD: "verify-old",
  NEW: "new",
  VERIFY_NEW: "verify-new",
  DONE: "done",
};

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

// Email field with the leading mail icon from the design. Read-only on the
// first step (it shows the address already on file), editable on the third.
function EmailField({ value, onChange, disabled, readOnly, placeholder }) {
  return (
    <label className="flex w-full max-w-[421px] flex-col gap-2">
      <span className="text-[13px] font-medium text-[#667085]">Email</span>
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
  const { user, setUser } = useAuth();
  const currentEmail = user?.email ?? "";

  const [step, setStep] = useState(STEPS.CURRENT);
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const resetCode = () => setCode(Array(CODE_LENGTH).fill(""));
  const codeComplete = code.every(Boolean);

  const describe = (err) =>
    err instanceof ApiError ? err.message : "Something went wrong.";

  // Ask the backend to mail a code to `email`, then move to `nextStep`.
  const requestCode = async (email, nextStep) => {
    setError("");
    setBusy(true);
    try {
      await sendOtp(email, OTP_EVENT);
      resetCode();
      setStep(nextStep);
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async (email, onVerified) => {
    setError("");
    setBusy(true);
    try {
      await verifyOtp(email, OTP_EVENT, code.join(""));
      onVerified();
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  };

  // TODO(api): there is no endpoint that commits an email change — the account
  // API exposes no email-change route, and PATCH /users/me (UserProfileUpdate)
  // accepts only first_name/last_name/phone_number/address. Once one exists,
  // call it here and use its response instead of patching context locally.
  const commit = () => {
    if (user) setUser({ ...user, email: newEmail });
    setStep(STEPS.DONE);
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

      {step === STEPS.CURRENT && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            requestCode(currentEmail, STEPS.VERIFY_OLD);
          }}
          className="flex flex-col gap-9"
        >
          <StepHeader title="Change Email Address">
            The email address below is currently associated to your profile. You
            can change it by clicking on the button below
          </StepHeader>

          <EmailField value={currentEmail} readOnly />

          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? "SENDING…" : "SEND OTP"}
          </button>
        </form>
      )}

      {step === STEPS.VERIFY_OLD && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            confirmCode(currentEmail, () => {
              resetCode();
              setStep(STEPS.NEW);
            });
          }}
          className="flex flex-col gap-9"
        >
          <StepHeader title="Verify old email">
            Enter the six digit code sent to{" "}
            <span className="text-(--primary-color) underline">
              {currentEmail}
            </span>
          </StepHeader>

          <OtpFields code={code} setCode={setCode} disabled={busy} />

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-9">
            <button
              type="button"
              onClick={() => goBack(STEPS.CURRENT)}
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

      {step === STEPS.NEW && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            requestCode(newEmail, STEPS.VERIFY_NEW);
          }}
          className="flex flex-col gap-9"
        >
          {/* The design reuses the OTP subtitle here; this step collects an
              address, so it gets copy that matches what it asks for. */}
          <StepHeader title="Enter your new email address">
            Enter the new email address you would like associated to your
            profile. We will send a six digit code to confirm it.
          </StepHeader>

          <EmailField
            value={newEmail}
            onChange={setNewEmail}
            disabled={busy}
            placeholder="you@example.com"
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-9">
            <button
              type="button"
              onClick={() => goBack(STEPS.VERIFY_OLD)}
              disabled={busy}
              className={secondaryBtn}
            >
              BACK
            </button>
            <button
              type="submit"
              disabled={busy || !newEmail.trim()}
              className={primaryBtn}
            >
              {busy ? "SENDING…" : "SEND OTP"}
            </button>
          </div>
        </form>
      )}

      {step === STEPS.VERIFY_NEW && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            confirmCode(newEmail, commit);
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
              onClick={() => goBack(STEPS.NEW)}
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

      {step === STEPS.DONE && (
        <div className="flex flex-col items-center gap-8 py-16">
          <img
            src={emailChangedImg}
            alt=""
            className="h-[181px] w-[260px] max-w-full"
          />
          <p className="max-w-[296px] text-center text-[16px] font-semibold leading-[1.4] text-black">
            Email address successfully changed
          </p>
          <button
            type="button"
            onClick={() => navigate("/account/settings")}
            className={primaryBtn}
          >
            CLOSE
          </button>
        </div>
      )}
    </div>
  );
}

export default ChangeEmail;
