import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.js";
import {
  confirmCurrentEmailCode,
  confirmEmailChange,
  requestEmailChange,
  sendCurrentEmailCode,
} from "../../../api/auth";
import NavIcon from "../NavIcon";
import { ApiError } from "../../../api/client";
import OtpFields, { CODE_LENGTH } from "./OtpFields";
import SuccessPanel from "./SuccessPanel";


// As designed: prove the current inbox is yours, then prove the new one.
//   CURRENT        → "Send OTP" mails a code to the address on file
//   VERIFY_CURRENT → that code buys a 15-minute email-change token
//   NEW            → enter the new address; "Send OTP" mails it a code
//   VERIFY_NEW     → that code moves the account over
// No password is asked for — the current-inbox check stands in for it, which
// also lets Google-only accounts (no password) change their email.
const STEPS = {
  CURRENT: "current",
  VERIFY_CURRENT: "verify-current",
  NEW: "new",
  VERIFY_NEW: "verify-new",
  DONE: "done",
};

const inputCls =
  "h-[58px] w-full border border-[#dadde2] pl-11 pr-[17px] text-[14px] font-medium text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]";

// Primary (amber), secondary (tinted) and disabled button treatments, all at
// the design's 247px width.
const primaryBtn =
  "flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[14px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#bdc2cb] disabled:opacity-100 sm:w-[247px]";
const secondaryBtn =
  "flex h-10 w-full cursor-pointer items-center justify-center bg-[#faf4eb] px-4 text-[14px] font-semibold tracking-[0.28px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[247px]";

function StepHeader({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-[20px] font-semibold leading-[1.4] text-black lg:text-[24px]">
        {title}
      </h1>
      <p className="max-w-[699px] text-[14px] font-medium leading-[1.4] text-black">
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
      <span className="text-[14px] font-medium text-[#667085]">{label}</span>
      <div className="relative">
        <Mail
          className="pointer-events-none absolute left-[17px] top-1/2 size-5 -translate-y-1/2 text-[#667085]"
          strokeWidth={2}
        />
        {readOnly ? (
          <span className="flex h-[58px] w-full items-center border border-[#dadde2] bg-[#f7f8fa] pl-11 pr-[17px] text-[14px] font-medium text-black">
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

function ChangeEmail() {
  const navigate = useNavigate();
  const { user, setUser, accessToken, logout } = useAuth();
  const currentEmail = user?.email ?? "";

  const [step, setStep] = useState(STEPS.CURRENT);
  const [newEmail, setNewEmail] = useState("");
  const [changeToken, setChangeToken] = useState(null);
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const resetCode = () => setCode(Array(CODE_LENGTH).fill(""));
  const codeComplete = code.every(Boolean);

  const describe = (err) =>
    err instanceof ApiError ? err.message : "Something went wrong.";

  // One wrapper for every step: clear messages, run, surface the API's message.
  const run = async (task) => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await task();
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  };

  const sendCurrent = () =>
    run(async () => {
      await sendCurrentEmailCode(accessToken);
      resetCode();
      setStep(STEPS.VERIFY_CURRENT);
    });

  const verifyCurrent = () =>
    run(async () => {
      const { email_change_token: token } = await confirmCurrentEmailCode(
        code.join(""),
        accessToken,
      );
      setChangeToken(token);
      resetCode();
      setStep(STEPS.NEW);
    });

  const sendNew = () =>
    run(async () => {
      try {
        await requestEmailChange(
          newEmail.trim(),
          { emailChangeToken: changeToken },
          accessToken,
        );
      } catch (err) {
        // The 15-minute window ran out while they were typing — back to the
        // start rather than leaving them stuck on a form that can't succeed.
        if (err instanceof ApiError && err.code === "email_change_token_invalid") {
          setChangeToken(null);
          setStep(STEPS.CURRENT);
        }
        throw err;
      }
      resetCode();
      setStep(STEPS.VERIFY_NEW);
    });

  const verifyNew = () =>
    run(async () => {
      const updated = await confirmEmailChange(
        newEmail.trim(),
        code.join(""),
        accessToken,
      );
      setUser(updated);
      setStep(STEPS.DONE);
    });

  const resend = (sender) =>
    run(async () => {
      await sender();
      resetCode();
      setNotice("A new code is on its way.");
    });

  const goBack = (target) => {
    setError("");
    setNotice("");
    resetCode();
    setStep(target);
  };

  const verifyForm = ({ title, email, onSubmit, onBack, onResend }) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-9"
    >
      <StepHeader title={title}>
        Enter the six digit code sent to{" "}
        <span className="break-all text-(--primary-color) underline">{email}</span>
      </StepHeader>

      <OtpFields code={code} setCode={setCode} disabled={busy} />

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-9">
        <button type="button" onClick={onBack} disabled={busy} className={secondaryBtn}>
          BACK
        </button>
        <button type="submit" disabled={busy || !codeComplete} className={primaryBtn}>
          {busy ? "VERIFYING…" : "VERIFY"}
        </button>
      </div>

      <p className="text-[14px] font-medium text-[#667085]">
        Don&rsquo;t see a code?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={busy}
          className="cursor-pointer font-semibold text-(--primary-color) disabled:cursor-wait"
        >
          Resend
        </button>
      </p>
    </form>
  );

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Desktop back — on mobile the account layout's Back goes up a level. */}
      {step !== STEPS.DONE && (
        <button
          type="button"
          onClick={() => navigate("/account/settings")}
          className="hidden h-8 cursor-pointer items-center gap-2 self-start px-3 text-[12px] font-semibold leading-[1.4] text-(--primary-color) lg:flex"
        >
          <NavIcon name="back" box={16} glyphClassName="-rotate-90 -scale-x-100" />
          Back
        </button>
      )}

      {error && (
        <p role="alert" className="max-w-[699px] bg-[#fae9e9] px-4 py-3 text-[14px] font-medium text-[#cf251f]">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="max-w-[699px] bg-[#eefeec] px-4 py-3 text-[14px] font-medium text-[#298d1c]">
          {notice}
        </p>
      )}

      {step === STEPS.CURRENT && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendCurrent();
          }}
          className="flex flex-col gap-9"
        >
          <StepHeader title="Change Email Address">
            The email address below is currently associated to your profile.
            You can change it by clicking on the button below.
          </StepHeader>
          <EmailField label="Email" value={currentEmail} readOnly />
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? "SENDING…" : "SEND OTP"}
          </button>
        </form>
      )}

      {step === STEPS.VERIFY_CURRENT &&
        verifyForm({
          title: "Verify old email",
          email: currentEmail,
          onSubmit: verifyCurrent,
          onBack: () => goBack(STEPS.CURRENT),
          onResend: () => resend(() => sendCurrentEmailCode(accessToken)),
        })}

      {step === STEPS.NEW && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendNew();
          }}
          className="flex flex-col gap-9"
        >
          <StepHeader title="Enter your new email address">
            We&rsquo;ll send a six digit code to the new address to confirm
            it&rsquo;s yours.
          </StepHeader>
          <EmailField
            label="Email"
            value={newEmail}
            onChange={setNewEmail}
            disabled={busy}
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={busy || !newEmail.trim()}
            className={primaryBtn}
          >
            {busy ? "SENDING…" : "SEND OTP"}
          </button>
        </form>
      )}

      {step === STEPS.VERIFY_NEW &&
        verifyForm({
          title: "Verify new email",
          email: newEmail.trim(),
          onSubmit: verifyNew,
          onBack: () => goBack(STEPS.NEW),
          onResend: () =>
            resend(() =>
              requestEmailChange(
                newEmail.trim(),
                { emailChangeToken: changeToken },
                accessToken,
              ),
            ),
        })}

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
