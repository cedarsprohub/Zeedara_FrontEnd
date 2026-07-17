import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import Faq from "../../../components/faq";
import Footer from "../../../components/footer";
import AuthNav from "../../../components/navbar/AuthNav";
import heroImage from "../../../assets/auth/forgotpassword_hero.jpg";

const requirements = [
  { key: "length", label: "8 characters minimum", test: (v) => v.length >= 8 },
  { key: "number", label: "a number", test: (v) => /\d/.test(v) },
  { key: "upper", label: "an UPPERCASE letter", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "a lowercase letter", test: (v) => /[a-z]/.test(v) },
];

function ChangePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const metCount = requirements.filter((r) => r.test(password)).length;
  const strength = metCount <= 2 ? "Weak" : metCount === 3 ? "Medium" : "Strong";
  const strengthColor =
    metCount <= 1 ? "#cf251f" : metCount <= 3 ? "#e7ba6c" : "#0f9959";
  const strengthWidth = password ? (metCount / requirements.length) * 100 : 0;

  return (
    <div className="change-password">
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

        {/* Change-password card (left side) */}
        <div className="relative z-10 flex flex-1 items-center justify-center lg:justify-start px-4 py-10 sm:px-8 lg:px-[clamp(3rem,8vw,10rem)]">
          <form className="change-password-card flex w-full max-w-[440px] flex-col gap-6 bg-white p-5 sm:p-8 shadow-[-2px_-9px_43.9px_rgba(0,0,0,0.08)]">
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
                Change your password
              </h1>
              <div className="text-[14px] leading-[1.4]">
                <p className="font-medium text-[#575f71]">
                  We emailed a confirmation code to
                </p>
                <p className="font-semibold text-black">zeedara@mail.com</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Password */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="new-password"
                  className="text-[14px] font-medium text-[#575f71]"
                >
                  Password
                </label>
                <div className="flex h-[52px] items-center gap-2 border border-[#dadde2] px-[17px] focus-within:border-(--primary-color)">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Confirm Password */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirm-password"
                  className="text-[14px] font-medium text-[#575f71]"
                >
                  Confirm Password
                </label>
                <div className="flex h-[52px] items-center gap-2 border border-[#dadde2] px-[17px] focus-within:border-(--primary-color)">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-[14px] text-black placeholder:text-[#9fa5b2] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="shrink-0 cursor-pointer text-[#9fa5b2]"
                  >
                    {showConfirm ? (
                      <Eye className="size-6" strokeWidth={2} />
                    ) : (
                      <EyeOff className="size-6" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* Strength meter */}
              <div className="h-3 w-full overflow-hidden rounded-lg bg-[#dadde2]">
                <div
                  className="h-full rounded-lg transition-all duration-300"
                  style={{
                    width: `${strengthWidth}%`,
                    backgroundColor: strengthColor,
                  }}
                />
              </div>

              {/* Requirements checklist */}
              <div className="flex flex-col gap-2">
                {requirements.map((requirement, index) => {
                  const met = requirement.test(password);
                  const item = (
                    <span className="flex items-center gap-2">
                      {met ? (
                        <CheckCircle2
                          className="size-5 shrink-0 text-[#0f9959]"
                          strokeWidth={2}
                        />
                      ) : (
                        <XCircle
                          className="size-5 shrink-0 text-[#cf251f]"
                          strokeWidth={2}
                        />
                      )}
                      <span className="text-[14px] font-medium text-[#575f71]">
                        {requirement.label}
                      </span>
                    </span>
                  );

                  return index === 0 ? (
                    <div
                      key={requirement.key}
                      className="flex items-center justify-between gap-2"
                    >
                      {item}
                      <span className="text-[14px] font-semibold text-black">
                        {strength}
                      </span>
                    </div>
                  ) : (
                    <div key={requirement.key}>{item}</div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-(--primary-color) px-6 py-4 text-center text-[16px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
            >
              Change password
            </button>

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

export default ChangePassword;
