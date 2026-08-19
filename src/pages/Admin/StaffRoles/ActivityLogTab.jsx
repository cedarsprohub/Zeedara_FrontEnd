import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { ACTIVITY_CATEGORY_STYLES, ACTIVITY_PAGE_SIZE } from "./data";

function CategoryPill({ category }) {
  const style = ACTIVITY_CATEGORY_STYLES[category] ?? {
    bg: "#f2f4f7",
    border: "#eaecf0",
    text: "#475467",
  };
  return (
    <span
      className="shrink-0 rounded-full border px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
      }}
    >
      {category}
    </span>
  );
}

function ActivityLogTab({ entries }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const changeQuery = (value) => {
    setQuery(value);
    setPage(1);
  };

  const filtered = entries.filter((entry) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      entry.actor.toLowerCase().includes(q) || entry.action.toLowerCase().includes(q)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / ACTIVITY_PAGE_SIZE));
  const start = (page - 1) * ACTIVITY_PAGE_SIZE;
  const items = filtered.slice(start, start + ACTIVITY_PAGE_SIZE);

  const exportLog = () => {
    const header = "Actor,Action,Category,Date,IP\n";
    const rows = filtered
      .map((entry) =>
        [entry.actor, entry.action, entry.category, `${entry.date} (${entry.relative})`, entry.ip]
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zeedara-staff-activity-log.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-w-0 border border-[#f0f1f3] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f1f3] p-4">
        <div className="flex h-[39px] w-full max-w-[245px] items-center gap-2 border border-[#f0f1f3] bg-white px-3 focus-within:border-[#dadde2]">
          <Search className="size-4 shrink-0 text-[#9fa5b2]" strokeWidth={2} />
          <input
            type="search"
            aria-label="Search by name or email"
            placeholder="Search by name or email"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[#262626] placeholder:text-[#9fa5b2] focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={exportLog}
          className="flex h-10 cursor-pointer items-center gap-2 border border-[#f0f1f3] bg-white px-4 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-[#dadde2] hover:text-black"
        >
          <Download className="size-4" strokeWidth={2} />
          Export log
        </button>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-16 text-center text-[14px] text-[#828a9b]">
          No activity matches this search.
        </p>
      ) : (
        <ul>
          {items.map((entry, index) => (
            <li
              key={entry.id}
              className="flex items-start gap-2.5 border-b border-[#f0f1f3] px-6 py-3 last:border-0"
            >
              <span
                className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                  index === 0 && page === 1 ? "bg-(--primary-color)" : "bg-[#0f9959]"
                }`}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-semibold text-[#262626]">
                    {entry.actor} {entry.action}
                  </p>
                  <CategoryPill category={entry.category} />
                </div>
                <p className="text-[12px] font-medium text-[#828a9b]">
                  {entry.date} · {entry.relative} ·{" "}
                  <span className="font-mono">{entry.ip}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#f0f1f3] px-4 py-4">
        <p className="text-[14px] text-[#667085]">
          Showing{" "}
          <span className="font-semibold text-[#262626]">
            {filtered.length === 0 ? 0 : start + 1}–
            {Math.min(start + ACTIVITY_PAGE_SIZE, filtered.length)}
          </span>{" "}
          of <span className="font-semibold text-[#262626]">{filtered.length}</span>
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="cursor-pointer p-2 text-[#48505e] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => setPage(number)}
              aria-current={number === page ? "page" : undefined}
              className={`size-8 cursor-pointer text-[14px] transition-colors ${
                number === page
                  ? "bg-(--primary-color) font-bold text-white"
                  : "text-[#48505e] hover:bg-[#f9fafb]"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page === pageCount}
            aria-label="Next page"
            className="cursor-pointer p-2 text-[#48505e] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActivityLogTab;
