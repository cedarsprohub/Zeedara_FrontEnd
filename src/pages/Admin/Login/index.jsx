import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Seo from "../../../components/shared/Seo";
import logo from "../../../assets/admin/zeedara_logo_vertical.png";
import { adminLogin } from "../../../api/admin/auth";
import { ApiError } from "../../../api/client";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Checked by default, matching the design.
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { challenge_token: challengeToken } = await adminLogin(
        email,
        password,
      );

      if (!challengeToken) {
        setError("Sign-in failed. Please contact the system administrator.");
        return;
      }

      // This endpoint never issues tokens, so nothing is stored yet — the OTP
      // step does that. `remember` and the return path ride along to it.
      navigate("/admin/verify-otp", {
        state: { challengeToken, email, remember, from: location.state?.from },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf4eb] p-4">
      <Seo title="Admin Login" description="Zeedara admin access." noindex />

      {/* Every dimension below is the Figma spec multiplied by 0.9 — the card,
          its padding and gaps, the type, the field heights and the icons all
          shrink together, so the design's proportions are preserved rather than
          just narrowing the card. Figma values are noted alongside. */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[459px] flex-col items-center gap-[28.8px] bg-white p-[21.6px] sm:p-[36px]"
      >
        <div className="flex flex-col items-center gap-[10.8px]">
          <img
            src={logo}
            alt="Zeedara"
            width="112"
            height="60"
            className="h-[60.2px] w-[111.6px]"
          />
          {/* 36px → 32.4px */}
          <h1 className="text-center font-['Anton'] text-[32.4px] leading-[1.4] tracking-[-0.648px] text-black">
            Admin Login
          </h1>
        </div>

        <div className="flex w-full flex-col gap-[18px]">
          <div className="flex flex-col gap-[7.2px]">
            <label
              htmlFor="admin-email"
              className="text-[12.6px] font-medium text-[#575f71]"
            >
              Email
            </label>
            {/* 58px → 52.2px, 17px padding → 15.3px */}
            <div className="flex h-[52.2px] items-center gap-[7.2px] border border-[#dadde2] px-[15.3px] focus-within:border-(--primary-color)">
              <Mail
                className="size-[15.3px] shrink-0 text-[#9fa5b2]"
                strokeWidth={2}
              />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@zeedara.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[12.6px] text-black placeholder:text-[#9fa5b2] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[7.2px]">
            <label
              htmlFor="admin-password"
              className="text-[12.6px] font-medium text-[#575f71]"
            >
              Password
            </label>
            <div className="flex h-[52.2px] items-center gap-[7.2px] border border-[#dadde2] px-[15.3px] focus-within:border-(--primary-color)">
              <Lock
                className="size-[15.3px] shrink-0 text-[#9fa5b2]"
                strokeWidth={2}
              />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[12.6px] text-black placeholder:text-[#9fa5b2] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="shrink-0 cursor-pointer text-[#9fa5b2]"
              >
                {showPassword ? (
                  <Eye className="size-[17.1px]" strokeWidth={2} />
                ) : (
                  <EyeOff className="size-[17.1px]" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* A real checkbox carries the state for assistive tech and label
            clicks; the bordered square next to it is the visible control. */}
        <label className="flex w-full cursor-pointer items-center gap-[7.2px]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="peer sr-only"
          />
          <span className="flex size-[16.2px] shrink-0 items-center justify-center border-2 border-(--primary-color) peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--primary-color)">
            {remember && <span className="size-[9px] bg-(--primary-color)" />}
          </span>
          <span className="text-[12.6px] text-black">Remember me</span>
        </label>

        {error && <p className="w-full text-[12.6px] text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer bg-(--primary-color) px-[21.6px] py-[14.4px] text-center text-[14.4px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
