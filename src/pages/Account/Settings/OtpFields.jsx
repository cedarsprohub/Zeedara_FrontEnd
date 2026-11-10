import { useRef } from "react";

export const CODE_LENGTH = 6;

// Six digit boxes with the dash after the third, matching the design and the
// existing confirm-email screen's keyboard behaviour.
export default function OtpFields({ code, setCode, disabled }) {
  const inputsRef = useRef([]);

  const focusInput = (index) => inputsRef.current[index]?.focus();

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < CODE_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH)
      .split("");
    if (!digits.length) return;
    setCode((prev) => {
      const next = [...prev];
      digits.forEach((digit, i) => (next[i] = digit));
      return next;
    });
    focusInput(Math.min(digits.length, CODE_LENGTH - 1));
  };

  return (
    <div className="flex w-full max-w-[421px] items-center gap-3">
      {code.map((digit, index) => (
        <div key={index} className="contents">
          <input
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            aria-label={`Digit ${index + 1}`}
            className="h-[52px] min-w-0 flex-1 border-[0.8px] border-[#bdc2cb] text-center text-[16px] font-semibold text-black focus:border-(--primary-color) focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f7f8fa]"
          />
          {index === 2 && (
            <span className="h-px w-3 shrink-0 bg-[#828a9b]" />
          )}
        </div>
      ))}
    </div>
  );
}
