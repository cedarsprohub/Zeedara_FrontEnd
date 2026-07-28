import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Clock,
  MapPin,
  Plus,
} from "lucide-react";

// Where "start new consultation" sends the user — the booking block on the
// skincare clinic page.
const BOOKING_ROUTE = "/skincare-clinic#book";

// Visual + copy config per consultation state. `action` is the affordance in
// the right-hand status column; completed consultations don't get one.
const STATUS = {
  pending: {
    label: "Scheduling in Progress",
    icon: Clock,
    tint: "bg-[#faf4eb] text-(--primary-color)",
    pill: "bg-[#faf4eb] text-(--primary-color)",
    blurb:
      "We are reviewing your request. Your consultation date and time will be sent by email or text message.",
    action: "Scheduling in Progress",
  },
  scheduled: {
    label: "Consultation Scheduled",
    icon: CalendarDays,
    tint: "bg-[#e7f5ee] text-[#0b6d3f]",
    pill: "bg-[#e7f5ee] text-[#0b6d3f]",
    action: "Link to Appointment",
  },
  completed: {
    label: "Completed",
    icon: CircleCheck,
    tint: "bg-[#f0f1f3] text-[#48505e]",
    pill: "bg-[#f0f1f3] text-[#48505e]",
    blurb: "Thank you for completing your consultation.",
  },
};

const CONSULTATIONS = [
  {
    id: "SC-1024",
    topic: "Acne and dark spots",
    skinType: "Oily",
    type: "Online",
    note: "I have been experiencing frequent breakouts and uneven skin tone…",
    fee: "10,000",
    paid: true,
    submitted: "12 June 2026",
    status: "pending",
  },
  {
    id: "SC-1024",
    topic: "Acne and dark spots",
    skinType: "Oily",
    type: "Online",
    note: "I have been experiencing frequent breakouts and uneven skin tone…",
    fee: "10,000",
    paid: true,
    submitted: "12 June 2026",
    date: "11th June 2026 (Wednesday)",
    time: "11:00AM",
    location: "Online",
    status: "scheduled",
  },
  {
    id: "SC-1024",
    topic: "Dryness and uneven skin tone",
    skinType: "Oily",
    type: "Online",
    note: "I have been experiencing frequent breakouts and uneven skin tone…",
    fee: "10,000",
    paid: true,
    submitted: "12 June 2026",
    date: "11th June 2026 (Wednesday)",
    status: "completed",
  },
  {
    id: "SC-1024",
    topic: "Dryness and uneven skin tone",
    skinType: "Oily",
    type: "Online",
    note: "I have been experiencing frequent breakouts and uneven skin tone…",
    fee: "10,000",
    paid: true,
    submitted: "12 June 2026",
    date: "11th June 2026 (Wednesday)",
    status: "completed",
  },
  {
    id: "SC-1024",
    topic: "Dryness and uneven skin tone",
    skinType: "Oily",
    type: "Online",
    note: "I have been experiencing frequent breakouts and uneven skin tone…",
    fee: "10,000",
    paid: true,
    submitted: "12 June 2026",
    date: "11th June 2026 (Wednesday)",
    status: "completed",
  },
];

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-[#667085]" strokeWidth={2} />
      <span>{children}</span>
    </div>
  );
}

function ConsultationCard({ consultation }) {
  const config = STATUS[consultation.status];
  const Icon = config.icon;

  return (
    // Details left / status right — stacked on phones, and stacked again at
    // `lg`, where the 300px account rail leaves the card too narrow for two
    // columns. Side by side at sm–lg (no rail yet) and from xl up.
    <div className="flex flex-col gap-4 border border-[#dadde2] bg-white p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5 lg:flex-col lg:gap-4 xl:flex-row xl:gap-5">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.tint}`}
      >
        <Icon className="size-5" strokeWidth={2} />
      </div>

      {/* Request details */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium text-[#48505e]">
            Consultation #{consultation.id}
          </p>
          <h3 className="text-[14px] font-semibold leading-[1.4] text-black">
            {consultation.topic}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-[#48505e]">
          <span>Skin type: {consultation.skinType}</span>
          <span className="hidden size-1 shrink-0 rounded-full bg-black sm:block" />
          <span>Consultation type: {consultation.type}</span>
        </div>

        <p className="text-[13px] font-medium leading-[1.4] text-black">
          Note: &ldquo;{consultation.note}&rdquo;
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[14px] font-semibold text-black">
            Fee: &#8358;{consultation.fee}
          </p>
          {consultation.paid && (
            <span className="bg-[#e7f5ee] px-2 py-1 text-[12px] font-semibold leading-none text-[#0b6d3f]">
              Paid
            </span>
          )}
        </div>
      </div>

      {/* Divider — horizontal while stacked, vertical while side by side */}
      <span className="h-px w-full shrink-0 bg-[#dadde2] sm:h-auto sm:w-px lg:h-px lg:w-full xl:h-auto xl:w-px" />

      {/* Status + appointment details */}
      <div className="flex w-full shrink-0 flex-col gap-3 sm:w-[220px] lg:w-full xl:w-[240px]">
        <span
          className={`inline-flex h-8 w-fit items-center px-3 text-[13px] font-semibold ${config.pill}`}
        >
          {config.label}
        </span>

        {config.blurb && (
          <p className="text-[13px] font-medium leading-[1.4] text-[#48505e]">
            {config.blurb}
          </p>
        )}

        <div className="flex flex-col gap-1.5 text-[13px] font-medium text-[#48505e]">
          {consultation.date && (
            <InfoRow icon={Calendar}>{consultation.date}</InfoRow>
          )}
          {consultation.time && (
            <InfoRow icon={Clock}>{consultation.time}</InfoRow>
          )}
          {consultation.location && (
            <InfoRow icon={MapPin}>Location: {consultation.location}</InfoRow>
          )}
          <InfoRow icon={Calendar}>Submitted {consultation.submitted}</InfoRow>
        </div>

        {config.action && (
          <button
            type="button"
            className="mt-1 flex h-9 w-full cursor-pointer items-center justify-center gap-2 bg-[#faf4eb] px-4 text-[13px] font-semibold tracking-[0.28px] text-(--primary-color) transition-colors hover:bg-[#f3e7d2] lg:w-[240px] xl:w-full"
          >
            {config.action}
            <ChevronRight className="size-4 shrink-0" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

function Skincare() {
  const [activeTab, setActiveTab] = useState("active");

  const { active, completed } = useMemo(
    () => ({
      active: CONSULTATIONS.filter((c) => c.status !== "completed"),
      completed: CONSULTATIONS.filter((c) => c.status === "completed"),
    }),
    [],
  );

  const tabs = [
    { key: "active", label: `ACTIVE (${active.length})` },
    { key: "completed", label: `COMPLETED (${completed.length})` },
  ];
  const visible = activeTab === "active" ? active : completed;

  return (
    <div className="flex flex-col gap-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-[16px] font-semibold leading-[1.4] text-black">
            Skincare Consultations
          </h1>
          <p className="text-[13px] text-[#48505e]">
            View your consultation requests, appointment updates, and
            recommendations from Zeedara.
          </p>
        </div>
        <Link
          to={BOOKING_ROUTE}
          className="flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-2 bg-(--primary-color) px-4 text-[13px] font-semibold tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-auto"
        >
          <Plus className="size-4 shrink-0" strokeWidth={2.5} />
          START NEW CONSULTATION
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#dadde2]">
        {tabs.map(({ key, label }) => {
          const isActive = key === activeTab;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`relative -mb-px shrink-0 cursor-pointer px-3 py-3 text-[13px] font-semibold uppercase tracking-[0.28px] transition-colors sm:px-4 ${
                isActive
                  ? "text-(--primary-color) after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-(--primary-color)"
                  : "text-[#667085] hover:text-(--primary-color)"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Consultations */}
      <div className="flex flex-col gap-4">
        {visible.length > 0 ? (
          visible.map((consultation, i) => (
            <ConsultationCard
              key={`${consultation.id}-${i}`}
              consultation={consultation}
            />
          ))
        ) : (
          <p className="py-16 text-center text-[13px] font-medium text-[#667085]">
            No {activeTab} consultations yet.
          </p>
        )}
      </div>

      {activeTab === "active" && (
        <Link
          to={BOOKING_ROUTE}
          className="flex h-10 w-full cursor-pointer items-center justify-center bg-(--primary-color) px-4 text-[13px] font-semibold uppercase tracking-[0.28px] text-white transition-opacity hover:opacity-90 sm:w-[231px]"
        >
          Start New Consultation
        </Link>
      )}
    </div>
  );
}

export default Skincare;
