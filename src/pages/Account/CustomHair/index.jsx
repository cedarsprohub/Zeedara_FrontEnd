import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import { checkoutRequest, listMyRequests } from "../../../api/customWig";
import { formatAmount } from "../../../utils/formatCurrency";
import MaskIcon from "../../../components/ui/MaskIcon";
import ordersIcon from "../../../assets/account/custom-hair/orders.svg";
import downloadIcon from "../../../assets/account/custom-hair/download.svg";
import noImage from "../../../assets/account/custom-hair/no-image.svg";
import {
  BUDGETS,
  HAIR_PREFERENCES,
  HAS_QUOTE,
  NEW_ROUTE,
  canPay,
  labelFor,
  quoteRoute,
} from "./options";

const STATS = [
  { key: "all", label: "All Requests", tint: "orange" },
  { key: "under_review", label: "Under Review", tint: "orange" },
  { key: "quoted", label: "Quote Received", tint: "orange" },
  { key: "completed", label: "Completed", tint: "blue" },
];

// The chip on the card itself — only for states that settle the request.
const CARD_BADGE = {
  confirmed: { label: "PAYMENT SUCCESSFUL", className: "bg-[#eefeec] text-[#298d1c]" },
  completed: { label: "COMPLETED", className: "bg-[#eefeec] text-[#298d1c]" },
  cancelled: { label: "CANCELLED", className: "bg-[#fae9e9] text-[#cf251f]" },
};

// The block under each card: what's happening and what the customer can do.
function statusCopy(request) {
  switch (request.status) {
    case "submitted":
    case "under_review":
      return {
        title: "UNDER REVIEW",
        body: "We're reviewing your request. Your quote will appear here, and we'll message you on WhatsApp when it's ready.",
      };
    case "quoted":
      return {
        title: `QUOTE RECEIVED ${formatAmount(request.quote_amount_ngn)}`,
        body: request.quote_note || "We have reviewed your request and sent a quote.",
      };
    case "payment_pending":
      return {
        title: `QUOTE RECEIVED ${formatAmount(request.quote_amount_ngn)}`,
        body: "Your payment hasn't been confirmed yet. If you closed the payment page before paying, you can complete it now.",
      };
    case "confirmed":
      return {
        title: `QUOTE RECEIVED ${formatAmount(request.quote_amount_ngn)}`,
        body: "Payment received — we're making your wig and will keep you updated on WhatsApp.",
      };
    case "completed":
      return {
        title: `QUOTE RECEIVED ${formatAmount(request.quote_amount_ngn)}`,
        body: "Your custom wig is complete. Thank you for ordering with Zeedara.",
      };
    case "cancelled":
      return { title: null, body: "This request was cancelled." };
    default:
      return { title: null, body: null };
  }
}

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

// Fallback only for a response from an API deployed before request numbers.
const reference = (request) =>
  request.request_number ?? `CHR-${String(request.id).slice(0, 8).toUpperCase()}`;

const solidButton =
  "flex h-10 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap bg-(--primary-color) px-4 text-[14px] font-semibold leading-[1.4] tracking-[0.28px] text-white transition-colors hover:bg-[#a06e1c] @md:w-[225px]";
const softButton =
  "flex h-10 w-full cursor-pointer items-center justify-center whitespace-nowrap bg-[#faf4eb] px-4 text-[14px] font-semibold leading-[1.4] tracking-[0.28px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2] disabled:cursor-wait disabled:opacity-60 @md:w-[224px]";

function StatCard({ label, value, tint }) {
  return (
    <div className="flex items-start justify-between gap-2 border border-[#dadde2] bg-white p-3 @lg:p-[17px]">
      <div className="flex flex-col gap-4 @lg:gap-6">
        <p className="text-[13px] font-medium leading-[1.4] text-[#48505e] @lg:text-[14px]">
          {label}
        </p>
        <p className="text-[24px] font-semibold leading-[1.4] text-[#262626] @lg:text-[30px]">
          {value}
        </p>
      </div>
      <span
        className={`flex size-10 shrink-0 items-center justify-center shadow-[inset_0px_3.333px_6.667px_0px_rgba(0,0,0,0.05)] ${
          tint === "blue"
            ? "bg-[rgba(43,127,255,0.1)] text-[#2b7fff]"
            : "bg-[rgba(255,105,0,0.1)] text-[#ff6900]"
        }`}
      >
        <MaskIcon src={ordersIcon} width={26} height={26} box={26} />
      </span>
    </div>
  );
}

function RequestCard({ request }) {
  const badge = CARD_BADGE[request.status];
  return (
    // Image above the details on a phone, a narrow column beside them from
    // 384px, and the design's full 210px panel once the card is 576px wide.
    <article className="@container border border-[#dadde2] bg-white p-4 @xl:p-[21px]">
      <div className="flex flex-col gap-5 @sm:flex-row @sm:items-stretch">
        <div className="flex h-[200px] w-full shrink-0 items-center justify-center overflow-hidden bg-[#f0f1f3] @sm:h-auto @sm:min-h-[160px] @sm:w-[140px] @xl:h-[213px] @xl:w-[210px]">
          {request.inspiration_image_url ? (
            <img
              src={request.inspiration_image_url}
              alt="Your inspiration image"
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <img
              src={noImage}
              alt=""
              className="size-[160px] @sm:size-[110px] @xl:size-[167px]"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="flex flex-col gap-1 text-[14px] font-medium leading-[1.4] text-[#48505e] @lg:flex-row @lg:items-center @lg:justify-between @lg:gap-4">
            <p>Request #{reference(request)}</p>
            <p className="@lg:text-right">Submitted on {formatDay(request.created_at)}</p>
          </div>
          <h3 className="text-[20px] font-bold leading-[1.4] text-[#3a404c] @xl:text-[24px]">
            {labelFor(HAIR_PREFERENCES, request.hair_preference)}
          </h3>
          <span className="h-px w-full bg-[#dadde2]" />
          <p className="line-clamp-3 text-[14px] font-medium leading-[1.4] text-[#48505e]">
            {request.notes || "No extra details were added to this request."}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-[16px] font-semibold leading-[1.4] text-black">
              Budget: {labelFor(BUDGETS, request.budget_range)}
            </p>
            {badge && (
              <span
                className={`px-2 py-1 text-[14px] font-semibold leading-[1.4] ${badge.className}`}
              >
                {badge.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function RequestStatus({ request, onPay, paying, payError }) {
  const { title, body } = statusCopy(request);
  const hasQuote = HAS_QUOTE.has(request.status) && request.quote_amount_ngn;
  const payable = canPay(request.status);

  return (
    <div className="@container flex flex-col gap-4 @lg:gap-6">
      {title && (
        <span className="w-fit bg-[#f0f1f3] px-2 py-1 text-[16px] font-bold leading-[1.4] text-[#3a404c] @lg:text-[20px]">
          {title}
        </span>
      )}
      {body && (
        <p className="max-w-[520px] text-[14px] font-medium leading-[1.4] text-[#48505e]">
          {body}
        </p>
      )}
      {(hasQuote || payable) && (
        <div className="flex flex-col gap-3 @md:flex-row @md:items-start @md:justify-between">
          {hasQuote && (
            <Link to={quoteRoute(request.id)} className={solidButton}>
              DOWNLOAD QUOTE
              <MaskIcon
                src={downloadIcon}
                width={15}
                height={14.1668}
                box={20}
                className="text-[#efe0c8]"
              />
            </Link>
          )}
          {payable && (
            <button
              type="button"
              onClick={() => onPay(request.id)}
              disabled={paying}
              className={softButton}
            >
              {paying
                ? "OPENING CHECKOUT…"
                : request.status === "payment_pending"
                  ? "COMPLETE PAYMENT"
                  : "MAKE PAYMENT"}
            </button>
          )}
        </div>
      )}
      {payError && (
        <p role="alert" className="text-[14px] font-medium text-[#cf251f]">
          {payError}
        </p>
      )}
    </div>
  );
}

function CustomHair() {
  const { accessToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // Shown once after the form hands over; the history entry is then cleared so
  // a refresh doesn't announce the same request again.
  const [justSubmitted] = useState(() => location.state?.submitted ?? null);
  useEffect(() => {
    if (location.state?.submitted) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  // Tagged with the token it was loaded for, so "loading" is derived and an
  // account switch can't show the previous account's requests.
  const [loaded, setLoaded] = useState({ token: null, data: null, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [paying, setPaying] = useState(null);
  const [payErrors, setPayErrors] = useState({});

  const isLoading =
    Boolean(accessToken) && (loaded.token !== accessToken || loaded.stale);

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    listMyRequests(accessToken)
      .then((data) => active && setLoaded({ token: accessToken, data, error: null }))
      .catch(
        (err) =>
          active && setLoaded({ token: accessToken, data: null, error: err.message }),
      );
    return () => {
      active = false;
    };
  }, [accessToken, reloadKey]);

  const retry = () => {
    setLoaded((prev) => ({ ...prev, stale: true }));
    setReloadKey((key) => key + 1);
  };

  // Paystack is a full-page redirect; it returns to /payment/callback, which
  // verifies the payment and sends the customer back here.
  const pay = useCallback(
    async (id) => {
      setPaying(id);
      setPayErrors((prev) => ({ ...prev, [id]: null }));
      try {
        const { authorization_url: url } = await checkoutRequest(id, accessToken);
        window.location.assign(url);
      } catch (err) {
        setPayErrors((prev) => ({ ...prev, [id]: err.message }));
        setPaying(null);
      }
    },
    [accessToken],
  );

  const items = isLoading ? [] : (loaded.data?.items ?? []);
  const counts = loaded.data?.counts;

  return (
    <div className="@container flex flex-col gap-8 lg:p-8">
      <div className="flex flex-col gap-[25px]">
        <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-end @2xl:justify-between @2xl:gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-[20px] font-semibold leading-[1.4] text-black lg:text-[24px]">
              Custom Hair Requests
            </h1>
            <p className="text-[14px] leading-[1.4] text-[#48505e] lg:text-[16px]">
              View your submitted requests, quotes, and updates.
            </p>
          </div>
          <Link
            to={NEW_ROUTE}
            className="flex h-10 w-full shrink-0 items-center justify-center bg-(--primary-color) px-4 text-[14px] font-semibold leading-[1.4] tracking-[0.28px] text-white transition-colors hover:bg-[#a06e1c] @2xl:w-[231px]"
          >
            NEW REQUEST
          </Link>
        </div>

        {justSubmitted && (
          <p
            role="status"
            className="bg-[#eefeec] px-4 py-3 text-[14px] font-semibold text-[#298d1c]"
          >
            Request submitted. We&rsquo;ll review it and send you a quote.
          </p>
        )}

        {/* Four across once there's room for them, two by two before. */}
        {(isLoading || counts) && (
          <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4 @3xl:gap-5">
            {STATS.map((stat) =>
              isLoading ? (
                <div key={stat.key} className="skeleton-delayed">
                  <div className="skeleton h-[104px] w-full @lg:h-[120px]" />
                </div>
              ) : (
                <StatCard key={stat.key} {...stat} value={counts[stat.key] ?? 0} />
              ),
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="skeleton-delayed">
          <div className="skeleton h-[255px] w-full" />
        </div>
      ) : loaded.error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-[14px] font-medium text-[#48505e]">
            We couldn&rsquo;t load your requests. {loaded.error}
          </p>
          <button
            type="button"
            onClick={retry}
            className="cursor-pointer text-[14px] font-semibold text-(--primary-color) underline"
          >
            Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col gap-5 border border-[#dadde2] bg-white p-4 @lg:p-[21px]">
          <p className="text-[18px] font-bold leading-[1.4] text-(--primary-color)">
            No custom hair requests yet.
          </p>
          <span className="h-px w-full bg-[#dadde2]" />
          <p className="text-[14px] font-medium leading-[1.4] text-black">
            Do you have a specific look in mind? Submit a request and upload your
            inspiration image.
          </p>
        </div>
      ) : (
        <section className="flex flex-col gap-5">
          <h2 className="text-[20px] font-semibold leading-[1.4] text-black lg:text-[24px]">
            Your Requests
          </h2>
          <div className="flex flex-col gap-10">
            {items.map((request) => (
              <div key={request.id} className="flex flex-col gap-5">
                <RequestCard request={request} />
                <RequestStatus
                  request={request}
                  onPay={pay}
                  paying={paying === request.id}
                  payError={payErrors[request.id]}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default CustomHair;
