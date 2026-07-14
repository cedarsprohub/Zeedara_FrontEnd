import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Faq from "../../../components/faq";
import Footer from "../../../components/footer";
import AuthNav from "../../../components/navbar/AuthNav";
import heroImage from "../../../assets/auth/forgotpassword_hero.jpg";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

function VerifyForgotPassword() {
  const navigate = useNavigate();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputsRef = useRef([]);

  // Countdown — tick down to zero, then the Resend link is revealed.
  useEffect(() => {
    if (seconds <= 0) return undefined;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const focusInput = (index) => {
    const input = inputsRef.current[index];
    if (input) input.focus();
  };

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
      digits.forEach((d, i) => (next[i] = d));
      return next;
    });
    focusInput(Math.min(digits.length, CODE_LENGTH - 1));
  };

  const handleResend = () => {
    setCode(Array(CODE_LENGTH).fill(""));
    setSeconds(RESEND_SECONDS);
    focusInput(0);
    // TODO: trigger the resend-code request here.
  };

  const minutes = Math.floor(seconds / 60);
  const secondsLabel = String(seconds % 60).padStart(2, "0");

  return (
    <div className="verify-forgot-password">
      <AuthNav />

      {/* Hero — cream backdrop with the model on the right (desktop),
          full-bleed behind the card on mobile */}
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#faf4eb]">
        <img
          src={heroImage}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top lg:hidden"
        />
        <img
          src={heroImage}
          alt=""
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[58%] object-cover object-center lg:block"
        />

        {/* Verify-code card (left side) */}
        <div className="relative z-10 flex flex-1 items-center justify-center lg:justify-start px-4 py-10 sm:px-8 lg:px-[clamp(3rem,8vw,10rem)]">
          <form className="verify-forgot-password-card flex w-full max-w-[440px] flex-col gap-6 bg-white p-5 sm:p-8 shadow-[-2px_-9px_43.9px_rgba(0,0,0,0.08)]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-fit items-center justify-center gap-2 bg-[#faf4eb] px-3 py-2 cursor-pointer"
            >
              <ArrowLeft className="size-5 text-(--primary-color)" strokeWidth={2} />
              <span className="text-[14px] font-semibold text-(--primary-color)">
                Back
              </span>
            </button>

            <div className="flex flex-col gap-2">
              <h1 className="font-['Anton'] text-[26px] sm:text-[30px] leading-[1.4] tracking-[-0.72px] text-black">
                Check your inbox
              </h1>
              <div className="text-[14px] leading-[1.4]">
                <p className="font-medium text-[#575f71]">
                  We emailed a confirmation code to
                </p>
                <p className="font-semibold text-black">zeedara@mail.com</p>
              </div>
            </div>

            <div className="flex w-full items-center gap-2">
              {code.map((digit, index) => (
                <div key={index} className="contents">
                  <input
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    aria-label={`Digit ${index + 1}`}
                    className="h-[52px] min-w-0 flex-1 border-[0.8px] border-[#bdc2cb] text-center text-[16px] font-semibold text-black focus:border-(--primary-color) focus:outline-none"
                  />
                  {index === 2 && (
                    <span className="h-[1.5px] w-3 shrink-0 bg-[#828a9b]" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-5">
              <button
                type="submit"
                className="w-full bg-(--primary-color) px-6 py-4 text-center text-[16px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
              >
                Verify
              </button>
              <p className="flex gap-2 text-[14px] font-semibold">
                <span className="text-[#667085]">Don&rsquo;t see a code?</span>
                {seconds > 0 ? (
                  <span className="text-(--primary-color)">
                    Resend in {minutes}:{secondsLabel}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-(--primary-color) cursor-pointer hover:underline"
                  >
                    Resend
                  </button>
                )}
              </p>
            </div>

            <div className="flex gap-4 text-[14px] font-medium text-[#667085]">
              <a
                href="#terms"
                className="underline cursor-pointer hover:text-(--primary-color)"
              >
                Terms
              </a>
              <a
                href="#privacy"
                className="underline cursor-pointer hover:text-(--primary-color)"
              >
                Privacy
              </a>
            </div>
          </form>
        </div>
      </section>

      <Faq />
      <Footer />
    </div>
  );
}

export default VerifyForgotPassword;
