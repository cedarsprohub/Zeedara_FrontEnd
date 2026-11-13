import { Suspense, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  ChevronDown,
  CircleX,
  Download,
  FileText,
  Mail,
  MoreVertical,
  Package,
  PencilLine,
  Printer,
  Search,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";
import Seo from "../../../components/shared/Seo";
import Pagination from "../../../components/admin/Pagination";
import Dropdown, { DropdownDivider, DropdownItem } from "../../../components/admin/Dropdown";
import { CountTab, FilterButton, Pill, StatCard } from "../../../components/admin/AdminUi";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import { formatAmount, toAmount } from "../../../utils/formatCurrency";
import { formatNairaShort } from "../Dashboard/formatNairaShort";
import { exportAdminOrders, getAdminOrderDetail, setAdminOrderState } from "../../../api/admin/orders";
import { formatDate, relativeTime } from "../Customers/data";
import { CancelOrderDialog } from "./OrderPanel";
import { useOrdersData } from "./useOrdersData";
import { downloadText, packingSlipHtml, printHtml } from "./printDocuments";
import {
  ADVANCE_LABEL,
  COLUMNS,
  PAGE_SIZE,
  PAYMENT_FILTERS,
  PERIODS,
  TABS,
  itemCountLabel,
  locationLine,
  methodLabel,
  paymentPill,
  statusPill,
} from "./data";

// Mirrors the backend's NEXT_STATUS so the row menu can offer "Advance to …"
// without fetching each order.
const NEXT = { paid: "processing", processing: "packed", packed: "shipped", shipped: "delivered", delivery_failed: "shipped" };
const CANCELLABLE = new Set(["pending_payment", "payment_failed", "paid", "processing", "packed", "delivery_failed"]);

const DAY = 24 * 60 * 60 * 1000;
const placedLabel = (value) => (Date.now() - new Date(value).getTime() < 2 * DAY ? relativeTime(value) : formatDate(value));

const initials = (name) =>
  name.split(/\s+/).map((part) => part.charAt(0)).join("").slice(0, 2).toUpperCase();

function RowMenu({ order, onAdvance, onCancel, onPackingSlip }) {
  const navigate = useNavigate();
  const next = NEXT[order.status];
  return (
    <Dropdown
      align="right"
      width={212}
      label={`Options for ${order.order_number}`}
      trigger={({ isOpen, toggle, ref }) => (
        <button ref={ref} type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={isOpen} aria-label={`More options for ${order.order_number}`} className="flex size-8 cursor-pointer items-center justify-center rounded text-[#48505e] transition-colors hover:bg-[#f0f1f3] hover:text-black">
          <MoreVertical className="size-5" strokeWidth={2} />
        </button>
      )}
    >
      {(close) => (
        <>
          <DropdownItem as={Link} to={`/admin/orders/${order.id}`} icon={PencilLine} onClick={close}>View order</DropdownItem>
          <DropdownItem icon={FileText} onClick={() => { close(); navigate(`/admin/orders/${order.id}?view=invoice`); }}>Print invoice</DropdownItem>
          <DropdownItem icon={Printer} onClick={() => { close(); onPackingSlip(order); }}>Print packing slip</DropdownItem>
          {next && (
            <>
              <DropdownDivider />
              <DropdownItem icon={ArrowRight} onClick={() => { close(); onAdvance(order, next); }}>{ADVANCE_LABEL[next]}</DropdownItem>
            </>
          )}
          <DropdownItem as="a" href={`mailto:${order.customer_email}?subject=${encodeURIComponent(`Your Zeedara order ${order.order_number}`)}`} icon={Mail} onClick={close}>
            Email the customer
          </DropdownItem>
          {CANCELLABLE.has(order.status) && (
            <>
              <DropdownDivider />
              <DropdownItem tone="danger" icon={CircleX} onClick={() => { close(); onCancel(order); }}>Cancel order</DropdownItem>
            </>
          )}
        </>
      )}
    </Dropdown>
  );
}

function Orders() {
  const { accessToken } = useAdminAuth();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState({ key: "placed", direction: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [cancelling, setCancelling] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const sortParam = `${sort.direction === "desc" ? "-" : ""}${sort.key}`;
  const filters = { q: query.trim(), tab, payment, period, sort: sortParam };
  const { items, total, summary, tab_counts: counts, isLoading, error, reload } = useOrdersData({
    ...filters,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const [knownPageCount, setKnownPageCount] = useState(pageCount);
  if (!isLoading && pageCount !== knownPageCount) {
    setKnownPageCount(pageCount);
    if (page > pageCount) setPage(pageCount);
  }

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const applySort = (key) => {
    setSort((previous) =>
      previous.key === key ? { key, direction: previous.direction === "asc" ? "desc" : "asc" } : { key, direction: key === "customer" ? "asc" : "desc" },
    );
    setPage(1);
  };

  const flash = (message, isError = false) => {
    setNotice(isError ? "" : message);
    setActionError(isError ? message : "");
  };

  const allVisibleSelected = items.length > 0 && items.every((row) => selected.has(row.id));
  const toggleAll = () =>
    setSelected((previous) => {
      const next = new Set(previous);
      items.forEach((row) => (allVisibleSelected ? next.delete(row.id) : next.add(row.id)));
      return next;
    });
  const toggleOne = (id) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exportCsv = async () => {
    setIsExporting(true);
    try {
      const csv = await exportAdminOrders(
        { q: filters.q || undefined, tab: tab === "all" ? undefined : tab, payment: payment || undefined, period: period === "all" ? undefined : period, sort: sortParam },
        accessToken,
      );
      downloadText(csv, "zeedara-orders.csv");
    } catch (err) {
      flash(err.message, true);
    } finally {
      setIsExporting(false);
    }
  };

  const advance = async (order, next) => {
    try {
      await setAdminOrderState(order.id, next, accessToken);
      flash(`${order.order_number} moved to ${statusPill(next).label}.`);
      reload();
    } catch (err) {
      flash(err.message, true);
    }
  };

  const printPackingSlip = async (order) => {
    try {
      printHtml(packingSlipHtml(await getAdminOrderDetail(order.id, accessToken)));
    } catch (err) {
      flash(err.message, true);
    }
  };

  const confirmCancel = async () => {
    await setAdminOrderState(cancelling.id, "cancelled", accessToken);
    flash(`${cancelling.order_number} has been cancelled.`);
    setCancelling(null);
    reload();
  };

  const periodLabel = PERIODS.find((option) => option.key === period)?.label;
  const paymentLabel = PAYMENT_FILTERS.find((option) => option.key === payment)?.label;
  const subtitle = `${summary.all_time.toLocaleString("en-NG")} order${summary.all_time === 1 ? "" : "s"} all-time · ${summary.awaiting_fulfilment_all_time} awaiting fulfilment`;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Seo title="Orders" description="Zeedara admin orders." noindex />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 leading-[1.4]">
          <h1 className="text-[24px] font-bold text-[#262626]">Orders</h1>
          <p className="text-[12px] font-medium text-[#667085]">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            align="right"
            label="Placed"
            trigger={({ isOpen, toggle, ref }) => (
              <FilterButton label={periodLabel} isOpen={isOpen} toggle={toggle} buttonRef={ref} className="min-w-[130px]" />
            )}
          >
            {(close) =>
              PERIODS.map((option) => (
                <DropdownItem key={option.key} selected={option.key === period} onClick={() => { resetPage(setPeriod)(option.key); close(); }}>
                  {option.label}
                </DropdownItem>
              ))
            }
          </Dropdown>
          <button
            type="button"
            onClick={exportCsv}
            disabled={isExporting}
            className="flex h-10 cursor-pointer items-center justify-center gap-[7px] rounded-[2px] border border-[#dadde2] bg-white px-4 text-[14px] font-semibold text-black shadow-[0px_1px_1px_rgba(16,24,40,0.05)] transition-colors hover:border-[#9fa5b2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="size-[17px]" strokeWidth={2} />
            {isExporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      {(notice || actionError) && (
        <p role={actionError ? "alert" : "status"} className={`px-4 py-3 text-[13px] font-medium ${actionError ? "bg-[#fae9e9] text-[#cf251f]" : "bg-[#eefeec] text-[#0f9959]"}`}>
          {actionError || notice}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Gross revenue" value={formatNairaShort(toAmount(summary.gross_revenue))} note="Excludes cancelled orders" icon={Banknote} iconBg="rgba(255,105,0,0.1)" iconColor="#ff6900" />
        <StatCard label="Orders in view" value={summary.orders.toLocaleString("en-NG")} note={`${summary.units.toLocaleString("en-NG")} units`} icon={ShoppingCart} iconBg="#eff8ff" iconColor="#2e90fa" />
        <StatCard label="Awaiting fulfilment" value={summary.awaiting_fulfilment} note="Confirmed or processing" icon={Package} iconBg="#fffaeb" iconColor="#f79009" />
        <StatCard label="Unpaid" value={summary.unpaid} note="Outstanding payments" icon={TriangleAlert} iconBg="#fef3f2" iconColor="#cf251f" />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {TABS.map((option) => (
          <CountTab key={option.key} label={option.label} count={counts[option.key]} isActive={option.key === tab} onClick={() => resetPage(setTab)(option.key)} />
        ))}
      </div>

      <div className="min-w-0 border border-[#f0f1f3] bg-white shadow-[0px_1px_1px_rgba(16,24,40,0.05)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#f0f1f3] p-4 sm:gap-6">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 border border-[#dadde2] px-[13px] focus-within:border-(--primary-color) sm:max-w-[312px]">
            <Search className="size-5 shrink-0 text-[#9fa5b2]" strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search orders"
              placeholder="Order ID, customer or payment ref…"
              value={query}
              onChange={(event) => resetPage(setQuery)(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-black placeholder:text-[#9fa5b2] focus:outline-none"
            />
          </label>
          <Dropdown
            label="Payment"
            trigger={({ isOpen, toggle, ref }) => (
              <FilterButton label={payment ? `Payment: ${paymentLabel}` : "All payments"} isOpen={isOpen} toggle={toggle} buttonRef={ref} className="min-w-[128px]" />
            )}
          >
            {(close) =>
              PAYMENT_FILTERS.map((option) => (
                <DropdownItem key={option.key || "all"} tone="strong" selected={option.key === payment} onClick={() => { resetPage(setPayment)(option.key); close(); }}>
                  {option.label}
                </DropdownItem>
              ))
            }
          </Dropdown>
          {selected.size > 0 && (
            <p className="ml-auto text-[12px] font-semibold text-[#865c18]">
              {selected.size} selected ·{" "}
              <button type="button" onClick={() => setSelected(new Set())} className="cursor-pointer underline">clear</button>
            </p>
          )}
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#f0f1f3] bg-[#fcfcfc]">
                <th scope="col" className="w-[44px] py-[11px] pl-4">
                  <input type="checkbox" aria-label="Select all orders on this page" checked={allVisibleSelected} onChange={toggleAll} className="size-4 cursor-pointer align-middle accent-(--primary-color)" />
                </th>
                {COLUMNS.map((column) => {
                  const isSorted = sort.key === column.key;
                  return (
                    <th key={column.key} scope="col" aria-sort={isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : undefined} className={`px-3 py-[11px] ${column.align === "right" ? "text-right" : ""}`}>
                      <button type="button" onClick={() => applySort(column.key)} className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap text-[12px] font-semibold leading-[1.4] hover:text-[#262626] ${isSorted ? "text-[#262626]" : "text-[#667085]"}`}>
                        {column.label}
                        <ChevronDown className={`size-4 transition-transform ${isSorted && sort.direction === "asc" ? "rotate-180" : ""}`} strokeWidth={1.75} />
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="w-[50px]"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={COLUMNS.length + 2} className="px-4 py-16 text-center text-[14px] text-[#828a9b]">Loading orders…</td></tr>
              ) : error ? (
                <tr><td colSpan={COLUMNS.length + 2} className="px-4 py-16 text-center text-[14px] text-[#cf251f]">{error} <button type="button" onClick={reload} className="cursor-pointer font-semibold underline">Try again</button></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={COLUMNS.length + 2} className="px-4 py-16 text-center text-[14px] text-[#828a9b]">No orders match these filters.</td></tr>
              ) : (
                items.map((order) => {
                  const isSelected = selected.has(order.id);
                  const method = methodLabel(order.payment_method);
                  return (
                    <tr key={order.id} className={`border-b border-[#f0f1f3] text-[12px] font-semibold leading-[1.4] text-[#575f71] ${isSelected ? "bg-[#faf4eb]" : "hover:bg-[#fcfcfc]"}`}>
                      <td className="py-3 pl-4">
                        <input type="checkbox" aria-label={`Select ${order.order_number}`} checked={isSelected} onChange={() => toggleOne(order.id)} className="size-4 cursor-pointer align-middle accent-(--primary-color)" />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Link to={`/admin/orders/${order.id}`} className="text-black hover:text-(--primary-color) hover:underline">{order.order_number}</Link>
                        <p className="font-medium text-[#828a9b]">{itemCountLabel(order.item_count)}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex min-w-[170px] items-center gap-[11px]">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-[2px] text-[12px] font-bold text-white" style={{ backgroundImage: "linear-gradient(145deg, #cb9b4a 6%, #a66f17 94%)" }}>
                            {initials(order.customer_name)}
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate text-black">{order.customer_name}</p>
                            <p className="max-w-[180px] truncate font-medium text-[#828a9b]">{locationLine(order) || order.customer_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{placedLabel(order.created_at)}</td>
                      <td className="px-3 py-3"><Pill {...statusPill(order.status)} /></td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <Pill {...paymentPill(order.payment_status)} />
                          {method && <span className="text-[10px] font-medium text-[#828a9b] italic">{method}</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap text-black">{formatAmount(order.total_ngn)}</td>
                      <td className="px-2 py-3 text-center">
                        <RowMenu order={order} onAdvance={advance} onCancel={setCancelling} onPackingSlip={printPackingSlip} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
          <p className="text-[12px] font-medium text-[#828a9b]">
            Showing <span className="font-semibold text-black">{total === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, total)}</span> of{" "}
            <span className="font-semibold text-black">{total}</span>
          </p>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </div>

      {/* Order panel (child route /admin/orders/:orderId); it reloads this list
          after a change through the outlet context. */}
      <Suspense fallback={null}>
        <Outlet context={{ reload }} />
      </Suspense>

      {cancelling && (
        <CancelOrderDialog
          order={{ ...cancelling, paid_at: cancelling.payment_status === "paid" ? cancelling.created_at : null }}
          onClose={() => setCancelling(null)}
          onConfirm={confirmCancel}
        />
      )}
    </div>
  );
}

export default Orders;
