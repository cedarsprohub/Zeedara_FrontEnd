import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import Faq from "../../../components/faq";
import Footer from "../../../components/footer";
import AuthNav from "../../../components/navbar/AuthNav";
import heroImage from "../../../assets/auth/forgotpassword_hero.jpg";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  return (
    <div className="forgot-password">
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

        {/* Reset-password card (left side) */}
        <div className="relative z-10 flex flex-1 items-center justify-center lg:justify-start px-4 py-10 sm:px-8 lg:px-[clamp(3rem,8vw,10rem)]">
          <form className="forgot-password-card flex w-full max-w-[440px] flex-col gap-6 bg-white p-5 sm:p-8 shadow-[-2px_-9px_43.9px_rgba(0,0,0,0.08)]">
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
                Reset your password
              </h1>
              <p className="text-[14px] font-medium leading-[1.4] text-[#575f71]">
                Type your email address and we will send a confirmation code to
                you.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="reset-email"
                className="text-[14px] font-medium text-[#575f71]"
              >
                Email
              </label>
              <div className="flex h-[52px] items-center gap-2 border border-[#dadde2] px-[17px] focus-within:border-(--primary-color)">
                <Mail className="size-6 shrink-0 text-[#9fa5b2]" strokeWidth={2} />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-black placeholder:text-[#9fa5b2] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-(--primary-color) px-6 py-4 text-center text-[16px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
            >
              Send code
            </button>

            <div className="flex gap-4 text-[14px] font-medium text-[#667085]">
              <a href="#terms" className="underline cursor-pointer hover:text-(--primary-color)">
                Terms
              </a>
              <a href="#privacy" className="underline cursor-pointer hover:text-(--primary-color)">
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

export default ForgotPassword;
