const STEPS = [
  { number: 1, label: "Details & role" },
  { number: 2, label: "Permissions" },
  { number: 3, label: "Review & send" },
];

function Stepper({ current }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-[22px] shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                step.number <= current
                  ? "border-(--primary-color) bg-(--primary-color) text-white"
                  : "border-[#e5e7eb] bg-white text-[#667085]"
              }`}
            >
              {step.number}
            </span>
            <span
              className={`text-[12px] whitespace-nowrap ${
                step.number === current
                  ? "font-semibold text-[#101828]"
                  : "font-medium text-[#667085]"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <span className="h-px w-12 shrink-0 bg-[#e5e7eb]" />
          )}
        </div>
      ))}
    </div>
  );
}

export default Stepper;
