import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.js";
import { forgotPassword, resendOtp, resetPassword, verifyOtp } from "../../../api/auth";
import { ApiError } from "../../../api/client";
import NavIcon from "../NavIcon";
import OtpFields, { CODE_LENGTH } from "./OtpFields";
import { PasswordField, StrengthMeter } from "./PasswordParts";
import { passwordStrength } from "./passwordRules";
import SuccessPanel from "./SuccessPanel";

// "Forgot Password?" from Change Password, kept inside the account as
// designed. Same API as the signed-out flow: mail a FORGOT_PASSWORD code,
// trade it for a reset token, set the new password. The reset revokes every
// session, so it ends by signing in again.
const STEPS = { EMAIL: "email", CODE: "code", PASSWORD: "password", DONE: "done" };

const primaryBtn =
  "flex h-[54px] w-full cursor-pointer items-center justify-center bg-(--primary-color) px-6 text-[16px] font-bold leading-[1.4] text-white transition-colors hover:bg-[#a06e1c] disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:text-[#bdc2cb]";

function Header({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-[20px] font-semibold leading-[1.4] text-black lg:text-[24px]">
        {title}
      </h1>
      <div className="text-[14px] font-medium leading-[1.4] text-black">{children}</div>
    </div>
  );
}

function ResetPassword() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const email = user?.email ?? "";

  const [step, setStep] = useState(STEPS.EMAIL);
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [resetToken, setResetToken] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmErrors, setConfirmErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const run = async (task) => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await task();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const sendCode = () =>
    run(async () => {
      await forgotPassword(email);
      setCode(Array(CODE_LENGTH).fill(""));
      setStep(STEPS.CODE);
    });

  const verify = () =>
    run(async () => {
      const response = await verifyOtp(email, "FORGOT_PASSWORD", code.join(""));
      setResetToken(response?.reset_token ?? null);
      setStep(STEPS.PASSWORD);
    });

  const resend = () =>
    run(async () => {
      await resendOtp(email, "FORGOT_PASSWORD");
      setCode(Array(CODE_LENGTH).fill(""));
      setNotice("A new code is on its way.");
    });

  const savePassword = () => {
    const problems = [];
    if (!passwordStrength(password).allMet)
      problems.push("Your password does not meet the requirements.");
    if (password !== confirm) problems.push("The passwords do not match.");
    setConfirmErrors(problems);
    if (problems.length) return;
    run(async () => {
      await resetPassword(password, resetToken);
      setStep(STEPS.DONE);
    });
  };

  if (step === STEPS.DONE) {
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

  // Back steps within the flow; from the first step it returns to Change Password.
  const back = () => {
    setError("");
    setNotice("");
    if (step === STEPS.EMAIL) navigate("/account/settings/change-password");
    else if (step === STEPS.CODE) setStep(STEPS.EMAIL);
    else setStep(STEPS.CODE);
  };

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      <button
        type="button"
        onClick={back}
        // Desktop only, like the other settings pages: on mobile the account
        // layout already shows a Back, and two stacked Backs read as a bug.
        className="hidden h-10 w-fit cursor-pointer items-center gap-2 bg-[#faf4eb] px-3 lg:flex text-[14px] font-semibold leading-[1.4] text-(--primary-color) transition-colors hover:bg-[#f3e7d2]"
      >
        <NavIcon name="back" box={16} glyphClassName="-rotate-90 -scale-x-100" />
        Back
      </button>

      {error && (
        <p role="alert" className="max-w-[421px] bg-[#fae9e9] px-4 py-3 text-[14px] font-medium text-[#cf251f]">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="max-w-[421px] bg-[#eefeec] px-4 py-3 text-[14px] font-medium text-[#298d1c]">
          {notice}
        </p>
      )}

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (step === STEPS.EMAIL) sendCode();
          else if (step === STEPS.CODE) verify();
          else savePassword();
        }}
        className="flex w-full max-w-[421px] flex-col gap-9"
      >
        {step === STEPS.EMAIL && (
          <>
            <Header title="Reset your password">
              Type your email address and we will send a confirmation code to
              you.
            </Header>
            <label className="flex flex-col gap-2">
              <span className="text-[14px] font-medium text-[#667085]">Email</span>
              <span className="flex h-[58px] w-full items-center gap-3 border border-[#dadde2] bg-[#f7f8fa] px-[17px] text-[14px] font-medium text-black">
                <Mail className="size-5 shrink-0 text-[#667085]" strokeWidth={2} aria-hidden="true" />
                <span className="min-w-0 truncate">{email}</span>
              </span>
              <span className="text-[13px] text-[#667085]">
                The code goes to the email on your account.
              </span>
            </label>
            <button type="submit" disabled={busy || !email} className={primaryBtn}>
              {busy ? "SENDING…" : "CONFIRM"}
            </button>
          </>
        )}

        {step === STEPS.CODE && (
          <>
            <Header title="Check your inbox">
              <p className="text-[#48505e]">We emailed a confirmation code to</p>
              <p className="break-all font-semibold">{email}</p>
            </Header>
            <OtpFields code={code} setCode={setCode} disabled={busy} />
            <button
              type="submit"
              disabled={busy || !code.every(Boolean)}
              className={primaryBtn}
            >
              {busy ? "VERIFYING…" : "VERIFY"}
            </button>
            <p className="text-[14px] font-medium text-[#667085]">
              Don&rsquo;t see a code?{" "}
              <button
                type="button"
                onClick={resend}
                disabled={busy}
                className="cursor-pointer font-semibold text-(--primary-color) disabled:cursor-wait"
              >
                Resend
              </button>
            </p>
          </>
        )}

        {step === STEPS.PASSWORD && (
          <>
            <Header title="Change your password">
              <p className="text-[#48505e]">Type your new password</p>
            </Header>
            <div className="flex flex-col gap-5">
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
                errors={confirmErrors}
              />
              <StrengthMeter password={password} />
            </div>
            <button
              type="submit"
              disabled={busy || !password || !confirm}
              className={primaryBtn}
            >
              {busy ? "SAVING…" : "CHANGE PASSWORD"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default ResetPassword;
