import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Faq from "../../../components/faq";
import Footer from "../../../components/footer";
import AuthNav from "../../../components/navbar/AuthNav";
import heroImage from "../../../assets/auth/login_hero.png";
import googleIcon from "../../../assets/auth/google_icon.svg";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <div className="login">
      <AuthNav />

      {/* Hero */}
      <section
        className="relative isolate flex min-h-screen flex-col overflow-hidden bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Sign-in card (right side) */}
        <div className="flex flex-1 items-center justify-center lg:justify-end px-4 py-10 sm:px-8 lg:px-[clamp(3rem,8vw,10rem)]">
          <form className="signin-card flex w-full max-w-[440px] flex-col gap-5 bg-white p-5 sm:p-8">
            <h1 className="font-['Anton'] text-[26px] sm:text-[30px] leading-[1.4] tracking-[-0.72px] text-black">
              Sign in
            </h1>

            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 border border-[#8c8c8c] px-[17px] py-[13px] cursor-pointer transition-colors hover:bg-[#f7f8fa]"
            >
              <img src={googleIcon} alt="" className="size-6 shrink-0" />
              <span className="flex-1 text-center text-[14px] font-semibold text-black">
                Sign in with Google
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
                htmlFor="login-email"
                className="text-[14px] font-medium text-[#575f71]"
              >
                Email
              </label>
              <div className="flex h-[52px] items-center gap-2 border border-[#dadde2] px-[17px] focus-within:border-(--primary-color)">
                <Mail className="size-6 shrink-0 text-[#9fa5b2]" strokeWidth={2} />
                <input
                  id="login-email"
                  type="email"
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-black placeholder:text-[#9fa5b2] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="login-password"
                className="text-[14px] font-medium text-[#575f71]"
              >
                Password
              </label>
              <div className="flex h-[52px] items-center gap-2 border border-[#dadde2] px-[17px] focus-within:border-(--primary-color)">
                <Lock className="size-6 shrink-0 text-[#9fa5b2]" strokeWidth={2} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-black placeholder:text-[#9fa5b2] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="shrink-0 cursor-pointer text-[#9fa5b2]"
                >
                  {showPassword ? (
                    <Eye className="size-6" strokeWidth={2} />
                  ) : (
                    <EyeOff className="size-6" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-5">
              <button
                type="button"
                onClick={() => setRemember((v) => !v)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="flex size-[18px] items-center justify-center border-2 border-(--primary-color)">
                  {remember && <span className="size-[10px] bg-(--primary-color)" />}
                </span>
                <span className="text-[14px] font-medium text-black">
                  Remember me
                </span>
              </button>
              <NavLink
                to="/forgot-password"
                className="text-[14px] font-semibold text-(--primary-color) hover:underline"
              >
                Forgot Password?
              </NavLink>
            </div>

            <button
              type="submit"
              className="w-full bg-(--primary-color) px-6 py-4 text-center text-[16px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
            >
              Sign in
            </button>

            <div className="flex items-center gap-2 text-[14px]">
              <span className="font-medium text-black">New to Zeedara?</span>
              <NavLink
                to="/register"
                className="font-semibold text-(--primary-color) hover:underline"
              >
                Create an account
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

export default Login;
