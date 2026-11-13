import { Suspense, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  Banknote,
  ChevronDown,
  Download,
  Eye,
  Lock,
  LockOpen,
  Mail,
  MoreVertical,
  PencilLine,
  Repeat,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Seo from "../../../components/shared/Seo";
import Pagination from "../../../components/admin/Pagination";
import { CountTab, FilterButton, StatCard } from "../../../components/admin/AdminUi";
import Dropdown, { DropdownDivider, DropdownItem } from "../../../components/admin/Dropdown";
import { useAdminAuth } from "../../../context/AdminAuthContext.js";
import { formatAmount, toAmount } from "../../../utils/formatCurrency";
import { formatNairaShort } from "../Dashboard/formatNairaShort";
import {
  deleteAdminCustomer,
  exportAdminCustomers,
  setAdminCustomerBlocked,
  updateAdminCustomer,
} from "../../../api/admin/customers";
import { ConfirmCustomerDialog, EditCustomerDialog } from "./CustomerDialogs";
import { useCustomersData } from "./useCustomersData";
import {
  COLUMNS,
  PAGE_SIZE,
  PERIODS,
  SEGMENT_BADGES,
  SEGMENTS,
  formatDate,
  fullName,
  initialsFor,
  locationOf,
  relativeTime,
  rowsToCsv,
} from "./data";

function downloadCsv(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}


function Badge({ kind }) {
  const style = SEGMENT_BADGES[kind];
  if (!style) return null;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-lg border px-[7px] py-0.5 text-[10px] font-semibold leading-[1.4]"
      style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}
    >
      {style.label}
    </span>
  );
}

// The ⋮ "More options" menu on each row.
function RowMenu({ customer, onEdit, onConfirm }) {
  const name = fullName(customer);
  return (
    <Dropdown
      align="right"
      width={212}
      label={`Options for ${name}`}
      trigger={({ isOpen, toggle, ref }) => (
        <button
          ref={ref}
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={`More options for ${name}`}
          className="flex size-8 cursor-pointer items-center justify-center rounded text-[#48505e] transition-colors hover:bg-[#f0f1f3] hover:text-black"
        >
          <MoreVertical className="size-5" strokeWidth={2} />
        </button>
      )}
    >
      {(close) => (
        <>
          <DropdownItem as={Link} to={`/admin/customers/${customer.id}`} icon={Eye} onClick={close}>
            View profile
          </DropdownItem>
          <DropdownItem icon={PencilLine} onClick={() => { close(); onEdit(customer); }}>
            Edit details
          </DropdownItem>
          <DropdownItem
            as={Link}
            to={`/admin/customers/${customer.id}?tab=orders`}
            icon={ShoppingCart}
            onClick={close}
          >
            View orders
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem as="a" href={`mailto:${customer.email}`} icon={Mail} onClick={close}>
            Send an email
          </DropdownItem>
          <DropdownDivider />
          {customer.is_active ? (
            <DropdownItem tone="danger" icon={Lock} onClick={() => { close(); onConfirm("block", customer); }}>
              Block customer
            </DropdownItem>
          ) : (
            <DropdownItem icon={LockOpen} onClick={() => { close(); onConfirm("unblock", customer); }}>
              Unblock customer
            </DropdownItem>
          )}
          <DropdownItem tone="danger" icon={Trash2} onClick={() => { close(); onConfirm("delete", customer); }}>
            Delete customer
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}


function Customers() {
  const { accessToken } = useAdminAuth();
  const [segment, setSegment] = useState("all");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState({ key: "joined", direction: "desc" });
  const [page, setPage] = useState(1);
  // id → row, so a selection survives paging and "Export selected" has the data.
  const [selected, setSelected] = useState(() => new Map());
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const sortParam = `${sort.direction === "desc" ? "-" : ""}${sort.key}`;
  const { items, total, summary, segment_counts: counts, countries, isLoading, error, reload } =
    useCustomersData({
      q: query.trim(),
      segment,
      country,
      period,
      sort: sortParam,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;

  // A delete can leave `page` past the end; corrected during render once the
  // new total is in (same approach as Products).
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
      previous.key === key
        ? { key, direction: previous.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "name" || key === "location" ? "asc" : "desc" },
    );
    setPage(1);
  };

  const allVisibleSelected = items.length > 0 && items.every((row) => selected.has(row.id));
  const toggleAll = () =>
    setSelected((previous) => {
      const next = new Map(previous);
      items.forEach((row) => (allVisibleSelected ? next.delete(row.id) : next.set(row.id, row)));
      return next;
    });
  const toggleOne = (row) =>
    setSelected((previous) => {
      const next = new Map(previous);
      if (next.has(row.id)) next.delete(row.id);
      else next.set(row.id, row);
      return next;
    });

  const flash = (message) => {
    setActionError("");
    setNotice(message);
  };

  const exportCsv = async () => {
    setIsExporting(true);
    setActionError("");
    try {
      const csv = await exportAdminCustomers(
        {
          q: query.trim() || undefined,
          segment: segment === "all" ? undefined : segment,
          country: country || undefined,
          period: period === "all" ? undefined : period,
          sort: sortParam,
        },
        accessToken,
      );
      downloadCsv(csv, "zeedara-customers.csv");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const saveEdit = async (patch) => {
    await updateAdminCustomer(editing.id, patch, accessToken);
    setEditing(null);
    flash(`Saved changes to ${fullName({ ...editing, ...patch })}.`);
    reload();
  };

  const runConfirmed = async () => {
    const { kind, customer } = confirming;
    if (kind === "delete") await deleteAdminCustomer(customer.id, accessToken);
    else await setAdminCustomerBlocked(customer.id, kind === "block", accessToken);
    setConfirming(null);
    setSelected((previous) => {
      const next = new Map(previous);
      next.delete(customer.id);
      return next;
    });
    flash(
      {
        block: `${fullName(customer)} has been blocked.`,
        unblock: `${fullName(customer)} has been unblocked.`,
        delete: `${fullName(customer)} has been deleted.`,
      }[kind],
    );
    reload();
  };

  const periodLabel = PERIODS.find((option) => option.key === period)?.label;
  const countryLabel = country
    ? `${country}${(() => {
        const match = countries.find((option) => option.country === country);
        return match ? ` (${match.count})` : "";
      })()}`
    : "All countries";

  const subtitle = `${summary.customers} customer${summary.customers === 1 ? "" : "s"} · ${
    summary.ordered
  } have ordered · ${summary.joined_last_30_days} joined in the last 30 days`;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Seo title="Customers" description="Zeedara admin customer list." noindex />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 leading-[1.4]">
          <h1 className="text-[24px] font-bold text-[#262626]">Customers</h1>
          <p className="text-[12px] font-medium text-[#667085]">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            align="right"
            label="Joined"
            trigger={({ isOpen, toggle, ref }) => (
              <FilterButton
                label={periodLabel}
                isOpen={isOpen}
                toggle={toggle}
                buttonRef={ref}
                className="min-w-[136px] text-[14px] font-semibold"
              />
            )}
          >
            {(close) =>
              PERIODS.map((option) => (
                <DropdownItem
                  key={option.key}
                  role="menuitemradio"
                  aria-checked={option.key === period}
                  selected={option.key === period}
                  onClick={() => {
                    resetPage(setPeriod)(option.key);
                    close();
                  }}
                >
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
        <p
          role={actionError ? "alert" : "status"}
          className={`px-4 py-3 text-[13px] font-medium ${
            actionError ? "bg-[#fae9e9] text-[#cf251f]" : "bg-[#eefeec] text-[#0f9959]"
          }`}
        >
          {actionError || notice}
        </p>
      )}

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total lifetime value"
          value={formatNairaShort(toAmount(summary.lifetime_value))}
          note="Excludes cancelled orders"
          icon={Banknote}
          iconBg="rgba(255,105,0,0.1)"
          iconColor="#ff6900"
        />
        <StatCard
          label="Average spend"
          value={formatNairaShort(toAmount(summary.average_per_customer))}
          note="per paying customer"
          icon={ShoppingCart}
          iconBg="#eff8ff"
          iconColor="#2e90fa"
        />
        <StatCard
          label="Repeat customers"
          value={summary.repeat_customers.toLocaleString("en-NG")}
          note="more than one order"
          icon={Repeat}
          iconBg="#f4f3ff"
          iconColor="#7a5af8"
        />
      </div>

      {/* Segment tabs — scroll sideways on a phone rather than wrapping. */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {SEGMENTS.map((option) => (
          <CountTab
            key={option.key}
            label={option.label}
            count={counts[option.key]}
            isActive={option.key === segment}
            onClick={() => resetPage(setSegment)(option.key)}
          />
        ))}
      </div>

      <div className="min-w-0 border border-[#f0f1f3] bg-white shadow-[0px_1px_1px_rgba(16,24,40,0.05)]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#f0f1f3] p-4 sm:gap-6">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 border border-[#dadde2] px-[13px] focus-within:border-(--primary-color) sm:max-w-[254px]">
            <Search className="size-5 shrink-0 text-[#9fa5b2]" strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search customers"
              placeholder="Name, email, phone or city…"
              value={query}
              onChange={(event) => resetPage(setQuery)(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-black placeholder:text-[#9fa5b2] focus:outline-none"
            />
          </label>
          <Dropdown
            label="Country"
            trigger={({ isOpen, toggle, ref }) => (
              <FilterButton
                label={countryLabel}
                isOpen={isOpen}
                toggle={toggle}
                buttonRef={ref}
                className="min-w-[136px] max-w-full"
              />
            )}
          >
            {(close) => (
              <>
                <DropdownItem
                  tone="strong"
                  selected={!country}
                  onClick={() => {
                    resetPage(setCountry)("");
                    close();
                  }}
                >
                  All
                </DropdownItem>
                {countries.map((option) => (
                  <DropdownItem
                    key={option.country}
                    tone="strong"
                    selected={option.country === country}
                    onClick={() => {
                      resetPage(setCountry)(option.country);
                      close();
                    }}
                  >
                    {option.country} ({option.count})
                  </DropdownItem>
                ))}
              </>
            )}
          </Dropdown>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f1f3] bg-[#faf4eb] px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[14px] font-semibold text-[#865c18]">{selected.size} selected</p>
              <button
                type="button"
                onClick={() => downloadCsv(rowsToCsv([...selected.values()]), "zeedara-customers-selected.csv")}
                className="flex h-9 cursor-pointer items-center gap-2 border border-[#dadde2] bg-white px-3 text-[14px] font-medium text-[#48505e] transition-colors hover:text-black"
              >
                <Download className="size-4" strokeWidth={2} />
                Export selected
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSelected(new Map())}
              className="cursor-pointer text-[14px] font-semibold text-[#48505e] transition-colors hover:text-black"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* relative: the header's sr-only label is absolutely positioned and
            would otherwise escape this scroller and widen the whole page. */}
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#f0f1f3] bg-[#fcfcfc]">
                <th scope="col" className="w-[44px] py-[11px] pl-4">
                  <input
                    type="checkbox"
                    aria-label="Select all customers on this page"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    className="size-4 cursor-pointer align-middle accent-(--primary-color)"
                  />
                </th>
                {COLUMNS.map((column) => {
                  const isSorted = sort.key === column.key;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                      className={`px-3 py-[11px] ${column.align === "right" ? "text-right" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => applySort(column.key)}
                        className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap text-[12px] font-semibold leading-[1.4] transition-colors hover:text-[#262626] ${
                          isSorted ? "text-[#262626]" : "text-[#667085]"
                        }`}
                      >
                        {column.label}
                        <ChevronDown
                          className={`size-4 transition-transform ${
                            isSorted && sort.direction === "asc" ? "rotate-180" : ""
                          }`}
                          strokeWidth={1.75}
                        />
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="w-[50px]">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={COLUMNS.length + 2} className="px-4 py-16 text-center text-[14px] text-[#828a9b]">
                    Loading customers…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={COLUMNS.length + 2} className="px-4 py-16 text-center text-[14px] text-[#cf251f]">
                    {error}{" "}
                    <button type="button" onClick={reload} className="cursor-pointer font-semibold underline">
                      Try again
                    </button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 2} className="px-4 py-16 text-center text-[14px] text-[#828a9b]">
                    No customers match these filters.
                  </td>
                </tr>
              ) : (
                items.map((row) => {
                  const isSelected = selected.has(row.id);
                  const name = fullName(row);
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-[#f0f1f3] text-[12px] font-semibold leading-[1.4] text-[#575f71] ${
                        isSelected ? "bg-[#faf4eb]" : "hover:bg-[#fcfcfc]"
                      }`}
                    >
                      <td className="py-3 pl-4">
                        <input
                          type="checkbox"
                          aria-label={`Select ${name}`}
                          checked={isSelected}
                          onChange={() => toggleOne(row)}
                          className="size-4 cursor-pointer align-middle accent-(--primary-color)"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex min-w-[180px] items-center gap-[11px]">
                          <span
                            className="flex size-8 shrink-0 items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
                            style={{ backgroundImage: "linear-gradient(145deg, #cb9b4a 6%, #a66f17 94%)" }}
                          >
                            {initialsFor(row)}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/admin/customers/${row.id}`}
                                className="truncate text-black hover:text-(--primary-color) hover:underline"
                              >
                                {name}
                              </Link>
                              <Badge kind={row.is_active ? row.segment : "blocked"} />
                            </div>
                            <p title={row.email} className="max-w-[170px] truncate font-medium text-[#828a9b]">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[130px] px-3 py-3">{locationOf(row)}</td>
                      <td className="px-3 py-3">{row.orders}</td>
                      <td className="px-3 py-3 text-right whitespace-nowrap text-black">
                        {formatAmount(row.lifetime_spend)}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap text-black">{formatAmount(row.aov)}</td>
                      <td className="px-3 py-3">{relativeTime(row.last_order_at)}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{formatDate(row.joined_at)}</td>
                      <td className="px-2 py-3 text-center">
                        <RowMenu
                          customer={row}
                          onEdit={setEditing}
                          onConfirm={(kind, customer) => setConfirming({ kind, customer })}
                        />
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
            Showing{" "}
            <span className="font-semibold text-black">
              {total === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, total)}
            </span>{" "}
            of <span className="font-semibold text-black">{total}</span>
          </p>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </div>

      {/* Customer details panel (child route /admin/customers/:customerId). */}
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>

      {editing && (
        <EditCustomerDialog customer={editing} onClose={() => setEditing(null)} onSave={saveEdit} />
      )}
      {confirming && (
        <ConfirmCustomerDialog
          kind={confirming.kind}
          customer={confirming.customer}
          onClose={() => setConfirming(null)}
          onConfirm={runConfirmed}
        />
      )}
    </div>
  );
}

export default Customers;
