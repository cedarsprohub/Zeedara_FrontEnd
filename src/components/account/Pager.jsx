// The design's pager: numbered squares around the current page, then Next and
// Last. Previous/First appear once you've moved off page 1.
function pageWindow(page, pageCount) {
  const start = Math.max(1, Math.min(page - 1, pageCount - 2));
  const end = Math.min(pageCount, start + 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pager({ page, pageCount, onChange, disabled }) {
  if (pageCount <= 1) return null;
  const pages = pageWindow(page, pageCount);
  const square =
    "flex h-8 min-w-8 cursor-pointer items-center justify-center px-3 text-[14px] font-medium leading-[1.4] transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const idle = "bg-[#f0f1f3] text-[#575f71] hover:bg-[#e6e8eb]";

  return (
    <nav
      aria-label="Order pages"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 && (
        <>
          <button
            type="button"
            onClick={() => onChange(1)}
            disabled={disabled}
            className={`${square} ${idle}`}
          >
            First
          </button>
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={disabled}
            className={`${square} ${idle}`}
          >
            Prev
          </button>
        </>
      )}
      {pages[0] > 1 && <span className={`${square} ${idle} cursor-default`}>…</span>}
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onChange(number)}
          disabled={disabled}
          aria-current={number === page ? "page" : undefined}
          className={`${square} px-0 ${
            number === page ? "bg-(--primary-color) text-white" : idle
          }`}
        >
          {number}
        </button>
      ))}
      {pages[pages.length - 1] < pageCount && (
        <span className={`${square} ${idle} cursor-default`}>…</span>
      )}
      {page < pageCount && (
        <>
          <button
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={disabled}
            className={`${square} ${idle}`}
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => onChange(pageCount)}
            disabled={disabled}
            className={`${square} ${idle}`}
          >
            Last
          </button>
        </>
      )}
    </nav>
  );
}
