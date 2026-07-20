import { useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

const MIN = 0;
const MAX = 1500000;

function PriceRangeFilter() {
  const [minValue, setMinValue] = useState(MIN);
  const [maxValue, setMaxValue] = useState(MAX);

  const reset = () => {
    setMinValue(MIN);
    setMaxValue(MAX);
  };

  const handleMinChange = (event) => {
    const value = Math.min(Number(event.target.value), maxValue - 1);
    setMinValue(value);
  };

  const handleMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), minValue + 1);
    setMaxValue(value);
  };

  const isDefault = minValue === MIN && maxValue === MAX;

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-black">
          Price Range
        </h3>
        {!isDefault && (
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer text-xs font-medium text-gray-500 underline hover:text-(--primary-color)"
          >
            Reset
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {formatCurrency(maxValue)} is the highest
      </p>

      <div className="relative h-4">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 bg-(--primary-color)"
          style={{
            left: `${(minValue / MAX) * 100}%`,
            right: `${100 - (maxValue / MAX) * 100}%`,
          }}
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={minValue}
          onChange={handleMinChange}
          aria-label="Minimum price"
          className="pointer-events-none absolute inset-x-0 top-0 h-4 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-(--primary-color) [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-(--primary-color)"
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={maxValue}
          onChange={handleMaxChange}
          aria-label="Maximum price"
          className="pointer-events-none absolute inset-x-0 top-0 h-4 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-(--primary-color) [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-(--primary-color)"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-[10px] font-medium uppercase text-gray-500">
            From
          </label>
          <input
            type="number"
            min={MIN}
            max={maxValue - 1}
            value={minValue}
            onChange={handleMinChange}
            className="w-full border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-(--primary-color)"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-[10px] font-medium uppercase text-gray-500">
            To
          </label>
          <input
            type="number"
            min={minValue + 1}
            max={MAX}
            value={maxValue}
            onChange={handleMaxChange}
            className="w-full border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-(--primary-color)"
          />
        </div>
      </div>
    </div>
  );
}

export default PriceRangeFilter;
