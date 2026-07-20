import { useState } from "react";
import { Star } from "lucide-react";

const ratings = [
  { value: 5, count: 13 },
  { value: 4, count: 11 },
  { value: 3, count: 0 },
  { value: 2, count: 0 },
  { value: 1, count: 0 },
];

function RatingFilter() {
  const [selected, setSelected] = useState(null);

  const toggle = (value) =>
    setSelected((current) => (current === value ? null : value));

  return (
    <div className="flex flex-col gap-3 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-black">
          Average Rating
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

      <div className="flex flex-col gap-2">
        {ratings.map((rating) => (
          <button
            key={rating.value}
            type="button"
            onClick={() => toggle(rating.value)}
            aria-pressed={selected === rating.value}
            className={`flex cursor-pointer items-center justify-between gap-2 text-left transition-colors ${
              selected === rating.value ? "text-(--primary-color)" : ""
            }`}
          >
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={`size-4 ${
                    index < rating.value
                      ? "fill-(--primary-color) text-(--primary-color)"
                      : "fill-transparent text-gray-300"
                  }`}
                />
              ))}
            </span>
            <span className="text-xs text-gray-400">({rating.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RatingFilter;
