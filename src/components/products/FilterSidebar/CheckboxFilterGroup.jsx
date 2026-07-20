import { useState } from "react";
import { Check } from "lucide-react";

function CheckboxFilterGroup({ title, options }) {
  const [checked, setChecked] = useState([]);

  const toggle = (label) => {
    setChecked((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  };

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-black">
          {title}
        </h3>
        {checked.length > 0 && (
          <button
            type="button"
            onClick={() => setChecked([])}
            className="cursor-pointer text-xs font-medium text-gray-500 underline hover:text-(--primary-color)"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {options.map((option) => {
          const isChecked = checked.includes(option.label);
          return (
            <label
              key={option.label}
              className="flex cursor-pointer items-center justify-between gap-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="relative inline-flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(option.label)}
                    className="peer absolute h-4 w-4 cursor-pointer opacity-0"
                  />
                  <span className="flex h-4 w-4 items-center justify-center border border-gray-300 bg-white peer-checked:border-(--primary-color) peer-checked:bg-(--primary-color)">
                    {isChecked && <Check className="size-3 text-white" />}
                  </span>
                </span>
                <span className="text-gray-700">{option.label}</span>
              </span>
              <span className="text-xs text-gray-400">({option.count})</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default CheckboxFilterGroup;
