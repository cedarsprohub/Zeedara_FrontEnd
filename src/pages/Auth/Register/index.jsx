import { NavLink } from "react-router-dom";
import { Mail } from "lucide-react";
import Faq from "../../../components/faq";
import Footer from "../../../components/footer";
import AuthNav from "../../../components/navbar/AuthNav";
import heroImage from "../../../assets/auth/signup_hero.png";
import googleIcon from "../../../assets/auth/google_icon.svg";

function Register() {
  return (
    <div className="register">
      <AuthNav />

      {/* Hero */}
      <section
        className="relative isolate flex min-h-screen flex-col overflow-hidden bg-cover bg-top bg-no-repeat lg:[background-size:177.86%] lg:[background-position:3.7%_5%]"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Sign-up card */}
        <div className="flex flex-1 items-center justify-center lg:justify-start px-4 py-10 sm:px-8 lg:px-[clamp(3rem,8vw,10rem)]">
          <form className="signup-card flex w-full max-w-[440px] flex-col gap-4 bg-white p-5 sm:p-8">
            <h1 className="font-['Anton'] text-[26px] sm:text-[30px] leading-[1.4] tracking-[-0.72px] text-black">
              Create an Account
            </h1>

            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 border border-[#8c8c8c] px-[17px] py-[13px] cursor-pointer transition-colors hover:bg-[#f7f8fa]"
            >
              <img src={googleIcon} alt="" className="size-6 shrink-0" />
              <span className="flex-1 text-center text-[14px] font-semibold text-black">
                Sign up with Google
              </span>
              <span className="size-6 shrink-0" />
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[#dadde2]" />
              <span className="text-[12px] font-medium text-[#bdc2cb]">or</span>
              <span className="h-px flex-1 bg-[#dadde2]" />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="signup-email"
                className="text-[14px] font-medium text-[#575f71]"
              >
                Email
              </label>
              <div className="flex h-[52px] items-center gap-2 border border-[#dadde2] px-[17px]">
                <Mail className="size-6 shrink-0 text-[#9fa5b2]" strokeWidth={2} />
                <input
                  id="signup-email"
                  type="email"
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-black placeholder:text-[#9fa5b2] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-(--primary-color) px-6 py-4 text-center text-[16px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
            >
              Continue
            </button>

            <div className="flex items-center gap-2 text-[14px]">
              <span className="font-medium text-black">
                Already have an account?
              </span>
              <NavLink
                to="/login"
                className="font-semibold text-(--primary-color) hover:underline"
              >
                Sign in
              </NavLink>
            </div>
          </form>
        </div>
      </section>

      <Faq />
      <Footer />
    </div>
  );
}

export default Register;
