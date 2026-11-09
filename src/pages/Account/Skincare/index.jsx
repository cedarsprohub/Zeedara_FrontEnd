import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import {
  checkoutConsultation,
  listMyConsultations,
} from "../../../api/skincare";
import { formatAmount } from "../../../utils/formatCurrency";
import { Glyph } from "./Glyph";
import { CONCERNS, NEW_ROUTE, SKIN_TYPES, labelFor } from "./options";

// Per-status presentation. `tab` decides which list a consultation sits in;
// `avatar` is the round icon on the left, `pill` the status chip on the right.
const AVATARS = {
  pending: { icon: "time", className: "bg-[#faf4eb] text-[#a06e1c]" },
  scheduled: { icon: "calendar", className: "bg-[#e7f5ee] text-[#0b6d3f]" },
  done: { icon: "checkCircle", className: "bg-[#f0f1f3] text-[#48505e]" },
};

const STATUS = {
  pending_payment: {
    tab: "active",
    avatar: AVATARS.pending,
    label: "Awaiting Payment",
    pill: "bg-[#fae9e9] text-[#cf251f]",
    blurb:
      "Your request is saved. Pay the consultation fee to send it to our team for review.",
  },
  pending_review: {
    tab: "active",
    avatar: AVATARS.pending,
    label: "Scheduling in Progress",
    pill: "bg-[#faf4eb] text-(--primary-color)",
    blurb:
      "We are reviewing your request. Your consultation date and time will be sent by email or text message.",
  },
  scheduled: {
    tab: "active",
    avatar: AVATARS.scheduled,
    label: "Consultation Scheduled",
    pill: "bg-[#e7f5ee] text-[#0b6d3f]",
  },
  completed: {
    tab: "completed",
    avatar: AVATARS.done,
    label: "Completed",
    pill: "bg-[#f0f1f3] text-[#48505e]",
    blurb: "Thank you for completing your consultation.",
  },
  cancelled: {
    tab: "completed",
    avatar: AVATARS.done,
    label: "Cancelled",
    pill: "bg-[#fae9e9] text-[#cf251f]",
    blurb: "This consultation was cancelled.",
  },
};

const TABS = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

const primaryButton =
  "flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 bg-(--primary-color) px-3 text-[14px] font-semibold leading-[1.4] tracking-[0.28px] text-white transition-colors hover:bg-[#a06e1c]";

const softButton =
  "flex h-10 shrink-0 items-center justify-center gap-2 bg-[#faf4eb] pl-4 pr-2 text-[14px] font-semibold leading-[1.4] tracking-[0.28px] text-(--primary-color)";

// The API's sequential "SC-1024". The fallback only covers a response from an
// API deployed before consultation numbers existed.
const reference = (consultation) =>
  consultation.consultation_number ??
  `SC-${String(consultation.id).slice(0, 8).toUpperCase()}`;

// Comma-joined rather than "A and B": labels like "Acne and breakouts" already
// contain an "and", and "Acne and breakouts and dark spots" reads badly.
const listFormat = new Intl.ListFormat("en-GB", { type: "unit" });

function topicOf(concerns) {
  const labels = (concerns ?? []).map((value, index) => {
    const label = labelFor(CONCERNS, value);
    return index === 0 ? label : label.toLowerCase();
  });
  return labels.length ? listFormat.format(labels) : "Skincare consultation";
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

function ordinal(day) {
  const tens = day % 100;
  if (tens >= 11 && tens <= 13) return `${day}th`;
  return `${day}${{ 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th"}`;
}

// "2026-06-11" → "11th June 2026 (Wednesday)". Built from the parts rather than
// `new Date(string)`, which would read it as UTC midnight and can land on the
// previous day west of Greenwich.
function formatAppointmentDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  const monthName = date.toLocaleDateString("en-GB", { month: "long" });
  const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
  return `${ordinal(day)} ${monthName} ${year} (${weekday})`;
}

// "11:00:00" → "11:00AM"
function formatAppointmentTime(value) {
  const [hours, minutes] = String(value).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const twelve = hours % 12 || 12;
  return `${twelve}:${String(minutes).padStart(2, "0")}${suffix}`;
}

function InfoRow({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-[14px] font-medium leading-[1.4] text-[#48505e]">
      <Glyph name={icon} size={24} />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

// Which states get the right-most affordance — must agree with CardAction.
function hasCardAction({ status, meeting_link: meetingLink }) {
  return (
    status === "pending_payment" ||
    status === "pending_review" ||
    (status === "scheduled" && Boolean(meetingLink))
  );
}

// The right-most affordance. Only some states have one.
function CardAction({ consultation, onPay, paying }) {
  const { status, meeting_link: meetingLink, fee_ngn: fee } = consultation;

  if (status === "pending_payment") {
    return (
      <button
        type="button"
        onClick={() => onPay(consultation.id)}
        disabled={paying}
        className={`${softButton} cursor-pointer transition-colors hover:bg-[#f3e7d2] disabled:cursor-wait disabled:opacity-60`}
      >
        {paying ? "Opening checkout…" : `Pay ${formatAmount(fee)}`}
        <Glyph name="arrowRight" />
      </button>
    );
  }

  // In the design this state still shows the button; it's informational —
  // there's nothing for the customer to do until the clinic schedules them.
  if (status === "pending_review") {
    return (
      <span className={`${softButton} cursor-default`} aria-disabled="true">
        Scheduling in Progress
        <Glyph name="arrowRight" />
      </span>
    );
  }

  // In-person appointments have no meeting link, so no button.
  if (status === "scheduled" && meetingLink) {
    return (
      <a
        href={meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`${softButton} transition-colors hover:bg-[#f3e7d2]`}
      >
        Link to Appointment
        <Glyph name="arrowRight" />
      </a>
    );
  }

  return null;
}

function ConsultationCard({ consultation, onPay, paying, payError }) {
  const config = STATUS[consultation.status] ?? STATUS.pending_review;
  const paid = Boolean(consultation.paid_at);
  const location =
    consultation.location || (consultation.meeting_link ? "Online" : null);
  const hasAction = hasCardAction(consultation);
  const action = (
    <CardAction consultation={consultation} onPay={onPay} paying={paying} />
  );

  return (
    // Sized by its own width, not the viewport — the account rail takes a
    // different share of the screen at each breakpoint. Three columns when the
    // card is as wide as the design (≥1024px), two from 672px, stacked below.
    <article className="@container border-[0.8px] border-[#dadde2] bg-white">
      <div className="flex flex-col gap-4 p-4 @2xl:flex-row @2xl:items-stretch @2xl:gap-[33px] @2xl:p-5">
        {/* Avatar + request details */}
        <div className="flex min-w-0 flex-1 items-start gap-4 @2xl:items-center @2xl:gap-[33px]">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-full @2xl:size-16 ${config.avatar.className}`}
          >
            <Glyph name={config.avatar.icon} size={22} className="@2xl:hidden" />
            <Glyph name={config.avatar.icon} className="hidden @2xl:flex" />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-3 @5xl:max-w-[381px]">
            <div className="flex flex-col gap-1">
              <p className="text-[14px] font-medium leading-[1.4] text-[#48505e]">
                Consultation{" "}
                <span className="whitespace-nowrap">
                  #{reference(consultation)}
                </span>
              </p>
              <h3 className="text-[18px] font-semibold leading-[1.4] text-black @2xl:text-[20px]">
                {topicOf(consultation.concerns)}
              </h3>
            </div>

            <p className="text-[14px] font-medium leading-[1.4] text-[#48505e]">
              Skin type: {labelFor(SKIN_TYPES, consultation.skin_type)}
            </p>

            {consultation.concern_description && (
              <p className="line-clamp-2 text-[14px] font-medium leading-[1.4] text-black">
                Note: &ldquo;{consultation.concern_description}&rdquo;
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold leading-[1.4] text-black">
                Fee: {formatAmount(consultation.fee_ngn)}
              </p>
              <span
                className={`px-2 py-1 text-[14px] font-semibold leading-[1.4] ${
                  paid
                    ? "bg-[#e7f5ee] text-[#0b6d3f]"
                    : "bg-[#fae9e9] text-[#cf251f]"
                }`}
              >
                {paid ? "Paid" : "Unpaid"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider — horizontal while stacked, vertical beside the details */}
        <span className="h-px w-full shrink-0 bg-[#dadde2] @2xl:h-auto @2xl:w-px" />

        {/* Status + appointment */}
        <div className="flex w-full flex-col justify-between gap-4 @2xl:w-[260px] @2xl:shrink-0 @5xl:w-[324px]">
          <div className="flex flex-col gap-3">
            <span
              className={`flex h-10 w-fit items-center px-4 text-[14px] font-semibold leading-[1.4] tracking-[0.28px] ${config.pill}`}
            >
              {config.label}
            </span>
            {config.blurb && (
              <p className="text-[14px] font-medium leading-[1.4] text-[#48505e]">
                {config.blurb}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {consultation.scheduled_date && (
              <InfoRow icon="calendar">
                {formatAppointmentDate(consultation.scheduled_date)}
              </InfoRow>
            )}
            {consultation.status === "scheduled" &&
              consultation.scheduled_time && (
                <InfoRow icon="time">
                  {formatAppointmentTime(consultation.scheduled_time)}
                </InfoRow>
              )}
            {consultation.status === "scheduled" && location && (
              <InfoRow icon="location">Location: {location}</InfoRow>
            )}
            <InfoRow icon="calendar">
              Submitted {formatDay(consultation.created_at)}
            </InfoRow>
          </div>

          {/* Below three columns the action sits under the status — except the
              informational "Scheduling in Progress", which would only repeat
              the pill right above it. */}
          {hasAction && consultation.status !== "pending_review" && (
            <div className="flex flex-col gap-2 @5xl:hidden [&>*]:w-full @2xl:[&>*]:w-fit">
              {action}
            </div>
          )}
          {payError && (
            <p className="text-[13px] font-medium text-[#cf251f] @5xl:hidden">
              {payError}
            </p>
          )}
        </div>

        {/* Third column at full width, as in the design. */}
        {hasAction && (
          <>
            <span className="hidden w-px shrink-0 bg-[#dadde2] @5xl:block" />
            <div className="hidden w-[225px] shrink-0 flex-col justify-center gap-2 @5xl:flex [&>*]:w-full">
              {action}
              {payError && (
                <p className="text-[13px] font-medium text-[#cf251f]">
                  {payError}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-delayed flex flex-col gap-4 border-[0.8px] border-[#dadde2] p-5 sm:flex-row sm:items-center">
      <div className="skeleton size-12 shrink-0 rounded-full sm:size-16" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="skeleton h-3 w-[140px]" />
        <div className="skeleton h-5 w-[220px]" />
        <div className="skeleton h-3 w-[180px]" />
        <div className="skeleton h-3 w-[120px]" />
      </div>
    </div>
  );
}

function Skincare() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  // Tagged with the token it was loaded for, so "loading" is derived and an
  // account switch can't show the previous account's consultations.
  const [loaded, setLoaded] = useState({ token: null, items: [], error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [paying, setPaying] = useState(null);
  const [payErrors, setPayErrors] = useState({});

  const isLoading =
    Boolean(accessToken) && (loaded.token !== accessToken || loaded.stale);

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    listMyConsultations(accessToken)
      .then((data) => {
        if (!active) return;
        setLoaded({
          token: accessToken,
          items: Array.isArray(data?.items) ? data.items : [],
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;
        setLoaded({ token: accessToken, items: [], error: err.message });
      });
    return () => {
      active = false;
    };
  }, [accessToken, reloadKey]);

  const retry = () => {
    setLoaded((prev) => ({ ...prev, stale: true }));
    setReloadKey((key) => key + 1);
  };

  // Paystack is a full-page redirect; it comes back to /payment/callback, which
  // verifies the reference and returns the customer here.
  const pay = useCallback(
    async (id) => {
      setPaying(id);
      setPayErrors((prev) => ({ ...prev, [id]: null }));
      try {
        const { authorization_url: url } = await checkoutConsultation(
          id,
          accessToken,
        );
        window.location.assign(url);
      } catch (err) {
        setPayErrors((prev) => ({ ...prev, [id]: err.message }));
        setPaying(null);
      }
    },
    [accessToken],
  );

  const items = isLoading ? [] : loaded.items;
  const byTab = {
    active: items.filter(
      (c) => (STATUS[c.status]?.tab ?? "active") === "active",
    ),
    completed: items.filter((c) => STATUS[c.status]?.tab === "completed"),
  };
  const visible = byTab[activeTab];

  return (
    <div className="flex flex-col gap-6 lg:px-8 lg:py-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <div className="flex max-w-[664px] flex-col gap-2">
          <h1 className="text-[20px] font-semibold leading-[1.4] text-black lg:text-[24px]">
            Skincare Consultations
          </h1>
          <p className="text-[14px] leading-[1.4] text-[#48505e] lg:text-[16px]">
            View your consultation requests, appointment updates, and
            recommendations from Zeedara.
          </p>
        </div>
        <Link to={NEW_ROUTE} className={`${primaryButton} w-full md:w-auto`}>
          <Glyph name="plus" />
          START NEW CONSULTATION
        </Link>
      </div>

      {/* Tabs */}
      <div role="tablist" className="flex w-fit border-b border-[#dadde2]">
        {TABS.map(({ key, label }) => {
          const selected = key === activeTab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(key)}
              className={`relative -mb-px cursor-pointer px-4 py-3 text-[14px] font-semibold uppercase leading-[1.4] transition-colors ${
                selected
                  ? "text-(--primary-color) after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-(--primary-color)"
                  : "text-[#667085] hover:text-(--primary-color)"
              }`}
            >
              {label}
              {!isLoading && !loaded.error && ` (${byTab[key].length})`}
            </button>
          );
        })}
      </div>

      {/* Consultations */}
      <div role="tabpanel" className="flex flex-col gap-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : loaded.error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-[14px] font-medium text-[#48505e]">
              We couldn&rsquo;t load your consultations. {loaded.error}
            </p>
            <button
              type="button"
              onClick={retry}
              className="cursor-pointer text-[14px] font-semibold text-(--primary-color) underline"
            >
              Try again
            </button>
          </div>
        ) : visible.length > 0 ? (
          visible.map((consultation) => (
            <ConsultationCard
              key={consultation.id}
              consultation={consultation}
              onPay={pay}
              paying={paying === consultation.id}
              payError={payErrors[consultation.id]}
            />
          ))
        ) : (
          <p className="py-16 text-center text-[14px] font-medium text-[#667085]">
            {activeTab === "active"
              ? "You don’t have any active consultations."
              : "No completed consultations yet."}
          </p>
        )}
      </div>

      {activeTab === "active" && !isLoading && (
        <Link to={NEW_ROUTE} className={`${primaryButton} w-full px-4 sm:w-fit`}>
          START NEW CONSULTATION
        </Link>
      )}
    </div>
  );
}

export default Skincare;
