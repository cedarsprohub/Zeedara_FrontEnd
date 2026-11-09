import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStickyNavHeight } from "../../context/NavbarHeightContext";
import { useAuth } from "../../context/AuthContext.js";
import { logout as logoutRequest } from "../../api/auth";
import NavIcon from "./NavIcon";

// Nav items with a `to` are real routes; the rest are placeholders until
// their screens are built. `match` lists extra pathnames that should mark the
// item active (used so "Account Overview" highlights on both `/account` and
// `/account/overview`). `mobileOnly` mirrors the design: Reviews is on the
// mobile menu but not in the desktop rail.
const primaryNav = [
  {
    label: "Account Overview",
    icon: "user",
    to: "/account/overview",
    match: ["/account", "/account/overview"],
  },
  { label: "Orders", icon: "box", to: "/account/orders" },
  { label: "Reviews", icon: "reviews", mobileOnly: true },
  { label: "Custom Hair Requests", icon: "hair", to: "/account/custom-hair" },
  {
    label: "Skincare Consultations",
    icon: "support",
    to: "/account/skincare-consultations",
  },
];

const secondaryNav = [
  { label: "Address Book", to: "/account/address-book" },
  { label: "Settings", to: "/account/settings" },
];

// Mobile: a plain list row — 14px label, gold icon, grey chevron, no active
// state (it's a menu page, not a rail). Desktop: the side rail — 16px label,
// dark icon, and the active item gets the amber left border and tint.
const itemClasses = (active, mobileOnly) =>
  `${mobileOnly ? "flex lg:hidden" : "flex"} items-center gap-2 px-2 py-3 text-left text-[14px] font-medium leading-[1.4] text-black transition-colors lg:gap-3 lg:border-l-4 lg:px-4 lg:text-[16px] ${
    active
      ? "lg:border-(--primary-color) lg:bg-[#faf4eb]"
      : "lg:border-transparent lg:hover:bg-[#faf4eb]"
  }`;

function NavItem({ item, active }) {
  const { label, icon, to, mobileOnly } = item;
  const content = (
    <>
      {icon && (
        <NavIcon
          name={icon}
          className="text-(--primary-color) lg:text-[#141b34]"
        />
      )}
      <span className="min-w-0 flex-1">{label}</span>
      {/* Chevron only on the mobile menu */}
      <NavIcon name="chevron" className="text-[#9fa5b2] lg:hidden" />
    </>
  );

  return to ? (
    <NavLink to={to} className={itemClasses(active, mobileOnly)}>
      {content}
    </NavLink>
  ) : (
    <button
      type="button"
      className={`${itemClasses(false, mobileOnly)} w-full cursor-pointer`}
    >
      {content}
    </button>
  );
}

// Inset on the mobile menu, full-bleed in the desktop rail.
function Divider() {
  return <span className="mx-4 block h-px bg-[#dadde2] lg:mx-0" />;
}

function AccountSidebar({ isRoot }) {
  const stickyNavHeight = useStickyNavHeight();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, accessToken, refreshToken, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const isItemActive = (item) =>
    item.match
      ? item.match.includes(pathname)
      : pathname === item.to || pathname.startsWith(`${item.to}/`);

  // Revoking the refresh token is a network round-trip, so guard against a
  // second click landing before we navigate away.
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      if (refreshToken) await logoutRequest(refreshToken, accessToken);
    } catch {
      // Ignore — we still clear the local session below regardless.
    } finally {
      logout();
      navigate("/");
    }
  };

  return (
    // On mobile the sidebar becomes the full-width account menu, shown only at
    // the `/account` root. On desktop it's the pinned side rail (`lg:sticky`),
    // always visible. `top` sits just below the pinned main nav.
    <aside
      className={`w-full shrink-0 flex-col gap-[25px] bg-white pt-2 lg:sticky lg:flex lg:w-[318px] lg:self-start lg:py-3 ${
        isRoot ? "flex" : "hidden"
      }`}
      style={{ top: `${stickyNavHeight + 24}px` }}
    >
      {/* Welcome heading — only on the mobile menu page; on desktop it lives in
          the Overview content instead. */}
      <div className="flex flex-col gap-1 lg:hidden">
        <h1 className="flex flex-wrap items-center gap-x-2 text-[20px] font-semibold leading-[1.4]">
          <span className="text-black">Welcome back,</span>
          <span className="text-(--primary-color)">
            {user?.first_name || "there"}
          </span>
        </h1>
        <p className="max-w-[258px] text-[14px] font-medium leading-[1.4] text-[#667085]">
          Here&rsquo;s a quick look at your latest account activity.
        </p>
      </div>

      <nav aria-label="Account" className="flex flex-col gap-2">
        {primaryNav.map((item) => (
          <NavItem key={item.label} item={item} active={isItemActive(item)} />
        ))}

        <Divider />

        {secondaryNav.map((item) => (
          <NavItem key={item.label} item={item} active={isItemActive(item)} />
        ))}

        <Divider />

        <div className="px-2 lg:px-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-10 w-full cursor-pointer items-center justify-center bg-[#fae9e9] px-4 text-[14px] font-semibold leading-[1.4] text-[#cf251f] transition-colors hover:bg-[#f5d6d6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </nav>
    </aside>
  );
}

function AccountLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // The account root shows the menu on mobile; sub-routes show their content.
  const isRoot = pathname === "/account" || pathname === "/account/";
  // Mobile Back goes up to the section a screen belongs to (a form back to its
  // list, an order back to Orders), and from a section to the account menu.
  const segments = pathname.split("/").filter(Boolean);
  const backTo =
    segments.length > 2 ? `/${segments.slice(0, 2).join("/")}` : "/account";

  return (
    // White panels on an off-white page on desktop; plain white on mobile.
    <section className="account mb-16 bg-white lg:bg-[#fcfcfc]">
      <div className="mx-auto w-full max-w-[1920px] px-4 py-4 md:px-[clamp(1rem,6.25vw,7.5rem)] lg:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-[18px]">
          <AccountSidebar isRoot={isRoot} />

          {/* Content — each account screen renders here. On mobile it's hidden
              at the root (the menu takes over) and shown on sub-routes. */}
          <div
            className={`min-w-0 flex-1 bg-white lg:block ${
              isRoot ? "hidden" : "block"
            }`}
          >
            {/* Mobile only (desktop keeps the rail): up one level, see `backTo`. */}
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="mb-[25px] flex cursor-pointer items-center gap-2 p-3 text-[12px] font-semibold leading-[1.4] text-(--primary-color) lg:hidden"
            >
              <NavIcon
                name="back"
                box={16}
                glyphClassName="-rotate-90 -scale-x-100"
              />
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
