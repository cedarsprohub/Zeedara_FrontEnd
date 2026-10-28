import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Up to this many slots (numbers + ellipses) render at once. Odd, so the
// current page can sit in the middle with an equal run either side.
const MAX_SLOTS = 7;

// The page numbers to show, with "…" standing in for each skipped run. First
// and last are always present so you can jump to either end; the rest is a
// window around the current page. The slot count stays fixed (once there are
// more pages than slots), so the control doesn't jump in width as you page.
//   page 1 of 20  → 1 2 3 4 5 … 20
//   page 10 of 20 → 1 … 9 10 11 … 20
//   page 20 of 20 → 1 … 16 17 18 19 20
function pageItems(page, pageCount) {
  if (pageCount <= MAX_SLOTS) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  // Slots left for the middle window once first, last and both ellipses are
  // placed.
  const windowSize = MAX_SLOTS - 4;
  const half = Math.floor(windowSize / 2);

  // Near either end, one ellipsis is dropped and its slot goes to the window.
  if (page <= half + 3) {
    const head = Array.from({ length: MAX_SLOTS - 2 }, (_, index) => index + 1);
    return [...head, "end-gap", pageCount];
  }
  if (page >= pageCount - half - 2) {
    const tail = Array.from(
      { length: MAX_SLOTS - 2 },
      (_, index) => pageCount - (MAX_SLOTS - 3) + index,
    );
    return [1, "start-gap", ...tail];
  }

  const middle = Array.from(
    { length: windowSize },
    (_, index) => page - half + index,
  );
  return [1, "start-gap", ...middle, "end-gap", pageCount];
}

// Jumia-style: every control is the same round button, the current page a
// filled circle, and the first/previous/next/last arrows flank the numbers.
// `display` is left out of the shared shape so a caller can pass its own
// (e.g. "hidden sm:flex") without two display utilities competing.
const circleShape =
  "size-9 shrink-0 items-center justify-center rounded-full text-[14px] transition-colors";
const circleClass = `flex ${circleShape}`;
const arrowClass = `${circleShape} cursor-pointer text-[#262626] hover:bg-[#f0f1f3] disabled:cursor-not-allowed disabled:text-[#c4c8d0] disabled:hover:bg-transparent`;

// First/last drop out on phones so the row fits a narrow screen.
function ArrowButton({ label, icon: Icon, onClick, disabled, className = "flex" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${arrowClass} ${className}`}
    >
      <Icon className="size-5" strokeWidth={2} />
    </button>
  );
}

// The numbered page control the admin tables share. `page` is 1-based.
function Pagination({ page, pageCount, onPageChange }) {
  const items = pageItems(page, pageCount);
  const isFirst = page <= 1;
  const isLast = page >= pageCount;

  return (
    <nav aria-label="Pagination" className="flex items-center gap-0.5 sm:gap-1">
      <ArrowButton
        label="First page"
        icon={ChevronsLeft}
        className="hidden sm:flex"
        onClick={() => onPageChange(1)}
        disabled={isFirst}
      />
      <ArrowButton
        label="Previous page"
        icon={ChevronLeft}
        onClick={() => onPageChange(page - 1)}
        disabled={isFirst}
      />

      {items.map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={`${circleClass} cursor-pointer ${
              item === page
                ? "bg-(--primary-color) font-semibold text-white"
                : "text-[#262626] hover:bg-[#f0f1f3]"
            }`}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            aria-hidden="true"
            className={`${circleClass} text-[#667085]`}
          >
            …
          </span>
        ),
      )}

      <ArrowButton
        label="Next page"
        icon={ChevronRight}
        onClick={() => onPageChange(page + 1)}
        disabled={isLast}
      />
      <ArrowButton
        label="Last page"
        icon={ChevronsRight}
        className="hidden sm:flex"
        onClick={() => onPageChange(pageCount)}
        disabled={isLast}
      />
    </nav>
  );
}

export default Pagination;
