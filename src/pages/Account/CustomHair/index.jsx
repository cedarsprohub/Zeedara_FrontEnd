import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, ShoppingCart } from "lucide-react";
import productImg from "../../../assets/ui/sampleImg.png";

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

// Load the Paystack Inline script once, on demand.
const PAYSTACK_SCRIPT = "https://js.paystack.co/v1/inline.js";
function loadPaystack() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop);
    let script = document.querySelector(`script[src="${PAYSTACK_SCRIPT}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = PAYSTACK_SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", () => resolve(window.PaystackPop));
    script.addEventListener("error", reject);
  });
}

function StatCard({ label, value, tint }) {
  const tintStyles =
    tint === "blue"
      ? "bg-[rgba(43,127,255,0.1)] text-[#2b7fff]"
      : "bg-[rgba(255,105,0,0.1)] text-[#ff6900]";
  return (
    <div className="flex items-start justify-between gap-3 border border-[#dadde2] bg-white p-[17px]">
      <div className="flex flex-col gap-6">
        <p className="text-[14px] font-medium text-[#48505e]">{label}</p>
        <p className="text-[30px] font-semibold leading-none text-[#262626]">
          {value}
        </p>
      </div>
      <div
        className={`flex size-10 shrink-0 items-center justify-center shadow-[inset_0px_3.333px_6.667px_0px_rgba(0,0,0,0.05)] ${tintStyles}`}
      >
        <ShoppingCart className="size-[22px]" strokeWidth={2} />
      </div>
    </div>
  );
}

function RequestCard({ request, paid }) {
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
          <div className="flex items-center justify-between gap-4 text-[14px] font-medium text-[#48505e]">
            <p>Request #{request.id}</p>
            <p className="text-right">Submitted on {request.submitted}</p>
          </div>

          <h3 className="text-[24px] font-bold leading-[1.4] text-[#3a404c]">
            {request.title}
          </h3>

          <span className="h-px w-full bg-[#dadde2]" />

          <div className="flex flex-col gap-2 text-[14px] font-medium text-[#48505e]">
            <p>Type: {request.type}</p>
            <p>{request.specs}</p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-[16px] font-semibold text-black">
              Budget: {request.budget}
            </p>
            {paid && (
              <span className="text-[14px] font-semibold text-[#0f9959]">
                PAYMENT SUCCESSFUL
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteSection({ request, paid, onPay }) {
  return (
    <div className="flex flex-col gap-6">
      <span className="inline-flex w-fit items-center bg-[#f0f1f3] px-2 py-1 text-[20px] font-bold text-[#3a404c]">
        QUOTE RECEIVED {naira(request.quoteAmount)}
      </span>
      <p className="text-[14px] font-medium text-[#48505e]">{request.note}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <button
          type="button"
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-(--primary-color) px-4 text-[14px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-[225px]"
        >
          DOWNLOAD QUOTE
          <Download className="size-5 shrink-0" strokeWidth={2} />
        </button>
        {!paid && (
          <button
            type="button"
            onClick={() => onPay(request)}
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#faf4eb] px-4 text-[14px] font-semibold tracking-[0.28px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2] sm:w-[224px]"
          >
            MAKE PAYMENT
          </button>
        )}
      </div>
    </div>
  );
}

function CustomHair() {
  const [paidIds, setPaidIds] = useState(() => new Set());

  const markPaid = (id) =>
    setPaidIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  const handlePay = async (request) => {
    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    // Without a configured public key we can't open the real checkout, so
    // fall back to marking the request paid to demonstrate the flow.
    if (!key) {
      markPaid(request.id);
      return;
    }

    try {
      const PaystackPop = await loadPaystack();
      const handler = PaystackPop.setup({
        key,
        email: "desmond@zeedara.com",
        amount: request.quoteAmount * 100, // Paystack expects the amount in kobo
        currency: "NGN",
        ref: `${request.id}-${Date.now()}`,
        callback: () => markPaid(request.id),
        onClose: () => {},
      });
      handler.openIframe();
    } catch {
      markPaid(request.id);
    }
  };

  return (
    <div className="flex flex-col gap-8 lg:p-8">
      {/* Header + stats */}
      <div className="flex flex-col gap-[25px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-semibold leading-[1.4] text-black">
              Custom Hair Requests
            </h1>
            <p className="text-[16px] text-[#48505e]">
              View your submitted requests, quotes, and updates.
            </p>
          </div>
          <Link
            to="/account/custom-hair/new"
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[14px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-[231px]"
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
        <h2 className="text-[24px] font-semibold leading-[1.4] text-black">
          Custom Hair Requests
        </h2>
        {REQUESTS.map((request) => {
          const paid = paidIds.has(request.id);
          return (
            <div key={request.id} className="flex flex-col gap-6">
              <RequestCard request={request} paid={paid} />
              <QuoteSection request={request} paid={paid} onPay={handlePay} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomHair;
