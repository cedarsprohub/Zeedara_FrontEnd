import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import {
  bulkDeleteAdminProducts,
  bulkUpdateAdminProducts,
  exportAdminProducts,
} from "../../../api/admin/products";
import AddProductDrawer from "./AddProductDrawer";
import DeleteDialog from "./DeleteDialog";
import ImportDialog from "./ImportDialog";
import { useProductsData } from "./useProductsData";
import { useCategories } from "./useCategories";
import { initialsFor, PAGE_SIZE, STATUSES, toApiStatus } from "./data";

const ALL_CATEGORIES = "";

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

// Downloads a CSV response the same way the import dialog's blank template
// does — revoking the object URL straight after the click is what lets the
// blob be collected, since it outlives the element.
function downloadCsv(text, filename) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function Products() {
  const { accessToken } = useAdminAuth();
  const categories = useCategories();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  // Seeded once from the incoming `?category=` param — the Categories
  // page's "View products" action links here with one — and left to the
  // filter bar's own state from then on, same as every other filter here.
  const [category, setCategory] = useState(
    () => searchParams.get("category") || ALL_CATEGORIES,
  );
  const [view, setView] = useState("list");
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [actionError, setActionError] = useState("");
  // null while the drawer is closed or creating; the id of the row being
  // edited otherwise. One flag rather than two, so the drawer can't end up
  // open in both modes at once.
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const { items, total, summary, statusCounts, isLoading, error, reload } =
    useProductsData({
      q: query,
      category,
      status,
      sort: sort.key,
      direction: sort.direction,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      categories,
    });

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;

  // A delete can leave `page` pointing past the last page the new total
  // actually has. Adjusted during render rather than in an effect — an
  // effect here would fetch the out-of-range page once before correcting.
  const [knownPageCount, setKnownPageCount] = useState(pageCount);
  if (pageCount !== knownPageCount) {
    setKnownPageCount(pageCount);
    if (page > pageCount) setPage(pageCount);
  }

  const allVisibleSelected =
    items.length > 0 && items.every((product) => selected.has(product.id));

  const toggleAll = () => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (allVisibleSelected) {
        items.forEach((product) => next.delete(product.id));
      } else {
        items.forEach((product) => next.add(product.id));
      }
      return next;
    });
  };

  const toggleOne = (id) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  // Recategorising keeps the selection so the same rows can be acted on
  // again; deleting drops it, since those rows no longer exist to stay
  // selected.
  const changeCategory = async (value) => {
    setActionError("");
    try {
      await bulkUpdateAdminProducts(
        { ids: [...selected], categoryId: value },
        accessToken,
      );
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const deleteSelected = async () => {
    setActionError("");
    try {
      await bulkDeleteAdminProducts([...selected], accessToken);
      clearSelection();
      setIsConfirmingDelete(false);
      reload();
    } catch (err) {
      setActionError(err.message);
      setIsConfirmingDelete(false);
    }
  };

  // The filters are cleared along with the insert: importing into a view that
  // happens to exclude every new row reads as an import that did nothing.
  // The chosen sort is left alone — it still applies to the rows that arrived.
  const handleImported = () => {
    setIsImporting(false);
    setStatus("All");
    setQuery("");
    setCategory(ALL_CATEGORIES);
    setPage(1);
    reload();
  };

  const exportCsv = async () => {
    setIsExporting(true);
    setActionError("");
    try {
      const csv = await exportAdminProducts(
        {
          q: query || undefined,
          categoryId: category || undefined,
          status: status === "All" ? undefined : toApiStatus(status),
          sort: sort.direction === "desc" ? `-${sort.key}` : sort.key,
        },
        accessToken,
      );
      downloadCsv(csv, "zeedara-products.csv");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const openCreateDrawer = () => {
    setEditingProductId(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (product) => {
    setEditingProductId(product.id);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

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
            {summary.total} products · {summary.variantsTotal} variants ·{" "}
            {summary.unitsTotal.toLocaleString("en-NG")} units in stock
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsImporting(true)}
            className="flex cursor-pointer items-center gap-2 border border-[#f0f1f3] bg-white px-4 py-2.5 text-[14px] font-medium text-[#48505e] transition-colors hover:border-[#dadde2] hover:text-black"
          >
            <Upload className="size-[17px]" strokeWidth={2} />
            Import
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={isExporting}
            className="flex cursor-pointer items-center gap-2 border border-[#f0f1f3] bg-white px-4 py-2.5 text-[14px] font-medium text-[#48505e] transition-colors hover:border-[#dadde2] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="size-[17px]" strokeWidth={2} />
            {isExporting ? "Exporting…" : "Export CSV"}
          </button>
          <button
            type="button"
            onClick={openCreateDrawer}
            className="flex cursor-pointer items-center gap-2 bg-(--primary-color) px-4 py-2.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-[17px]" strokeWidth={2.5} />
            Add Product
          </button>
        </div>
      </div>

      {actionError && (
        <p className="bg-[#fae9e9] px-4 py-3 text-[13px] font-medium text-[#cf251f]">
          {actionError}
        </p>
      )}

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
              <option value={ALL_CATEGORIES}>All categories</option>
              {categories.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
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
                  {categories.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
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
                onClick={() => setIsConfirmingDelete(true)}
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

        {isLoading ? (
          <p className="px-4 py-16 text-center text-[14px] text-[#828a9b]">
            Loading products…
          </p>
        ) : error ? (
          <p className="px-4 py-16 text-center text-[14px] text-[#cf251f]">
            {error}
          </p>
        ) : items.length === 0 ? (
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
                {items.map((product) => {
                  const isSelected = selected.has(product.id);
                  return (
                    <tr
                      key={product.id}
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
                          onChange={() => toggleOne(product.id)}
                          className="size-4 cursor-pointer accent-(--primary-color)"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-(--primary-color) text-[12px] font-bold text-white">
                            {initialsFor(product.name)}
                          </span>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => openEditDrawer(product)}
                              className="block w-full cursor-pointer truncate text-left text-[14px] font-semibold text-[#262626] hover:text-(--primary-color) hover:underline"
                            >
                              {product.name}
                            </button>
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
            {items.map((product) => (
              <div
                key={product.id}
                className="flex min-w-0 flex-col gap-3 border border-[#f0f1f3] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-(--primary-color) text-[14px] font-bold text-white">
                    {initialsFor(product.name)}
                  </span>
                  <StatusPill status={product.status} />
                </div>
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openEditDrawer(product)}
                    className="block w-full cursor-pointer truncate text-left text-[14px] font-semibold text-[#262626] hover:text-(--primary-color) hover:underline"
                  >
                    {product.name}
                  </button>
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
              {total === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, total)}
            </span>{" "}
            of <span className="font-semibold text-[#262626]">{total}</span>
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

            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (number) => (
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
              ),
            )}

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

      {/* Always mounted, unlike the dialogs — it slides in, so it needs to be
          in the tree before it opens. */}
      <AddProductDrawer
        isOpen={isDrawerOpen}
        productId={editingProductId}
        categories={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
        onClose={closeDrawer}
        onSaved={reload}
      />

      {isImporting && (
        <ImportDialog
          // The import row's own category field is matched by name server-side
          // (see ProductImportRow), not the real id the other forms send.
          categories={categories.map((cat) => cat.name)}
          existingSkus={items.map((product) => product.sku)}
          onCancel={() => setIsImporting(false)}
          onImported={handleImported}
        />
      )}

      {isConfirmingDelete && (
        <DeleteDialog
          count={selected.size}
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={deleteSelected}
        />
      )}
    </div>
  );
}

export default Products;
