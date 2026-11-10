import { useRef } from "react";
import MaskIcon from "../ui/MaskIcon";
import checkIcon from "../../assets/account/skincare/check.svg";
import arrowDownIcon from "../../assets/account/skincare/arrow-down.svg";
import { boxCls } from "./formStyles";

// Controls shared by the account request forms (skincare consultation, custom
// wig). Styling follows the design's form components.

export function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="text-[13px] font-medium text-[#cf251f]">
      {children}
    </p>
  );
}

export function Chip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`cursor-pointer border px-[17px] py-[9px] text-[14px] font-semibold leading-[1.4] transition-colors ${
        selected
          ? "border-(--primary-color) bg-[#faf4eb] text-(--primary-color)"
          : "border-[#575f71] text-[#575f71] hover:border-(--primary-color) hover:text-(--primary-color)"
      }`}
    >
      {children}
    </button>
  );
}

// Native <select> styled as the design's dropdown, with its chevron.
export function SelectBox({ value, onChange, options, placeholder = "Select", ...rest }) {
  return (
    <span className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${boxCls} cursor-pointer appearance-none pr-12 ${
          value ? "text-black" : "text-[#9fa5b2]"
        }`}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(([key, label]) => (
          <option key={key} value={key} className="text-black">
            {label}
          </option>
        ))}
      </select>
      <MaskIcon
        src={arrowDownIcon}
        width={13.5001}
        height={7.50005}
        box={24}
        className="pointer-events-none absolute right-[17px] top-1/2 -translate-y-1/2 text-black"
      />
    </span>
  );
}

// The design's checkbox: a gold rounded square with a white tick.
export function ConsentCheckbox({ checked, onChange, children, ...rest }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 flex size-5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 cursor-pointer appearance-none rounded-[6px] border border-[#9fa5b2] bg-white checked:border-[#faf4eb] checked:bg-(--primary-color) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-color) aria-invalid:border-[#cf251f]"
          {...rest}
        />
        <MaskIcon
          src={checkIcon}
          width={14}
          height={14}
          box={20}
          className="pointer-events-none relative hidden text-white peer-checked:flex"
        />
      </span>
      <span className="text-[14px] font-medium leading-[1.4] text-[#48505e]">
        {children}
      </span>
    </label>
  );
}

// "Choose file / No file chosen", as designed, over a visually hidden input
// so the label stays fully stylable and keyboard-reachable.
export function FilePicker({ id, accept, file, onChoose, onRemove, invalid, describedBy }) {
  const input = useRef(null);
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-[11px] px-1">
      <input
        ref={input}
        id={id}
        type="file"
        accept={accept}
        onChange={(event) => onChoose(event.target.files?.[0] ?? null)}
        className="sr-only"
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
      <label
        htmlFor={id}
        className="cursor-pointer border border-[#48505e] bg-white px-[17px] py-[9px] text-[14px] font-semibold leading-[1.4] text-[#48505e] shadow-[0_0_2px_4px_#f2f4f7] transition-colors hover:border-(--primary-color) hover:text-(--primary-color)"
      >
        Choose file
      </label>
      <span className="min-w-0 truncate text-[14px] font-semibold leading-[1.4] text-[#48505e]">
        {file ? file.name : "No file chosen"}
      </span>
      {file && (
        <button
          type="button"
          onClick={() => {
            if (input.current) input.current.value = "";
            onRemove();
          }}
          className="cursor-pointer text-[13px] font-semibold text-(--primary-color) underline"
        >
          Remove
        </button>
      )}
    </div>
  );
}
