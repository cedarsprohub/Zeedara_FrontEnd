import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { useAdminAuth } from "../../../../context/AdminAuthContext.js";
import { getAdminCustomerProfile } from "../../../../api/admin/customers";
import { formatDate, fullName } from "../data";
import { ClinicTab, CustomWigsTab, OrdersTab, OverviewTab, ReviewsTab } from "./DetailTabs";

const TABS = [
  { key: "overview", label: "Overview", Panel: OverviewTab },
  { key: "orders", label: "Orders", count: "orders", Panel: OrdersTab },
  { key: "clinic", label: "Clinic", count: "clinic", Panel: ClinicTab },
  { key: "custom-wigs", label: "Custom wigs", count: "custom_wigs", Panel: CustomWigsTab },
  { key: "reviews", label: "Reviews", count: "reviews", Panel: ReviewsTab },
];

// The Customer details panel, opened over the Customers list at
// /admin/customers/:customerId (child route, so the list underneath keeps its
// filters and scroll). `?tab=` picks the tab, so "View orders" can deep-link.
function CustomerDetailPanel() {
  const { customerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { accessToken } = useAdminAuth();
  const titleId = useId();
  const closeRef = useRef(null);

  const tab = TABS.some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") : "overview";
  const setTab = (key) =>
    setSearchParams(key === "overview" ? {} : { tab: key }, { replace: true });

  // Answer stamped with the id it's for, so switching customers shows the
  // loading state rather than the previous customer's profile.
  const [result, setResult] = useState(null);
  const isFresh = result?.id === customerId;

  useEffect(() => {
    if (!accessToken) return undefined;
    let active = true;
    getAdminCustomerProfile(customerId, accessToken)
      .then((profile) => active && setResult({ id: customerId, profile, error: "" }))
      .catch(
        (err) =>
          active &&
          setResult({
            id: customerId,
            profile: null,
            error: err.status === 404 ? "This customer no longer exists." : err.message || "Couldn't load this customer.",
          }),
      );
    return () => {
      active = false;
    };
  }, [customerId, accessToken]);

  const close = useCallback(() => navigate({ pathname: "/admin/customers" }), [navigate]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close]);

  const profile = isFresh ? result.profile : null;
  const customer = profile?.customer;
  const ActivePanel = TABS.find((t) => t.key === tab).Panel;

  return (
    // Scrim covers the sidebar too (z above its z-40); the panel sits over the
    // content column on desktop and fills the screen on a phone.
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 lg:pl-[287px]" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="relative mx-auto flex min-h-full w-full max-w-[992px] flex-col bg-white shadow-[0px_24px_24px_rgba(16,24,40,0.18)] sm:min-h-0 sm:rounded-b-[4px]"
      >
        <header className="flex items-start gap-[14px] px-4 py-5 sm:px-6">
          <div className="min-w-0 flex-1 leading-[1.4]">
            <h2 id={titleId} className="truncate text-[14px] font-semibold text-black">
              {customer ? fullName(customer) : isFresh ? "Customer" : "Loading…"}
            </h2>
            {customer && (
              <p className="truncate pt-[3px] text-[12px] font-medium text-[#828a9b]">
                {customer.email} · joined {formatDate(customer.joined_at)}
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close customer details"
            className="flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#48505e] transition-colors hover:bg-[#f9fafb] hover:text-black"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-4 px-4 pb-5 sm:px-6">
          {/* Tabs scroll sideways on a phone rather than wrapping. */}
          <div
            role="tablist"
            aria-label="Customer details"
            className="flex overflow-x-auto border-b-[0.667px] border-[#eaecf0] [scrollbar-width:none] sm:self-start"
          >
            {TABS.map((option) => {
              const isActive = option.key === tab;
              const count = option.count ? profile?.counts[option.count] : null;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(option.key)}
                  className={`-mb-px flex shrink-0 cursor-pointer items-center justify-center gap-[7px] border-b-2 px-[15px] py-2 text-[12px] font-semibold leading-[1.4] whitespace-nowrap transition-colors sm:min-w-[104px] ${
                    isActive
                      ? "border-(--primary-color) text-(--primary-color)"
                      : "border-transparent text-[#667085] hover:text-[#262626]"
                  }`}
                >
                  {option.label}
                  {count !== null && count !== undefined && (
                    <span
                      className={`flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 ${
                        isActive ? "bg-[#faf4eb] text-(--primary-color)" : "bg-[#f0f1f3] text-[#575f71]"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="min-w-0">
            {!isFresh ? (
              <p className="py-16 text-center text-[14px] text-[#828a9b]">Loading customer…</p>
            ) : result.error ? (
              <p role="alert" className="py-16 text-center text-[14px] text-[#cf251f]">
                {result.error}
              </p>
            ) : (
              <ActivePanel profile={profile} />
            )}
          </div>
        </div>

        <footer className="sticky bottom-0 flex border-t-[0.667px] border-[#f0f1f3] bg-[#fcfcfc] px-[22px] py-4 sm:rounded-b-[4px]">
          <button
            type="button"
            onClick={close}
            className="flex h-10 cursor-pointer items-center justify-center rounded-[2px] border border-[#dadde2] bg-white px-3 text-[14px] font-semibold text-[#48505e] transition-colors hover:border-[#9fa5b2] hover:text-black"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

export default CustomerDetailPanel;
