import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import { getMyRequest } from "../../../api/customWig";
import { formatAmount } from "../../../utils/formatCurrency";
import Seo from "../../../components/shared/Seo";
import logo from "../../../assets/navbar/zeedara_logo.png";
import {
  BUDGETS,
  HAIR_PREFERENCES,
  HAS_QUOTE,
  LIST_ROUTE,
  labelFor,
} from "./options";

// Business details as printed in the site footer.
const BUSINESS = {
  address:
    "Omma Mall Ground floor, Moore Jackson street, Bonny Island, Rivers state, Nigeria.",
  phone: "+234(0) 901 234 5643",
  email: "email@zeedara.com",
};

function formatDay(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

/**
 * The quote for a custom wig request as a printable document — "Download quote"
 * opens it, and Download PDF hands it to the browser's Save as PDF. Rendered
 * outside the site layout so the PDF is just the quote, on a white A4-ish page.
 */
function QuoteDocument() {
  const { requestId } = useParams();
  const { accessToken } = useAuth();
  const [loaded, setLoaded] = useState({ id: null, request: null, error: null });

  const isLoading = loaded.id !== requestId;
  const { request, error } = isLoading ? { request: null, error: null } : loaded;

  useEffect(() => {
    let active = true;
    getMyRequest(requestId, accessToken)
      .then((data) => active && setLoaded({ id: requestId, request: data, error: null }))
      .catch(
        (err) => active && setLoaded({ id: requestId, request: null, error: err.message }),
      );
    return () => {
      active = false;
    };
  }, [requestId, accessToken]);

  const hasQuote = request && HAS_QUOTE.has(request.status) && request.quote_amount_ngn;
  const number = request?.request_number;

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-6 print:bg-white print:p-0 sm:py-10">
      <Seo title={number ? `Quote ${number}` : "Quote"} noindex />

      {/* Screen-only toolbar */}
      <div className="mx-auto mb-4 flex max-w-[794px] flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to={LIST_ROUTE}
          className="text-[14px] font-semibold text-(--primary-color) underline"
        >
          Back to my requests
        </Link>
        {hasQuote && (
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-10 cursor-pointer items-center justify-center bg-(--primary-color) px-5 text-[14px] font-semibold tracking-[0.28px] text-white transition-colors hover:bg-[#a06e1c]"
          >
            DOWNLOAD PDF
          </button>
        )}
      </div>

      <article className="mx-auto flex max-w-[794px] flex-col gap-8 bg-white p-6 shadow-sm print:max-w-none print:shadow-none sm:p-12">
        {isLoading ? (
          <div className="skeleton-delayed flex flex-col gap-4">
            <div className="skeleton h-8 w-[160px]" />
            <div className="skeleton h-4 w-[240px]" />
            <div className="skeleton h-[200px] w-full" />
          </div>
        ) : error || !request ? (
          <p className="py-12 text-center text-[14px] font-medium text-[#48505e]">
            {error || "We couldn't find that request on your account."}
          </p>
        ) : !hasQuote ? (
          <p className="py-12 text-center text-[14px] font-medium text-[#48505e]">
            There&rsquo;s no quote for request {number} yet. We&rsquo;ll let you
            know as soon as it&rsquo;s ready.
          </p>
        ) : (
          <>
            <header className="flex flex-col gap-6 border-b border-[#dadde2] pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-3">
                <img src={logo} alt="Zeedara" className="h-7 w-auto self-start" />
                <p className="max-w-[300px] text-[12px] leading-[1.5] text-[#667085]">
                  {BUSINESS.address}
                  <br />
                  {BUSINESS.phone} · {BUSINESS.email}
                </p>
              </div>
              <div className="flex flex-col gap-1 sm:text-right">
                <h1 className="text-[24px] font-bold leading-[1.4] text-[#3a404c]">
                  QUOTE
                </h1>
                <p className="text-[14px] font-medium text-[#48505e]">
                  Request #{number}
                </p>
                <p className="text-[14px] font-medium text-[#48505e]">
                  Requested on {formatDay(request.created_at)}
                </p>
              </div>
            </header>

            <section className="flex flex-col gap-1">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9fa5b2]">
                Prepared for
              </h2>
              <p className="text-[14px] font-semibold text-black">{request.full_name}</p>
              <p className="text-[14px] font-medium text-[#48505e]">
                WhatsApp: {request.whatsapp_number}
              </p>
            </section>

            <section className="flex flex-col">
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#dadde2] pb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9fa5b2]">
                <span>Description</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#dadde2] py-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-[16px] font-semibold text-black">
                    Custom {labelFor(HAIR_PREFERENCES, request.hair_preference)}
                  </p>
                  <p className="text-[14px] font-medium text-[#48505e]">
                    Your budget: {labelFor(BUDGETS, request.budget_range)}
                  </p>
                  {request.notes && (
                    <p className="whitespace-pre-line text-[14px] font-medium text-[#48505e]">
                      Your notes: {request.notes}
                    </p>
                  )}
                </div>
                <p className="text-right text-[16px] font-semibold text-black">
                  {formatAmount(request.quote_amount_ngn)}
                </p>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-4 py-4">
                <p className="text-[16px] font-bold text-black">Total</p>
                <p className="text-right text-[20px] font-bold text-black">
                  {formatAmount(request.quote_amount_ngn)}
                </p>
              </div>
            </section>

            {request.quote_note && (
              <section className="flex flex-col gap-1 bg-[#faf4eb] p-4">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#865c18]">
                  Note from Zeedara
                </h2>
                <p className="whitespace-pre-line text-[14px] font-medium text-[#48505e]">
                  {request.quote_note}
                </p>
              </section>
            )}

            <footer className="flex flex-col gap-1 border-t border-[#dadde2] pt-6 text-[13px] font-medium text-[#667085]">
              <p>
                Status:{" "}
                <span className="font-semibold text-black">
                  {request.paid_at
                    ? `Paid on ${formatDay(request.paid_at)}`
                    : "Awaiting payment"}
                </span>
              </p>
              {!request.paid_at && (
                <p>
                  Pay securely from your Zeedara account under Custom Hair
                  Requests.
                </p>
              )}
            </footer>
          </>
        )}
      </article>
    </div>
  );
}

export default QuoteDocument;
