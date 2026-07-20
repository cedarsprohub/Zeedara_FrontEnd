import { NavLink, Outlet } from "react-router-dom";
import {
  User,
  Package,
  Star,
  MessageSquare,
  Headphones,
  RotateCcw,
} from "lucide-react";

// Nav items with a `to` are real routes; the rest are placeholders until
// their screens are built.
const primaryNav = [
  { label: "Account Overview", icon: User, to: "/account", end: true },
  { label: "Orders", icon: Package, to: "/account/orders" },
  { label: "Reviews", icon: Star },
  { label: "Custom Hair Requests", icon: MessageSquare },
  { label: "Skincare Consultations", icon: Headphones },
  { label: "Returns and Refunds", icon: RotateCcw },
];

const secondaryNav = ["Address Book", "Settings"];

function AccountSidebar() {
  return (
    // `self-start` + `sticky` keeps the sidebar pinned while the page content
    // scrolls underneath it.
    <aside className="w-full shrink-0 bg-white lg:sticky lg:top-6 lg:w-[300px] lg:self-start">
      <nav className="flex flex-col">
        {primaryNav.map(({ label, icon: Icon, to, end }) => {
          const base =
            "flex items-center gap-2 border-l-4 px-4 py-3 text-[14px] font-medium text-black transition-colors";
          const content = (
            <>
              <Icon className="size-5 shrink-0" strokeWidth={2} />
              <span>{label}</span>
            </>
          );

          return to ? (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${base} ${
                  isActive
                    ? "border-(--primary-color) bg-[#faf4eb]"
                    : "border-transparent hover:bg-[#faf4eb]"
                }`
              }
            >
              {content}
            </NavLink>
          ) : (
            <button
              key={label}
              type="button"
              className={`${base} cursor-pointer border-transparent text-left hover:bg-[#faf4eb]`}
            >
              {content}
            </button>
          );
        })}
      </nav>

      <span className="my-2 block h-px w-full bg-[#dadde2]" />

      <div className="flex flex-col">
        {secondaryNav.map((label) => (
          <button
            key={label}
            type="button"
            className="cursor-pointer px-4 py-3 text-left text-[14px] font-medium text-black transition-colors hover:text-(--primary-color)"
          >
            {label}
          </button>
        ))}
      </div>

      <span className="my-3 block h-px w-full bg-[#dadde2]" />

      <div className="px-4">
        <button
          type="button"
          className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#cf251f] px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function AccountLayout() {
  return (
    <section className="account bg-white">
      <div className="mx-auto w-full max-w-[1920px] px-[clamp(1rem,6.25vw,7.5rem)] py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-[16px]">
          <AccountSidebar />

          {/* Content — each account screen renders here */}
          <div className="min-w-0 flex-1 bg-white">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AccountLayout;
