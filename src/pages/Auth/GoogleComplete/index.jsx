import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Faq from "../../../components/faq";
import Footer from "../../../components/footer";
import AuthNav from "../../../components/navbar/AuthNav";
import heroImage from "../../../assets/auth/getstarted_hero.png";
import nigeriaFlag from "../../../assets/auth/flag_nigeria.svg";
import { completeGoogleProfile } from "../../../api/auth";
import { ApiError } from "../../../api/client";
import { useAuth } from "../../../context/AuthContext.js";

function GoogleComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const registrationToken = location.state?.registrationToken;
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!registrationToken) navigate("/register", { replace: true });
  }, [registrationToken, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const tokens = await completeGoogleProfile(phone, registrationToken);
      login(tokens);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="google-complete">
      <AuthNav />

      {/* Hero */}
      <section
        className="relative isolate flex min-h-[560px] lg:min-h-[720px] flex-col overflow-hidden bg-cover bg-top bg-no-repeat lg:[background-size:177.86%] lg:[background-position:3.7%_5%]"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="flex flex-1 items-center justify-center lg:justify-start px-4 py-10 sm:px-8 lg:px-[clamp(3rem,8vw,10rem)]">
          <form
            onSubmit={handleSubmit}
            className="google-complete-card flex w-full max-w-[440px] flex-col gap-6 bg-white p-5 sm:p-8"
          >
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
                One last step
              </h1>
              <p className="text-[14px] font-medium leading-[1.4] text-black">
                Add your phone number to finish setting up your account
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="google-phone"
                className="text-[14px] font-medium text-[#575f71]"
              >
                Phone number
              </label>
              <div className="flex h-[52px] items-center border border-[#dadde2] focus-within:border-(--primary-color)">
                <button
                  type="button"
                  className="flex h-full items-center gap-1 border-r border-[#dadde2] pl-4 pr-3 cursor-pointer"
                >
                  <img src={nigeriaFlag} alt="Nigeria" className="size-5" />
                  <ChevronDown className="size-4 text-[#9fa5b2]" />
                </button>
                <input
                  id="google-phone"
                  type="tel"
                  required
                  placeholder="+234"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] text-black placeholder:text-[#9fa5b2] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-(--primary-color) px-6 py-4 text-center text-[16px] font-bold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Please wait..." : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <Faq />
      <Footer />
    </div>
  );
}

export default GoogleComplete;
