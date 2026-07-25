import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Faq from "../../../components/faq";
import Footer from "../../../components/footer";
import AuthNav from "../../../components/navbar/AuthNav";
import heroImage from "../../../assets/auth/getstarted_hero.png";
import nigeriaFlag from "../../../assets/auth/flag_nigeria.svg";
import { completeProfile } from "../../../api/auth";
import { ApiError } from "../../../api/client";

function GetStarted() {
  const navigate = useNavigate();
  const location = useLocation();
  const registrationToken = location.state?.registrationToken;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      const response = await completeProfile(
        {
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
        },
        registrationToken,
      );
      navigate("/create-password", {
        state: { registrationToken: response.registration_token },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="get-started">
      <AuthNav />

      {/* Hero */}
      <section
        className="relative isolate flex min-h-[560px] lg:min-h-[720px] flex-col overflow-hidden bg-cover bg-top bg-no-repeat lg:[background-size:177.86%] lg:[background-position:3.7%_5%]"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="flex flex-1 items-center justify-center lg:justify-start px-4 py-10 sm:px-8 lg:px-[clamp(3rem,8vw,10rem)]">
          <form
            onSubmit={handleSubmit}
            className="getstarted-card flex w-full max-w-[440px] flex-col gap-6 bg-white p-5 sm:p-8"
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
                Let&rsquo;s get you started
              </h1>
              <p className="text-[14px] font-medium leading-[1.4] text-black">
                Enter your personal details first
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <div className="flex flex-1 flex-col gap-2">
                <label
                  htmlFor="first-name"
                  className="text-[14px] font-medium text-[#575f71]"
                >
                  First Name
                </label>
                <input
                  id="first-name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="h-[52px] w-full border border-[#dadde2] px-[17px] text-[14px] text-black focus:border-(--primary-color) focus:outline-none"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <label
                  htmlFor="surname"
                  className="text-[14px] font-medium text-[#575f71]"
                >
                  Surname
                </label>
                <input
                  id="surname"
                  type="text"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="h-[52px] w-full border border-[#dadde2] px-[17px] text-[14px] text-black focus:border-(--primary-color) focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
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
                  id="phone"
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

export default GetStarted;
