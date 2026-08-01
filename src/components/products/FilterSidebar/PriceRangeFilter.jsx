import { useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

// Used until the catalog's real ceiling arrives, and as the fallback if it
// can't be derived.
const FALLBACK_MAX = 100000;

/**
 * Writes `min_price` / `max_price`. The committed value is the URL's, so the
 * sliders are only local while being dragged — `onCommit` fires on release,
 * not on every intermediate value, to avoid a request per pixel.
 *
 * A bound equal to its end of the track means "unset", and is committed as
 * `null` so the parameter drops out of the query entirely.
 */
function PriceRangeFilter({ min, max, ceiling, onCommit }) {
  const limit = ceiling ?? FALLBACK_MAX;
  const step = Math.max(1, Math.round(limit / 100));

  const committed = {
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : limit,
  };

  const [draft, setDraft] = useState(committed);
  const [seen, setSeen] = useState(committed);

  // The URL is the source of truth: adopt it whenever it changes underneath us
  // (a "clear all", the back button, or the ceiling arriving from the API).
  // Adjusted during render rather than in an effect, so the sliders never paint
  // one frame at the stale position.
  if (seen.min !== committed.min || seen.max !== committed.max) {
    setSeen(committed);
    setDraft(committed);
  }

  const commit = (next) =>
    onCommit({
      min: next.min > 0 ? next.min : null,
      max: next.max < limit ? next.max : null,
    });

  const handleMinChange = (event) =>
    setDraft((current) => ({
      ...current,
      min: Math.min(Number(event.target.value), current.max - step),
    }));

  const handleMaxChange = (event) =>
    setDraft((current) => ({
      ...current,
      max: Math.max(Number(event.target.value), current.min + step),
    }));

  const isDefault = draft.min === 0 && draft.max === limit;

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-black">
          Price Range
        </h3>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onCommit({ min: null, max: null })}
            className="cursor-pointer text-xs font-medium text-gray-500 underline hover:text-(--primary-color)"
          >
            Reset
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {formatCurrency(draft.min)} &ndash; {formatCurrency(draft.max)}
      </p>

      <div className="relative h-4">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 bg-(--primary-color)"
          style={{
            left: `${(draft.min / limit) * 100}%`,
            right: `${100 - (draft.max / limit) * 100}%`,
          }}
        />
        <input
          type="range"
          min={0}
          max={limit}
          step={step}
          value={draft.min}
          onChange={handleMinChange}
          onPointerUp={() => commit(draft)}
          onKeyUp={() => commit(draft)}
          aria-label="Minimum price"
          className="pointer-events-none absolute inset-x-0 top-0 h-4 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-(--primary-color) [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-(--primary-color)"
        />
        <input
          type="range"
          min={0}
          max={limit}
          step={step}
          value={draft.max}
          onChange={handleMaxChange}
          onPointerUp={() => commit(draft)}
          onKeyUp={() => commit(draft)}
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
            min={0}
            max={draft.max - 1}
            value={draft.min}
            onChange={handleMinChange}
            onBlur={() => commit(draft)}
            className="w-full border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-(--primary-color)"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-[10px] font-medium uppercase text-gray-500">
            To
          </label>
          <input
            type="number"
            min={draft.min + 1}
            max={limit}
            value={draft.max}
            onChange={handleMaxChange}
            onBlur={() => commit(draft)}
            className="w-full border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-(--primary-color)"
          />
        </div>
      </div>
    </div>
  );
}

export default PriceRangeFilter;
