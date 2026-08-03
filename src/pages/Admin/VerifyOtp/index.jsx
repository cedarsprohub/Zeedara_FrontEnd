import { Fragment, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Seo from "../../../components/shared/Seo";
import { adminResendOtp, adminVerifyOtp } from "../../../api/admin/auth";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import { ApiError } from "../../../api/client";

const CODE_LENGTH = 6;
// How long before "Resend code" becomes available. The design shows "1:99",
// which isn't a real clock reading; two minutes is the nearest sane reading and
// keeps us clear of the server's own resend cooldown.
const RESEND_SECONDS = 120;

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAdminAuth();
  const {
    challengeToken: initialChallengeToken,
    email,
    remember,
    from,
  } = location.state ?? {};

  // A resend rotates the challenge token, so the one to verify against is state
  // rather than whatever navigation handed us.
  const [challengeToken, setChallengeToken] = useState(initialChallengeToken);
  const [digits, setDigits] = useState(() => Array(CODE_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setInterval(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // The challenge token only exists in navigation state, so a direct visit or a
  // refresh has nothing to verify against and has to start over.
  if (!challengeToken) return <Navigate to="/admin/login" replace />;

  const code = digits.join("");

  const focusInput = (index) => {
    const next = inputsRef.current[index];
    if (next) {
      next.focus();
      next.select();
    }
  };

  const setDigit = (index, value) => {
    setDigits((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (index, rawValue) => {
    const value = rawValue.replace(/\D/g, "");
    if (!value) {
      setDigit(index, "");
      return;
    }
    // A paste (or a fast typist) can deliver several digits to one box; spread
    // them across the remaining boxes rather than keeping only the first.
    const characters = value.split("").slice(0, CODE_LENGTH - index);
    setDigits((previous) => {
      const next = [...previous];
      characters.forEach((character, offset) => {
        next[index + offset] = character;
      });
      return next;
    });
    focusInput(Math.min(index + characters.length, CODE_LENGTH - 1));
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, "");
      focusInput(index - 1);
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    } else if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    setIsResending(true);
    try {
      const response = await adminResendOtp(challengeToken);
      // The old token stops working the moment this succeeds, so swapping it in
      // is required, not just tidy.
      if (response?.challenge_token) setChallengeToken(response.challenge_token);
      setNotice(response?.message || "A new code is on its way.");
      setDigits(Array(CODE_LENGTH).fill(""));
      setSecondsLeft(RESEND_SECONDS);
      focusInput(0);
    } catch (err) {
      // 429 is the server's resend cooldown; its message says how long to wait.
      setError(err instanceof ApiError ? err.message : "Couldn't resend the code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (code.length < CODE_LENGTH) {
      setError("Enter all six digits.");
      return;
    }
    setError("");
    setNotice("");
    setIsSubmitting(true);
    try {
      const tokens = await adminVerifyOtp(challengeToken, code);
      if (!tokens?.access_token) {
        setError("Verification failed. Please try again.");
        return;
      }
      // Storing the tokens kicks the provider into fetching /users/me; the
      // guard holds the destination until that confirms an ADMIN account.
      signIn(tokens, { remember: remember ?? true });
      navigate(from?.pathname || "/admin", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setDigits(Array(CODE_LENGTH).fill(""));
      focusInput(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc] p-4">
      <Seo title="Verify your login" description="Zeedara admin access." noindex />

      {/* Sized to match the login screen: the Figma values scaled by 0.9. */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[460px] flex-col items-start gap-[25.2px] border border-[#dadde2] bg-white p-6 sm:p-[36px]"
      >
        <Link
          to="/admin/login"
          className="flex h-9 items-center justify-center gap-2 bg-[#faf4eb] px-[10.8px] py-[7.2px] text-[12.6px] font-semibold text-(--primary-color) transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="size-[18px]" strokeWidth={2} />
          Back
        </Link>

        <div className="flex w-full flex-col gap-[10.8px] text-black">
          <h1 className="font-['Anton'] text-[32.4px] leading-[1.4] tracking-[-0.648px]">
            Confirm your email
          </h1>
          <p className="text-[12.6px] font-medium">
            Enter the six digit code we just sent to {email || "your email"}
          </p>
        </div>

        <div className="flex w-full items-center gap-[10.8px]">
          {digits.map((digit, index) => (
            <Fragment key={index}>
              <input
                ref={(element) => {
                  inputsRef.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={CODE_LENGTH}
                aria-label={`Digit ${index + 1}`}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onFocus={(event) => event.target.select()}
                className="h-[52px] w-full min-w-0 flex-1 border-[0.8px] border-[#bdc2cb] text-center text-[16px] font-semibold text-black focus:border-(--primary-color) focus:outline-none"
              />
              {/* The design separates the two triplets with a short dash. */}
              {index === 2 && (
                <span
                  aria-hidden="true"
                  className="h-px w-3 shrink-0 bg-[#bdc2cb]"
                />
              )}
            </Fragment>
          ))}
        </div>

        {error && <p className="text-[12.6px] text-[#cf251f]">{error}</p>}
        {notice && <p className="text-[12.6px] text-[#0f9959]">{notice}</p>}

        <div className="flex w-full flex-col gap-[18px]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer bg-(--primary-color) px-[21.6px] py-[14.4px] text-center text-[14.4px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Verifying…" : "Verify now"}
          </button>

          {/* Counts down first, then offers the resend — /auth/admin/resend-otp
              enforces its own cooldown, so asking before then just earns a
              429. */}
          <p className="flex gap-2 text-[12.6px] font-semibold">
            <span className="text-[#667085]">
              Didn&apos;t receive a code?{secondsLeft > 0 ? " Wait" : ""}
            </span>
            {secondsLeft > 0 ? (
              <span className="text-(--primary-color)">
                {formatCountdown(secondsLeft)}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="cursor-pointer text-(--primary-color) hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResending ? "Sending…" : "Resend code"}
              </button>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}

export default VerifyOtp;
