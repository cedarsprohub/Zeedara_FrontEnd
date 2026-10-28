import { ChevronLeft, ChevronRight } from "lucide-react";

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

const navButtonClass =
  "flex h-8 cursor-pointer items-center gap-1 rounded-[2px] border border-[#dadde2] bg-white px-2.5 text-[13px] font-semibold text-[#48505e] transition-colors hover:border-[#9fa5b2] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#dadde2] disabled:hover:text-[#48505e]";

// The numbered page control the admin tables share. `page` is 1-based.
function Pagination({ page, pageCount, onPageChange }) {
  const items = pageItems(page, pageCount);

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={navButtonClass}
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {items.map((item) =>
        typeof item === "number" ? (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={`size-8 cursor-pointer text-[14px] transition-colors ${
              item === page
                ? "bg-(--primary-color) font-bold text-white"
                : "text-[#48505e] hover:bg-[#f9fafb]"
            }`}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            aria-hidden="true"
            className="flex size-8 items-center justify-center text-[14px] text-[#9fa5b2]"
          >
            …
          </span>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className={navButtonClass}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="size-4" strokeWidth={2} />
      </button>
    </nav>
  );
}

export default Pagination;
