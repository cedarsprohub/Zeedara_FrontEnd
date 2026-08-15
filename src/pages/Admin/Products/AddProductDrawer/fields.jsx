import { ChevronDown } from "lucide-react";

// Form and layout primitives shared by the add-product tabs. Every one of them
// is a straight read of the Figma field component, so the tabs themselves stay
// about their own content rather than repeating border and spacing values.

const CONTROL_CLASS =
  "w-full border border-[#dadde2] bg-white px-[17px] py-[13px] text-[14px] font-medium text-black transition-colors placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none";

// Label, required marker and helper text. The asterisk is Anton, as the design
// has it — the same face the storefront headings use.
export function Field({ label, required, hint, error, htmlFor, children }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <div className="flex w-full flex-col gap-2">
        <label
          htmlFor={htmlFor}
          className="flex items-start gap-2 text-[12px] font-semibold text-[#48505e]"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="font-['Anton'] text-[#cf251f]">
              *
            </span>
          )}
        </label>
        {children}
      </div>
      {/* An error takes the hint's place rather than stacking under it — the
          hint explains the field, and once it's wrong that's the less useful
          of the two. */}
      {error ? (
        <p className="text-[12px] font-medium text-[#cf251f]">{error}</p>
      ) : (
        hint && <p className="text-[12px] font-medium text-[#9fa5b2]">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({ id, invalid, ...props }) {
  return (
    <input
      id={id}
      type="text"
      aria-invalid={invalid || undefined}
      className={`${CONTROL_CLASS} ${
        invalid ? "border-[#cf251f]" : ""
      } disabled:bg-[#f0f1f3] disabled:text-[#9fa5b2]`}
      {...props}
    />
  );
}

export function TextArea({ id, invalid, rows = 6, ...props }) {
  return (
    <textarea
      id={id}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={`${CONTROL_CLASS} resize-y ${invalid ? "border-[#cf251f]" : ""}`}
      {...props}
    />
  );
}

// The chevron is drawn over a native select rather than replacing it, so the
// options list stays the platform's own.
export function SelectInput({ id, invalid, placeholder, options, ...props }) {
  return (
    <div className="relative w-full">
      <select
        id={id}
        aria-invalid={invalid || undefined}
        className={`${CONTROL_CLASS} cursor-pointer appearance-none pr-11 ${
          invalid ? "border-[#cf251f]" : ""
        } ${props.value ? "" : "text-[#9fa5b2]"}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => {
          // Plain strings (hair origin, weight band, …) use the same value
          // for both; a real id/name pair (category, now that it's backed
          // by the real catalogue) passes {value, label} instead.
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value} className="text-black">
              {label}
            </option>
          );
        })}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-4 size-[19px] -translate-y-1/2 text-[#48505e]"
        strokeWidth={2}
        aria-hidden="true"
      />
    </div>
  );
}

// A money field: the currency sits in its own bordered cell to the left of the
// input rather than inside it, which is how the pricing tab draws it.
export function CurrencyInput({ id, ...props }) {
  return (
    <div className="flex w-full min-w-0">
      <span
        aria-hidden="true"
        className="flex w-[46px] shrink-0 items-center justify-center border border-r-0 border-[#dadde2] bg-white text-[14px] font-medium text-[#9fa5b2]"
      >
        ₦
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        className="min-w-0 flex-1 border border-[#dadde2] bg-white px-[17px] py-[13px] text-[14px] font-medium text-black transition-colors placeholder:text-[#9fa5b2] focus:border-(--primary-color) focus:outline-none"
        {...props}
      />
    </div>
  );
}

export function Toggle({ id, checked, onChange, label }) {
  return (
    <label
      htmlFor={id}
      className="relative flex cursor-pointer items-center gap-3 text-[14px] font-medium text-[#48505e]"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      {/* Track and knob are both direct siblings of the checkbox, not the knob
          nested inside the track — a peer-* variant only matches a sibling of
          .peer, never a sibling's descendant, so nesting it there meant the
          knob's peer-checked:translate-x-5 never actually matched anything
          and it sat frozen while only the track's colour animated. */}
      <span className="h-6 w-11 shrink-0 rounded-full bg-[#dadde2] transition-colors peer-checked:bg-(--primary-color) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--primary-color)" />
      <span className="pointer-events-none absolute top-1 left-1 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      {label}
    </label>
  );
}

// Bordered section used for every panel inside the tabs. `title` renders the
// header strip; without one the card is just the frame.
export function Card({ title, action, children }) {
  return (
    <div className="w-full border border-[#f0f1f3] bg-white">
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f1f3] px-5 py-4">
          {title && (
            <p className="text-[14px] font-semibold text-black">{title}</p>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Advisory strip. `tone` picks the palette: the amber one carries guidance, the
// blue one plain information.
export function InfoBanner({ tone = "amber", icon: Icon, title, children }) {
  const palette =
    tone === "amber"
      ? { bg: "#fffaf2", border: "#f6e5c7", text: "#a06e1c" }
      : { bg: "#f5faff", border: "#d1e9ff", text: "#1570ef" };

  return (
    <div
      className="flex w-full items-start gap-3 rounded-[4px] border-[0.667px] px-[15px] py-3"
      style={{ backgroundColor: palette.bg, borderColor: palette.border }}
    >
      <Icon
        className="mt-px size-[18px] shrink-0"
        strokeWidth={2}
        style={{ color: palette.text }}
        aria-hidden="true"
      />
      <div
        className="flex min-w-0 flex-1 flex-col text-[12px]"
        style={{ color: palette.text }}
      >
        <p className="pb-0.5 font-bold">{title}</p>
        <p className="font-medium">{children}</p>
      </div>
    </div>
  );
}

// Read-only figure. Used for both the derived pricing numbers and the insights
// totals, which differ only in whether an icon badge sits alongside.
export function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 border border-[#f0f1f3] bg-white px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium text-[#828a9b]">{label}</p>
        {Icon && (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-[4px]"
            style={{ backgroundColor: iconBg }}
          >
            <Icon
              className="size-[18px]"
              strokeWidth={2}
              style={{ color: iconColor }}
              aria-hidden="true"
            />
          </span>
        )}
      </div>
      <p className="text-[22px] font-bold text-black">{value}</p>
    </div>
  );
}
