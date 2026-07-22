import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ChevronDown, ArrowRight } from "lucide-react";
import Faq from "../../components/faq";
import { payWithPaystack } from "../../utils/paystack";

import zeedaraLogo from "../../assets/navbar/zeedara_logo.png";
import heroLeft from "../../assets/skincare/hero-left.png";
import heroRight from "../../assets/skincare/hero-right.png";
import coversImg from "../../assets/skincare/covers.png";
import understandImg from "../../assets/skincare/understand.png";
import bookingImg from "../../assets/skincare/booking.png";
import cleansersImg from "../../assets/skincare/cleansers.png";
import tonersImg from "../../assets/skincare/toners.png";
import serumsImg from "../../assets/skincare/serums.png";
import allSkincareImg from "../../assets/skincare/all-skincare.png";

const SIDE = "px-[clamp(1rem,6.25vw,7.5rem)]";
const WHATSAPP_URL = "https://wa.me/2349012345869";

const COVERS = [
  {
    title: "Skin Type Assessment",
    desc: "Understand whether your skin is oily, dry, combination, sensitive, or acne-prone.",
  },
  {
    title: "Skin Concern Review",
    desc: "Discuss concerns like acne, dark spots, dullness, dryness, uneven tone, texture, or product reactions.",
  },
  {
    title: "Current Routine Check",
    desc: "Review the products you currently use and identify what may be helping or causing issues.",
  },
  {
    title: "Product Recommendations",
    desc: "Get suitable skincare product suggestions based on your skin needs and budget.",
  },
  {
    title: "Simple Routine Plan",
    desc: "Receive guidance on what to use, when to use it, and how to layer your products properly.",
  },
];

const SKIN_TYPES = ["Oily", "Dry", "Combination", "Sensitive", "Normal", "Acne-prone"];

const CONCERNS = [
  "Acne and breakouts",
  "Dark spots",
  "Hyperpigmentation",
  "Uneven skin tone",
  "Rough texture",
  "Skin sensitivity",
  "Dryness",
  "Fine lines",
  "Others",
  "Oily skin",
];

const AVAILABILITY = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Saturdays",
  "Any day",
];

const PRODUCTS = [
  { label: "CLEANSERS", img: cleansersImg },
  { label: "TONERS", img: tonersImg },
  { label: "SERUMS", img: serumsImg },
  { label: "ALL SKIN CARE PRODUCTS", img: allSkincareImg, cta: true },
];

const SKINCARE_FAQS = [
  {
    question: "How much is the skincare consultation?",
    answer: "The skincare consultation costs ₦10,000.",
  },
  {
    question: "What does the consultation include?",
    answer:
      "It includes a review of your skin concerns, current routine, skin type guidance, and product recommendations.",
  },
  {
    question: "Is this a treatment or facial service?",
    answer:
      "No. This is a skincare consultation service, not a facial treatment or medical procedure.",
  },
  {
    question: "Can I buy the recommended products from Zeedara?",
    answer:
      "Yes. After the consultation, you can shop recommended skincare products directly from Zeedara.",
  },
  {
    question: "Do I need to know my skin type before booking?",
    answer:
      "No. The consultation can help you better understand your skin type and what products may suit you.",
  },
  {
    question: "Can I speak with someone on WhatsApp before booking?",
    answer:
      "Yes. You can contact Zeedara through WhatsApp for booking support or questions.",
  },
];

/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="bg-[#faf4eb]">
      <div className="flex items-stretch">
        <img
          src={heroLeft}
          alt=""
          className="hidden w-[24%] shrink-0 object-cover xl:block"
        />
        <div className="flex flex-1 flex-col items-center gap-[18px] px-6 py-14 text-center lg:py-24">
          <img src={zeedaraLogo} alt="Zeedara" className="h-[36px] w-auto lg:h-[43px]" />
          <div className="relative flex flex-col items-center">
            <h1 className="font-['Anton'] text-[clamp(2.75rem,8vw,93px)] leading-[1.04] tracking-[-0.02em] text-black">
              PERSONALIZED
              <br aria-hidden />
              SKIN CARE
            </h1>
            <span className="-mt-[0.15em] font-['Abhaya_Libre'] text-[clamp(3.25rem,10vw,118px)] leading-none tracking-[-0.02em] text-(--primary-color)">
              Consultation
            </span>
          </div>
          <p className="max-w-[729px] text-[16px] leading-[1.48] text-black lg:text-[18px]">
            Get expert guidance on your skin concerns, product choices, and daily
            routine with a one-on-one skincare consultation tailored to your skin
            type.
          </p>
          <div className="flex flex-col gap-[18px] sm:flex-row">
            <a
              href="#book"
              className="flex items-center justify-center bg-(--primary-color) px-6 py-4 text-[16px] font-bold text-white transition-opacity hover:opacity-90"
            >
              BOOK A CONSULTATION
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border-[1.5px] border-[#d6b176] bg-[#faf4eb] px-6 py-4 text-[16px] font-semibold text-(--primary-color) transition-colors hover:bg-[#f3e7d2]"
            >
              <MessageCircle className="size-6 shrink-0" strokeWidth={2} />
              CHAT ON WHATSAPP
            </a>
          </div>
        </div>
        <img
          src={heroRight}
          alt=""
          className="hidden w-[24%] shrink-0 object-cover xl:block"
        />
      </div>
    </section>
  );
}

function Covers() {
  const [active, setActive] = useState(0);
  return (
    <section className={`${SIDE} bg-white`}>
      <div className="flex flex-col overflow-hidden lg:flex-row">
        <div className="h-[300px] w-full shrink-0 overflow-hidden bg-black lg:h-auto lg:w-[45%]">
          <img src={coversImg} alt="" className="size-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col gap-10 bg-white px-6 py-12 lg:px-11 lg:py-16">
          <h2 className="font-['Anton'] text-[clamp(2rem,4vw,52px)] leading-[1.21] tracking-[-0.02em] text-black">
            WHAT THE CONSULATION COVERS
          </h2>
          <div className="flex flex-col gap-6">
            {/* Step tabs */}
            <div className="flex items-center">
              {COVERS.map((_, i) => (
                <div key={i} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border font-['Anton'] text-[14px] transition-colors ${
                      i <= active
                        ? "border-(--primary-color) bg-(--primary-color) text-white"
                        : "border-[#dadde2] bg-white text-[#dadde2]"
                    }`}
                  >
                    {i + 1}
                  </button>
                  {i < COVERS.length - 1 && (
                    <span className="h-px w-6 bg-[#dadde2]" />
                  )}
                </div>
              ))}
            </div>
            {/* Active step */}
            <div className="flex flex-col gap-[7px]">
              <h3 className="font-['Anton'] text-[30px] leading-[1.4] text-black">
                {COVERS[active].title}
              </h3>
              <p className="text-[18px] leading-[1.48] text-black">
                {COVERS[active].desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-[17px] py-[9px] text-[14px] font-semibold transition-colors ${
        active
          ? "border-(--primary-color) bg-[#faf4eb] text-(--primary-color)"
          : "border-[#575f71] text-[#575f71] hover:border-(--primary-color)"
      }`}
    >
      {label}
    </button>
  );
}

function BookConsultation() {
  const [concerns, setConcerns] = useState([]);
  const [availability, setAvailability] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [booked, setBooked] = useState(false);

  const toggleConcern = (c) =>
    setConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return;
    payWithPaystack({
      amount: 10000,
      email: "customer@zeedara.com",
      reference: `SKN-${Date.now()}`,
      onSuccess: () => setBooked(true),
    });
  };

  const fieldLabel = "text-[14px] font-medium text-[#48505e]";
  const inputCls =
    "w-full border border-[#bdc2cb] p-[17px] text-[14px] text-black placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none";

  return (
    <section id="book" className={`${SIDE} scroll-mt-24 bg-white py-16`}>
      <div className="flex flex-col gap-9">
        <h2 className="font-['Anton'] text-[clamp(2rem,4vw,52px)] leading-[1.21] tracking-[-0.02em] text-black">
          Book Your Skin Care Consultation
        </h2>

        <div className="flex flex-col gap-9 lg:flex-row lg:items-stretch">
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-9">
            {/* Contact row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className={fieldLabel}>Full Name</span>
                <input type="text" className={inputCls} />
              </label>
              <label className="flex flex-col gap-2">
                <span className={fieldLabel}>Phone/WhatsApp Number</span>
                <input type="tel" className={inputCls} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#575f71]">
                  Skin type
                </span>
                <div className="relative">
                  <select
                    defaultValue=""
                    className={`${inputCls} cursor-pointer appearance-none border-[#dadde2] pr-10`}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {SKIN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-6 -translate-y-1/2 text-[#48505e]" />
                </div>
              </label>
            </div>

            {/* Concerns + availability */}
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
              <div className="flex flex-1 flex-col gap-4">
                <h3 className="text-[16px] font-semibold text-[#2e323c]">
                  Main Skin Concern
                </h3>
                <div className="flex flex-wrap gap-4">
                  {CONCERNS.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      active={concerns.includes(c)}
                      onClick={() => toggleConcern(c)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4 lg:w-[371px]">
                <h3 className="text-[16px] font-semibold text-[#2e323c]">
                  Preferred availability
                </h3>
                <div className="flex flex-wrap gap-3">
                  {AVAILABILITY.map((a) => (
                    <Chip
                      key={a}
                      label={a}
                      active={availability === a}
                      onClick={() => setAvailability(a)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Describe */}
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>Describe your concern</span>
              <textarea rows={5} className={`${inputCls} resize-none`} />
            </label>

            {/* Upload */}
            <div className="flex flex-col gap-4">
              <input
                type="file"
                accept="image/*"
                className="block w-full text-[14px] font-semibold text-[#48505e] file:mr-3 file:cursor-pointer file:border file:border-[#48505e] file:bg-white file:px-[17px] file:py-[9px] file:text-[14px] file:font-semibold file:text-[#48505e]"
              />
              <p className="text-[12px] italic text-[#575f71]">
                Upload a clear photo in good lighting. Avoid filters or heavy
                makeup.
              </p>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 text-[14px] font-semibold text-[#575f71]">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-[6px] accent-[#bf8322]"
              />
              <span>
                I understand that the ₦10,000 consultation fee must be paid before
                my request is submitted, and Zeedara will send my confirmed date
                and time after reviewing my request.
              </span>
            </label>

            {booked ? (
              <p className="bg-[#eefeec] px-6 py-4 text-center text-[16px] font-bold text-[#298d1c]">
                PAYMENT SUCCESSFUL — WE&rsquo;LL BE IN TOUCH SHORTLY
              </p>
            ) : (
              <button
                type="submit"
                disabled={!agreed}
                className="w-full cursor-pointer bg-(--primary-color) px-6 py-4 text-[16px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                PROCEED TO PAYMENT — ₦10,000
              </button>
            )}
          </form>

          <div className="hidden shrink-0 overflow-hidden bg-[#ece0d3] lg:block lg:w-[40%]">
            <img src={bookingImg} alt="" className="size-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Products() {
  return (
    <section className="flex flex-col gap-12 py-16">
      <div className={`${SIDE} flex flex-col gap-4`}>
        <h2 className="font-['Anton'] text-[clamp(2rem,4vw,52px)] leading-[1.21] tracking-[-0.02em] text-black">
          WHAT ARE YOU LOOKING FOR
        </h2>
        <p className="max-w-[588px] text-[18px] leading-[1.48] text-black">
          After your consultation, we can recommend suitable skincare products
          from our store based on your skin type, concerns, and routine.
        </p>
      </div>
      <div className={`${SIDE}`}>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <div key={p.label} className="flex flex-col gap-5">
              <h3 className="font-['Anton'] text-[clamp(1.25rem,2vw,36px)] leading-[1.4] tracking-[-0.02em] text-black">
                {p.label}
              </h3>
              <div className="relative h-[452px] overflow-hidden bg-[#faf4eb]">
                <img
                  src={p.img}
                  alt={p.label}
                  className="size-full object-cover object-bottom"
                />
                {p.cta && (
                  <>
                    <span className="absolute inset-0 bg-(--primary-color) opacity-40" />
                    <Link
                      to="/products"
                      className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 bg-[#faf4eb] py-4 pl-6 pr-5 text-[16px] font-semibold text-(--primary-color) transition-colors hover:bg-white"
                    >
                      SEE ALL
                      <ArrowRight className="size-6 shrink-0" strokeWidth={2} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Understand() {
  return (
    <section className="px-[clamp(1rem,4.5vw,144px)]">
      <div className="relative flex flex-col gap-6 overflow-hidden bg-[#efe0c8] px-6 py-12 lg:min-h-[359px] lg:flex-row lg:items-center lg:px-[86px] lg:py-0">
        <div className="flex flex-col gap-6 lg:w-[650px]">
          <div className="flex flex-col">
            <h2 className="font-['Anton'] text-[clamp(2.25rem,5vw,60px)] leading-[1.2] tracking-[-0.02em] text-black">
              UNDERSTAND YOUR
            </h2>
            <span className="font-['Abhaya_Libre'] text-[clamp(2.75rem,6vw,69px)] leading-none tracking-[-0.02em] text-(--primary-color)">
              Skin better
            </span>
          </div>
          <p className="max-w-[650px] text-[18px] leading-[1.48] text-black">
            Choosing the right skincare products can be confusing. Our skincare
            consultation helps you understand your skin type, identify possible
            causes of your concerns, and build a simple routine that works for
            you.
          </p>
        </div>
        <img
          src={understandImg}
          alt=""
          className="w-full object-cover lg:absolute lg:right-[52px] lg:top-0 lg:h-full lg:w-[720px]"
        />
      </div>
    </section>
  );
}

function Skincare() {
  return (
    <div className="skincare-clinic bg-white">
      <Hero />
      <Covers />
      <BookConsultation />
      <Products />
      <Understand />
      <Faq faqs={SKINCARE_FAQS} />
    </div>
  );
}

export default Skincare;
