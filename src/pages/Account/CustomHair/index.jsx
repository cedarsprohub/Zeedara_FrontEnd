import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, ShoppingCart } from "lucide-react";
import productImg from "../../../assets/ui/sampleImg.png";
import { useAuth } from "../../../context/AuthContext.js";
import { payWithPaystack } from "../../../utils/paystack";

const STATS = [
  { label: "All Requests", value: "3", tint: "orange" },
  { label: "Under Review", value: "0", tint: "orange" },
  { label: "Quote Received", value: "2", tint: "orange" },
  { label: "Completed", value: "1", tint: "blue" },
];

const REQUESTS = [
  {
    id: "CHR-1024",
    submitted: "12 June 2026",
    title: "24” Body Wave Wig",
    type: "100% Human Hair",
    specs: "Colour: 613 / Length: 24” / Texture: Body Wave",
    budget: "₦80,000 - ₦100,000",
    quoteAmount: 95000, // NGN — feeds the Paystack amount input
    note: "We have reviewed your request and sent a quote",
  },
];

const naira = (amount) => `₦${amount.toLocaleString("en-NG")}`;

function StatCard({ label, value, tint }) {
  const tintStyles =
    tint === "blue"
      ? "bg-[rgba(43,127,255,0.1)] text-[#2b7fff]"
      : "bg-[rgba(255,105,0,0.1)] text-[#ff6900]";
  return (
    <div className="flex items-start justify-between gap-2 border border-[#dadde2] bg-white px-2 py-3">
      <div className="flex flex-col gap-5">
        <p className="text-[12px] font-medium text-[#48505e]">{label}</p>
        <p className="text-[18px] font-semibold leading-none text-[#262626]">
          {value}
        </p>
      </div>
      <div
        className={`flex size-6 shrink-0 items-center justify-center shadow-[inset_0px_3.333px_6.667px_0px_rgba(0,0,0,0.05)] ${tintStyles}`}
      >
        <ShoppingCart className="size-[16px]" strokeWidth={2} />
      </div>
    </div>
  );
}

function RequestCard({ request, submitted }) {
  return (
    <div className="border border-[#dadde2] bg-white p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="h-[213px] w-full shrink-0 overflow-hidden bg-[#f0f1f3] sm:w-[210px]">
          <img
            src={productImg}
            alt={request.title}
            className="size-full object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center justify-between gap-4 text-[13px] font-medium text-[#48505e]">
            <p>Request #{request.id}</p>
            <p className="text-right">Submitted on {request.submitted}</p>
          </div>

          <h3 className="text-[14px] font-semibold leading-[1.4] text-[#3a404c]">
            {request.title}
          </h3>

          <span className="h-px w-full bg-[#dadde2]" />

          <div className="flex flex-col gap-2 text-[13px] font-medium text-[#48505e]">
            <p>Type: {request.type}</p>
            <p>{request.specs}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-[14px] font-semibold text-black">
              Budget: {request.budget}
            </p>
            {/* Not "successful" — nothing has verified this payment yet. */}
            {submitted && (
              <span className="text-[13px] font-semibold text-[#d99116]">
                PAYMENT SUBMITTED — AWAITING CONFIRMATION
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteSection({ request, submitted, onPay }) {
  return (
    <div className="flex flex-col gap-6">
      <span className="inline-flex w-fit items-center bg-[#f0f1f3] px-2 py-1 text-[12px] font-bold text-[#3a404c]">
        QUOTE RECEIVED {naira(request.quoteAmount)}
      </span>
      <p className="text-[13px] font-medium text-[#48505e]">{request.note}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <button
          type="button"
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-(--primary-color) px-4 text-[13px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-[225px]"
        >
          DOWNLOAD QUOTE
          <Download className="size-5 shrink-0" strokeWidth={2} />
        </button>
        {!submitted && (
          <button
            type="button"
            onClick={() => onPay(request)}
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#faf4eb] px-4 text-[13px] font-semibold tracking-[0.28px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2] sm:w-[224px]"
          >
            MAKE PAYMENT
          </button>
        )}
      </div>
    </div>
  );
}

function CustomHair() {
  const { user } = useAuth();

  // Quotes whose popup reported a charge attempt. Deliberately NOT "paid":
  // custom-hair requests have no API behind them, so there's no order number to
  // hand to `/payments/paystack/verify`. Until one exists, the furthest this can
  // honestly go is "submitted, awaiting confirmation" — a browser callback is
  // not proof money moved.
  const [submittedIds, setSubmittedIds] = useState(() => new Set());
  const [payError, setPayError] = useState(null);

  const markSubmitted = (id) =>
    setSubmittedIds((prev) => new Set(prev).add(id));

  const handlePay = (request) => {
    setPayError(null);
    payWithPaystack({
      amount: request.quoteAmount,
      email: user?.email,
      reference: `${request.id}-${request.submitted}`,
      onSuccess: () => markSubmitted(request.id),
      // A missing key or a blocked script is a failure to charge, and now reads
      // as one instead of quietly marking the quote paid.
      onError: (error) => setPayError(error.message),
    });
  };

  return (
    <div className="flex flex-col gap-8 lg:p-8">
      {/* Header + stats */}
      <div className="flex flex-col gap-[25px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[16px] font-semibold leading-[1.4] text-black">
              Custom Hair Requests
            </h1>
            <p className="text-[13px] text-[#48505e]">
              View your submitted requests, quotes, and updates.
            </p>
          </div>
          <Link
            to="/account/custom-hair/new"
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[13px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-[231px]"
          >
            NEW REQUEST
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Requests */}
      <div className="flex flex-col gap-5">
        <h2 className="text-[14px] font-semibold leading-[1.4] text-black">
          Custom Hair Requests
        </h2>

        {payError && (
          <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
            {payError}
          </p>
        )}

        {REQUESTS.map((request) => {
          const submitted = submittedIds.has(request.id);
          return (
            <div key={request.id} className="flex flex-col gap-6">
              <RequestCard request={request} submitted={submitted} />
              <QuoteSection
                request={request}
                submitted={submitted}
                onPay={handlePay}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomHair;
