import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import Seo from "../../../components/shared/Seo";
import { formatCurrency } from "../../../utils/formatCurrency";
import {
  CATEGORIES,
  initialsFor,
  PAGE_SIZE,
  PRODUCTS,
  STATUSES,
} from "./data";

const STATUS_STYLES = {
  Active: { bg: "#eefeec", border: "#c5e7d7", text: "#0f9959" },
  Draft: { bg: "#fcfcfc", border: "#dadde2", text: "#667085" },
  Archived: { bg: "#fdf2f2", border: "#f3d3d2", text: "#cf251f" },
};

const COLUMNS = [
  { key: "name", label: "Product" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price", align: "text-right" },
  { key: "stock", label: "Stock" },
  { key: "sold", label: "Sold" },
  { key: "status", label: "Status" },
];

function StatusPill({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Draft;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: style.text }}
      />
      {status}
    </span>
  );
}

function Products() {
  // The bulk actions in the selection bar edit the catalogue, so the rows are
  // held in state rather than read straight off the placeholder array.
  const [rows, setRows] = useState(PRODUCTS);
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [view, setView] = useState("list");
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  // Tab counts come from the full catalogue, so they keep showing the size of
  // each bucket rather than of whatever the search happens to have narrowed to.
  const statusCounts = useMemo(
    () =>
      Object.fromEntries(
        STATUSES.map((option) => [
          option,
          option === "All"
            ? rows.length
            : rows.filter((product) => product.status === option).length,
        ]),
      ),
    [rows],
  );

  const totals = useMemo(
    () => ({
      variants: rows.reduce((sum, product) => sum + product.variants, 0),
      units: rows.reduce((sum, product) => sum + product.stock, 0),
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = rows.filter((product) => {
      if (status !== "All" && product.status !== status) return false;
      if (category !== CATEGORIES[0] && product.category !== category)
        return false;
      if (!term) return true;
      return `${product.name} ${product.sku} ${product.category}`
        .toLowerCase()
        .includes(term);
    });

    const factor = sort.direction === "asc" ? 1 : -1;
    return [...matches].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * factor;
      }
      return String(left).localeCompare(String(right)) * factor;
    });
  }, [rows, status, category, query, sort]);

  // Clamped rather than reset: deleting the filter that shrank the list
  // shouldn't silently bounce you back to page 1 when the page still exists.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const allVisibleSelected =
    visible.length > 0 && visible.every((product) => selected.has(product.sku));

  const toggleAll = () => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (allVisibleSelected) {
        visible.forEach((product) => next.delete(product.sku));
      } else {
        visible.forEach((product) => next.add(product.sku));
      }
      return next;
    });
  };

  const toggleOne = (sku) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  // Recategorising keeps the selection so the same rows can be acted on again;
  // deleting drops it, since those SKUs no longer exist to stay selected.
  const changeCategory = (value) => {
    setRows((previous) =>
      previous.map((product) =>
        selected.has(product.sku) ? { ...product, category: value } : product,
      ),
    );
  };

  const deleteSelected = () => {
    setRows((previous) =>
      previous.filter((product) => !selected.has(product.sku)),
    );
    clearSelection();
  };

  const applySort = (key) => {
    setSort((previous) =>
      previous.key === key
        ? { key, direction: previous.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  // Any change to what's being filtered invalidates the current page number.
  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <Seo title="Products" description="Zeedara admin product catalogue." noindex />

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#262626]">Products</h1>
          <p className="text-[12px] font-medium text-[#828a9b]">
            {rows.length} products · {totals.variants} variants ·{" "}
            {totals.units.toLocaleString("en-NG")} units in stock
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 border border-[#f0f1f3] bg-white px-4 py-2.5 text-[14px] font-medium text-[#48505e] transition-colors hover:border-[#dadde2] hover:text-black"
          >
            <Upload className="size-[17px]" strokeWidth={2} />
            Import
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 border border-[#f0f1f3] bg-white px-4 py-2.5 text-[14px] font-medium text-[#48505e] transition-colors hover:border-[#dadde2] hover:text-black"
          >
            <Download className="size-[17px]" strokeWidth={2} />
            Export CSV
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-(--primary-color) px-4 py-2.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-[17px]" strokeWidth={2.5} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap items-center gap-3">
        {STATUSES.map((option) => {
          const isActive = option === status;
          return (
            <button
              key={option}
              type="button"
              onClick={() => resetPage(setStatus)(option)}
              aria-pressed={isActive}
              className={`flex cursor-pointer items-center gap-2 border px-3.5 py-2 text-[14px] transition-colors ${
                isActive
                  ? "border-(--primary-color) bg-(--primary-color) font-bold text-white"
                  : "border-[#f0f1f3] bg-white font-medium text-[#48505e] hover:border-[#dadde2]"
              }`}
            >
              {option}
              <span
                className={`text-[12px] ${
                  isActive ? "text-white/80" : "text-[#9fa5b2]"
                }`}
              >
                {statusCounts[option]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-w-0 border border-[#f0f1f3] bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#f0f1f3] p-4">
          <div className="flex h-[41px] min-w-0 flex-1 items-center gap-2 border border-[#f0f1f3] bg-white px-3 focus-within:border-[#dadde2] sm:max-w-[245px]">
            <Search className="size-4 shrink-0 text-[#9fa5b2]" strokeWidth={2} />
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search by name, category, tag..."
              value={query}
              onChange={(event) => resetPage(setQuery)(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-[#262626] placeholder:text-[#9fa5b2] focus:outline-none"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => resetPage(setCategory)(event.target.value)}
              className="h-[41px] cursor-pointer appearance-none border border-[#f0f1f3] bg-white pr-10 pl-3 text-[14px] text-[#48505e] focus:border-[#dadde2] focus:outline-none"
            >
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#48505e]"
              strokeWidth={2}
            />
          </div>

          <div className="ml-auto flex items-center gap-1 border border-[#f0f1f3] p-1">
            {[
              { key: "list", label: "List", icon: List },
              { key: "grid", label: "Grid", icon: LayoutGrid },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-pressed={view === key}
                className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[14px] transition-colors ${
                  view === key
                    ? "bg-[#f9fafb] font-semibold text-[#262626]"
                    : "font-medium text-[#828a9b] hover:text-[#262626]"
                }`}
              >
                <Icon className="size-4" strokeWidth={2} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk action bar. Only present while something is selected — it takes
            the place of a row rather than sitting there empty, which is why the
            table below keeps its own top border either way. */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f1f3] bg-[#faf4eb] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-1 text-[14px] font-semibold text-[#865c18]">
                {selected.size} selected
              </p>

              <div className="relative">
                {/* Held at the placeholder so the control reads as an action
                    rather than as the current category of the selection — the
                    rows may well be in several different ones. */}
                <select
                  aria-label="Change category of selected products"
                  value=""
                  onChange={(event) => changeCategory(event.target.value)}
                  className="h-[36px] w-[190px] cursor-pointer appearance-none border border-[#dadde2] bg-white pr-9 pl-3 text-[14px] font-medium text-[#48505e] focus:outline-none"
                >
                  <option value="" disabled>
                    Change category
                  </option>
                  {CATEGORIES.slice(1).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#48505e]"
                  strokeWidth={2}
                />
              </div>

              <button
                type="button"
                onClick={deleteSelected}
                className="flex h-[36px] cursor-pointer items-center gap-2 bg-[#fae9e9] px-3 text-[14px] font-medium text-[#cf251f] transition-opacity hover:opacity-80"
              >
                <Trash2 className="size-4" strokeWidth={2} />
                Delete
              </button>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="cursor-pointer text-[14px] font-semibold text-[#48505e] transition-colors hover:text-black"
            >
              Clear selection
            </button>
          </div>
        )}

        {visible.length === 0 ? (
          <p className="px-4 py-16 text-center text-[14px] text-[#828a9b]">
            No products match these filters.
          </p>
        ) : view === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#f0f1f3]">
                  <th scope="col" className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all products on this page"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      className="size-4 cursor-pointer accent-(--primary-color)"
                    />
                  </th>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={`px-4 py-3 ${column.align ?? ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => applySort(column.key)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-medium transition-colors hover:text-[#262626] ${
                          sort.key === column.key
                            ? "text-[#262626]"
                            : "text-[#828a9b]"
                        }`}
                      >
                        {column.label}
                        <ChevronDown
                          className={`size-3.5 transition-transform ${
                            sort.key === column.key && sort.direction === "desc"
                              ? "rotate-180"
                              : ""
                          }`}
                          strokeWidth={2}
                        />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((product) => {
                  const isSelected = selected.has(product.sku);
                  return (
                    <tr
                      key={product.sku}
                      // A selected row keeps its tint on hover, so the hover rule
                      // is only applied to the rows that aren't selected.
                      className={`border-b border-[#f0f1f3] last:border-0 ${
                        isSelected ? "bg-[#faf4eb]" : "hover:bg-[#fcfcfc]"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${product.name}`}
                          checked={isSelected}
                          onChange={() => toggleOne(product.sku)}
                          className="size-4 cursor-pointer accent-(--primary-color)"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-(--primary-color) text-[12px] font-bold text-white">
                            {initialsFor(product.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold text-[#262626]">
                              {product.name}
                            </p>
                            <p className="text-[12px] text-[#828a9b]">
                              {product.sku} · {product.variants} variant
                              {product.variants === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[14px] text-[#667085]">
                        {product.category}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {product.compareAt && (
                          <span className="mr-2 text-[12px] text-[#9fa5b2] line-through">
                            {formatCurrency(product.compareAt)}
                          </span>
                        )}
                        <span className="text-[14px] font-bold text-(--primary-color)">
                          {formatCurrency(product.price)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* Zero reads as a problem, so it gets the error palette
                          rather than the neutral stock chip. */}
                        <span
                          className={`inline-block rounded-md border px-2.5 py-1 text-[12px] font-semibold ${
                            product.stock === 0
                              ? "border-[#f3d3d2] bg-[#fdf2f2] text-[#cf251f]"
                              : "border-[#f6e5c7] bg-white text-[#262626]"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[14px] text-[#667085]">
                        {product.sold}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={product.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // Grid view isn't in the Figma file — the toggle is, so this is a
          // straightforward card rendering of the same rows.
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((product) => (
              <div
                key={product.sku}
                className="flex min-w-0 flex-col gap-3 border border-[#f0f1f3] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-(--primary-color) text-[14px] font-bold text-white">
                    {initialsFor(product.name)}
                  </span>
                  <StatusPill status={product.status} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[#262626]">
                    {product.name}
                  </p>
                  <p className="text-[12px] text-[#828a9b]">
                    {product.sku} · {product.category}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[14px] font-bold text-(--primary-color)">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-[12px] text-[#828a9b]">
                    {product.stock} in stock · {product.sold} sold
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#f0f1f3] px-4 py-4">
          <p className="text-[14px] text-[#667085]">
            Showing{" "}
            <span className="font-semibold text-[#262626]">
              {filtered.length === 0 ? 0 : start + 1}–
              {Math.min(start + PAGE_SIZE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#262626]">
              {filtered.length}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="cursor-pointer p-2 text-[#48505e] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" strokeWidth={2} />
            </button>

            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  aria-current={number === currentPage ? "page" : undefined}
                  className={`size-8 cursor-pointer text-[14px] transition-colors ${
                    number === currentPage
                      ? "bg-(--primary-color) font-bold text-white"
                      : "text-[#48505e] hover:bg-[#f9fafb]"
                  }`}
                >
                  {number}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              aria-label="Next page"
              className="cursor-pointer p-2 text-[#48505e] transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;
