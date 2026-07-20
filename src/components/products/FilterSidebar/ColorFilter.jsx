import { useState } from "react";

const colors = [
  "#bf8322",
  "#ffffff",
  "#000000",
  "#8b5e3c",
  "#22c55e",
  "#ec4899",
  "#a855f7",
  "#06b6d4",
  "#84cc16",
  "#ef4444",
  "#3b82f6",
  "#6b7280",
  "#fbcfe8",
  "#78350f",
];

function ColorFilter() {
  const [selected, setSelected] = useState(null);

  const toggle = (color) =>
    setSelected((current) => (current === color ? null : color));

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-black">
          Color
        </h3>
        {selected && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="cursor-pointer text-xs font-medium text-gray-500 underline hover:text-(--primary-color)"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => toggle(color)}
            aria-label={`Filter by color ${color}`}
            aria-pressed={selected === color}
            className={`size-6 cursor-pointer rounded-full border border-gray-300 transition-shadow ${
              selected === color
                ? "ring-2 ring-(--primary-color) ring-offset-2"
                : ""
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

export default ColorFilter;
