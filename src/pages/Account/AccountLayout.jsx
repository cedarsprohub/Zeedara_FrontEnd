import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Package,
  Star,
  MessageSquare,
  Headphones,
  RotateCcw,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useStickyNavHeight } from "../../context/NavbarHeightContext";

// Nav items with a `to` are real routes; the rest are placeholders until
// their screens are built. `match` lists extra pathnames that should mark the
// item active (used so "Account Overview" highlights on both `/account` and
// `/account/overview`).
const primaryNav = [
  {
    label: "Account Overview",
    icon: User,
    to: "/account/overview",
    match: ["/account", "/account/overview"],
  },
  { label: "Orders", icon: Package, to: "/account/orders" },
  { label: "Reviews", icon: Star },
  { label: "Custom Hair Requests", icon: MessageSquare, to: "/account/custom-hair" },
  { label: "Skincare Consultations", icon: Headphones },
  { label: "Returns and Refunds", icon: RotateCcw },
];

const secondaryNav = ["Address Book", "Settings"];

function AccountSidebar({ isRoot }) {
  const stickyNavHeight = useStickyNavHeight();
  const { pathname } = useLocation();

  const isItemActive = (item) =>
    item.match
      ? item.match.includes(pathname)
      : pathname === item.to || pathname.startsWith(`${item.to}/`);

  return (
    // On mobile the sidebar becomes the full-width account menu, shown only at
    // the `/account` root. On desktop it's the pinned side rail (`lg:sticky`),
    // always visible. `top` sits just below the pinned main nav.
    <aside
      className={`w-full shrink-0 bg-white lg:sticky lg:block lg:w-[318px] lg:self-start ${
        isRoot ? "block" : "hidden"
      }`}
      style={{ top: `${stickyNavHeight + 24}px` }}
    >
      {/* Welcome heading — only on the mobile menu page; on desktop it lives in
          the Overview content instead. */}
      <div className="mb-6 flex flex-col gap-1 lg:hidden">
        <h1 className="flex flex-wrap items-center gap-2 text-[18px] font-semibold leading-[1.4]">
          <span className="text-black">Welcome back,</span>
          <span className="text-(--primary-color)">Desmond</span>
        </h1>
        <p className="text-[14px] text-[#667085]">
          Here&rsquo;s a quick look at your latest account activity.
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {primaryNav.map((item) => {
          const { label, icon: Icon, to } = item;
          const base =
            "flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-black transition-colors lg:border-l-4 lg:text-[16px]";
          const content = (active) => (
            <>
              <Icon className="size-5 shrink-0" strokeWidth={2} />
              <span className="flex-1">{label}</span>
              {/* Right chevron only on the mobile menu */}
              <ChevronRight
                className={`size-5 shrink-0 lg:hidden ${
                  active ? "text-(--primary-color)" : "text-[#667085]"
                }`}
              />
            </>
          );

          return to ? (
            <NavLink
              key={label}
              to={to}
              className={() =>
                `${base} ${
                  isItemActive(item)
                    ? "lg:border-(--primary-color) lg:bg-[#faf4eb]"
                    : "lg:border-transparent lg:hover:bg-[#faf4eb]"
                }`
              }
            >
              {content(isItemActive(item))}
            </NavLink>
          ) : (
            <button
              key={label}
              type="button"
              className={`${base} cursor-pointer text-left lg:border-transparent lg:hover:bg-[#faf4eb]`}
            >
              {content(false)}
            </button>
          );
        })}
      </nav>

      <span className="my-2 block h-px w-full bg-[#dadde2]" />

      <div className="flex flex-col gap-2">
        {secondaryNav.map((label) => (
          <button
            key={label}
            type="button"
            className="flex items-center gap-3 px-4 py-3 text-left text-[14px] font-medium text-black transition-colors hover:text-(--primary-color) lg:text-[16px]"
          >
            <span className="flex-1">{label}</span>
            <ChevronRight className="size-5 shrink-0 text-[#667085] lg:hidden" />
          </button>
        ))}
      </div>

      <span className="my-3 block h-px w-full bg-[#dadde2]" />

      <div className="px-4">
        <button
          type="button"
          className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#fae9e9] px-4 text-[14px] font-semibold text-[#cf251f] transition-colors hover:bg-[#f5d6d6]"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function AccountLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // The account root shows the menu on mobile; sub-routes show their content.
  const isRoot = pathname === "/account" || pathname === "/account/";

  return (
    <section className="account mb-16 bg-white">
      <div className="mx-auto w-full max-w-[1920px] px-[clamp(1rem,6.25vw,7.5rem)] py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-[16px]">
          <AccountSidebar isRoot={isRoot} />

          {/* Content — each account screen renders here. On mobile it's hidden
              at the root (the menu takes over) and shown on sub-routes. */}
          <div
            className={`min-w-0 flex-1 bg-white lg:block ${
              isRoot ? "hidden" : "block"
            }`}
          >
            {/* Back button returns to the mobile menu; desktop keeps the rail. */}
            <button
              type="button"
              onClick={() => navigate("/account")}
              className="mb-4 flex cursor-pointer items-center gap-2 p-3 text-[12px] font-semibold text-(--primary-color) lg:hidden"
            >
              <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
              Back
            </button>
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AccountLayout;
