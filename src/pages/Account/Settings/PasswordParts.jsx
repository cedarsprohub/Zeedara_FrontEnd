import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";
import { passwordStrength, requirements } from "./passwordRules";

// Shared by Change Password and the in-account Reset Password flow.

// Password field with the show/hide eye toggle, plus any validation messages
// beneath it — italic red, per the error-state design.
export function PasswordField({ id, label, value, onChange, disabled, errors = [] }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex w-full max-w-[421px] flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-medium text-[#667085]">
        {label}
      </label>
      <div
        className={`flex h-[58px] items-center gap-2 border bg-white px-[17px] ${
          errors.length
            ? "border-[#cf251f]"
            : "border-[#dadde2] focus-within:border-(--primary-color)"
        }`}
      >
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-invalid={errors.length > 0}
          autoComplete={
            id === "old-password" ? "current-password" : "new-password"
          }
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-black placeholder:text-[#9fa5b2] focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="shrink-0 cursor-pointer text-[#9fa5b2] transition-colors hover:text-[#667085]"
        >
          {visible ? (
            <Eye className="size-5" strokeWidth={2} />
          ) : (
            <EyeOff className="size-5" strokeWidth={2} />
          )}
        </button>
      </div>
      {errors.map((message) => (
        <p
          key={message}
          className="text-[14px] font-medium italic leading-[1.4] text-[#cf251f]"
        >
          {message}
        </p>
      ))}
    </div>
  );
}

// The strength bar plus the rule checklist, with the strength label on the
// first row, per the design.
export function StrengthMeter({ password }) {
  const { label: strength, color: strengthColor, width: strengthWidth } =
    passwordStrength(password);
  return (
    <>
    {/* Strength meter */}
    <div className="h-3 w-full overflow-hidden rounded-lg bg-[#dadde2]">
      <div
        className="h-full rounded-lg transition-all duration-300"
        style={{
          width: `${strengthWidth}%`,
          backgroundColor: strengthColor,
        }}
      />
    </div>

    {/* Requirements — the strength label sits on the first row */}
    <div className="flex flex-col gap-2">
      {requirements.map((requirement, index) => {
        const met = requirement.test(password);
        const item = (
          <span className="flex items-center gap-2">
            {met ? (
              <CheckCircle2
                className="size-5 shrink-0 text-[#0f9959]"
                strokeWidth={2}
              />
            ) : (
              <XCircle
                className="size-5 shrink-0 text-[#cf251f]"
                strokeWidth={2}
              />
            )}
            <span className="text-[14px] font-medium text-[#575f71]">
              {requirement.label}
            </span>
          </span>
        );

        return index === 0 ? (
          <div
            key={requirement.key}
            className="flex items-center justify-between gap-2"
          >
            {item}
            <span className="text-[14px] font-semibold text-black">
              {strength}
            </span>
          </div>
        ) : (
          <div key={requirement.key}>{item}</div>
        );
      })}
    </div>
    </>
  );
}
