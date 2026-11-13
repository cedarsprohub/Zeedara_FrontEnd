import { ChevronDown } from "lucide-react";

// Small pieces the admin list pages share (Customers, Orders, …).

// KPI card: label + tinted icon, big value, optional note.
export function StatCard({ label, value, note, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-2 border border-[#f0f1f3] bg-white p-[17px] sm:min-h-[126px] sm:gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-medium leading-[1.4] text-[#667085]">{label}</p>
        <span
          className="flex size-9 shrink-0 items-center justify-center shadow-[inset_0px_3.333px_6.667px_0px_rgba(0,0,0,0.05)]"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
      </div>
      <div className="min-w-0 leading-[1.4]">
        <p className="text-[20px] font-bold leading-[1.25] text-[#262626] sm:text-[24px] sm:leading-[1.4]">{value}</p>
        {note && <p className="text-[12px] font-medium text-[#828a9b]">{note}</p>}
      </div>
    </div>
  );
}

// Dot + label status pill. Pass the colours from a tone ({ bg, border, text }).
export function Pill({ label, bg, border, text }) {
  return (
    <span
      className="inline-flex h-[25px] shrink-0 items-center gap-[5px] whitespace-nowrap rounded-lg border px-[9px] text-[12px] font-semibold leading-[1.4]"
      style={{ backgroundColor: bg, borderColor: border, color: text }}
    >
      <span className="size-1.5 rounded-[3px]" style={{ backgroundColor: text }} />
      {label}
    </span>
  );
}

// The boxed "All countries ⌄" style trigger for a Dropdown.
export function FilterButton({ label, isOpen, toggle, buttonRef, className = "" }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      className={`flex h-10 shrink-0 cursor-pointer items-center justify-between gap-2 border border-[#dadde2] bg-white px-[13px] text-[12px] font-medium text-black transition-colors hover:border-[#9fa5b2] ${className}`}
    >
      <span className="truncate">{label}</span>
      <ChevronDown
        className={`size-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        strokeWidth={1.75}
      />
    </button>
  );
}

// Segment/status tab with a count, as on the Customers and Orders pages.
export function CountTab({ label, count, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex shrink-0 cursor-pointer items-center gap-[7px] rounded-[2px] border px-3 py-1.5 text-[12px] leading-[1.4] transition-colors ${
        isActive
          ? "border-(--primary-color) bg-(--primary-color) text-white shadow-[0px_1px_1px_rgba(16,24,40,0.05)]"
          : "border-[#f0f1f3] bg-white hover:border-[#dadde2]"
      }`}
    >
      <span className={`font-semibold ${isActive ? "" : "text-[#48505e]"}`}>{label}</span>
      <span className={`font-medium ${isActive ? "" : "text-[#667085]"}`}>{count ?? 0}</span>
    </button>
  );
}
