import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import Faq from "../../../components/faq";
import Footer from "../../../components/footer";
import AuthNav from "../../../components/navbar/AuthNav";
import GoogleAuthButton from "../../../components/auth/GoogleAuthButton";
import heroImage from "../../../assets/auth/signup_hero.png";
import googleIcon from "../../../assets/auth/google_icon.svg";
import { registerEmail, googleAuth } from "../../../api/auth";
import { ApiError } from "../../../api/client";
import { useAuth } from "../../../context/AuthContext.js";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await registerEmail(email);
      navigate("/confirm-email", { state: { email } });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = async (idToken) => {
    setError("");
    setIsSubmitting(true);
    try {
      const response = await googleAuth(idToken);
      if (response?.tokens) {
        login(response.tokens);
        navigate("/");
      } else if (response?.registration_token) {
        navigate("/complete-google-profile", {
          state: { registrationToken: response.registration_token },
        });
      } else {
        setError("Something went wrong with Google sign-in.");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <form
            onSubmit={handleSubmit}
            className="signup-card flex w-full max-w-[440px] flex-col gap-4 bg-white p-5 sm:p-8"
          >
            <h1 className="font-['Anton'] text-[26px] sm:text-[30px] leading-[1.4] tracking-[-0.72px] text-black">
              Create an Account
            </h1>

            <GoogleAuthButton
              label="Sign up with Google"
              icon={googleIcon}
              onCredential={handleGoogleCredential}
              onError={setError}
            />

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
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-black placeholder:text-[#9fa5b2] focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-(--primary-color) px-6 py-4 text-center text-[16px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Please wait..." : "Continue"}
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
