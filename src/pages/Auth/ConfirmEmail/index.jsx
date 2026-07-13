import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Faq from "../../../components/faq";
import Footer from "../../../components/footer";
import AccountDropdown from "../../../components/navbar/AccountDropdown";
import MobileNav from "../../../components/navbar/MobileNav";
import zeedaraLogo from "../../../assets/navbar/zeedara_logo.png";
import heroImage from "../../../assets/auth/confirm_hero.png";

const CODE_LENGTH = 6;

const navLinks = [
  { name: "HOME", path: "/" },
  { name: "CATEGORIES", path: "/categories", hasDropdown: true },
  { name: "NEW ARRIVALS", path: "/new-arrivals" },
  { name: "SKINCARE CLINIC", path: "/skincare-clinic" },
  { name: "CONSULTATION", path: "/consultation" },
  { name: "CUSTOM WIG", path: "/custom-wig" },
  { name: "REQUEST A QUOTE", path: "/request-a-quote" },
];

function ConfirmEmail() {
  const navigate = useNavigate();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const inputsRef = useRef([]);

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

  return (
    <div className="confirm-email">
      {/* Hero */}
      <section
        className="relative isolate flex min-h-screen flex-col overflow-hidden bg-cover bg-top bg-no-repeat lg:[background-size:177.86%] lg:[background-position:3.7%_5%]"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Top nav — solid white bar on mobile, overlaid on the hero on desktop */}
        <div className="relative z-20 flex items-center justify-between bg-white lg:bg-transparent px-[clamp(1rem,2.5vw,3rem)] py-5 lg:py-6">
          <NavLink to="/" className="shrink-0">
            <img
              src={zeedaraLogo}
              alt="Zeedara Logo"
              className="h-[24px] lg:h-[44px] w-auto"
            />
          </NavLink>

          <div className="flex items-center gap-3 text-black lg:text-white">
            <AccountDropdown light />
            <button
              type="button"
              aria-label="Shopping cart"
              className="flex items-center gap-1 p-2 cursor-pointer"
            >
              <ShoppingCart className="size-[22px]" />
              <span className="min-w-[19px] rounded-[10px] bg-[#ca9949] px-1 py-px text-center text-[12px] font-semibold text-white leading-[1.4]">
                1
              </span>
            </button>
            <MobileNav navLinks={navLinks} logo={zeedaraLogo} />
          </div>
        </div>

        {/* Confirm-email card */}
        <div className="flex flex-1 items-center justify-center lg:justify-start px-4 py-10 sm:px-8 lg:px-[clamp(3rem,8vw,10rem)]">
          <form className="confirm-card flex w-full max-w-[420px] flex-col gap-5 bg-white p-5 sm:p-7">
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

            <div className="flex flex-col gap-3">
              <h1 className="font-['Anton'] text-[26px] sm:text-[30px] leading-[1.4] tracking-[-0.72px] text-black">
                Confirm your email
              </h1>
              <p className="text-[14px] font-medium leading-[1.4] text-black">
                Enter the six digit code we just sent to zeedara@mail.com
              </p>
            </div>

            <div className="flex items-center justify-start gap-2">
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
                    className="size-10 sm:size-11 border-[1.5px] border-[#828a9b] text-center text-[16px] font-semibold text-black focus:border-(--primary-color) focus:outline-none"
                  />
                  {index === 2 && (
                    <span className="h-[1.5px] w-2 shrink-0 bg-[#828a9b]" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-5">
              <button
                type="submit"
                className="w-full bg-(--primary-color) px-6 py-4 text-center text-[16px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
              >
                Verify now
              </button>
              <p className="flex gap-2 text-[14px] font-semibold">
                <span className="text-[#667085]">
                  Didn&rsquo;t receive a code? Wait
                </span>
                <span className="text-(--primary-color)">1:99</span>
              </p>
            </div>
          </form>
        </div>
      </section>

      <Faq />
      <Footer />
    </div>
  );
}

export default ConfirmEmail;
