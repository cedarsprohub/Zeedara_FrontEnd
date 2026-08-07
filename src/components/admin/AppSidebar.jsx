import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Tag,
  GalleryHorizontal,
  Image,
  ShoppingCart,
  CreditCard,
  Truck,
  Ticket,
  RotateCcw,
  Users,
  Star,
  LifeBuoy,
  Scissors,
  FlaskConical,
  Images,
  Settings,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";
import logo from "../../assets/navbar/zeedara_logo.png";
import { useAdminAuth } from "../../context/AdminAuthContext.js";
import {
  adminDisplayName,
  adminInitial,
  adminRoleLabel,
} from "./adminIdentity";

// Grouped exactly as the design lays them out. `children` marks an item that
// expands; the sub-items sit flush under it rather than in their own group.
const NAV_GROUPS = [
  {
    items: [
      { label: "Dashboard", to: "/admin", end: true, icon: LayoutDashboard },
    ],
  },
  {
    heading: "Catalog",
    items: [
      { label: "Products", to: "/admin/products", icon: LayoutDashboard },
      { label: "Categories", to: "/admin/categories", icon: Tag },
      {
        label: "Product Sliders",
        to: "/admin/sliders",
        icon: GalleryHorizontal,
      },
      { label: "Media", to: "/admin/media", icon: Image },
    ],
  },
  {
    heading: "Sales",
    items: [
      {
        label: "Orders",
        to: "/admin/orders",
        icon: ShoppingCart,
        children: [{ label: "Analytics", to: "/admin/orders/analytics" }],
      },
      { label: "Payments", to: "/admin/payments", icon: CreditCard },
      { label: "Shipping", to: "/admin/shipping", icon: Truck },
      { label: "Coupons", to: "/admin/coupons", icon: Ticket },
      { label: "Returns/Refund", to: "/admin/returns", icon: RotateCcw },
    ],
  },
  {
    heading: "Customers",
    items: [
      { label: "Customers", to: "/admin/customers", icon: Users },
      { label: "Reviews", to: "/admin/reviews", icon: Star },
      { label: "Support", to: "/admin/support", icon: LifeBuoy },
    ],
  },
  {
    heading: "Services",
    items: [
      { label: "Customer Hair", to: "/admin/custom-hair", icon: Scissors },
      {
        label: "Skincare Clinic",
        to: "/admin/skincare-clinic",
        icon: FlaskConical,
      },
    ],
  },
  {
    divider: true,
    items: [{ label: "Banners", to: "/admin/banners", icon: Images }],
  },
];

// Active and resting states are the same two rules everywhere in the sidebar,
// so they live here rather than being repeated per item.
const itemClass = ({ isActive }) =>
  `flex w-full items-center gap-1.5 px-3 py-3 text-[14px] transition-colors ${
    isActive
      ? "bg-[#262626] font-bold text-[#ca9949]"
      : "font-medium text-[#828a9b] hover:bg-[#262626] hover:text-[#e3caa1]"
  }`;

function NavItem({ item }) {
  const [isOpen, setIsOpen] = useState(Boolean(item.children));
  const Icon = item.icon;

  return (
    <>
      <div className="flex items-center">
        <NavLink to={item.to} end={item.end} className={itemClass}>
          <Icon className="size-5 shrink-0" strokeWidth={1.75} />
          <span className="flex-1 text-left">{item.label}</span>
          {item.children && (
            <ChevronDown
              // The chevron is inside the link's row but toggles rather than
              // navigates, so it swallows the click.
              onClick={(event) => {
                event.preventDefault();
                setIsOpen((value) => !value);
              }}
              className={`size-4 shrink-0 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </NavLink>
      </div>

      {item.children &&
        isOpen &&
        item.children.map((child) => (
          <NavLink
            key={child.to}
            to={child.to}
            className={({ isActive }) =>
              `block py-2.5 pl-12 text-[14px] transition-colors ${
                isActive
                  ? "font-bold text-[#ca9949]"
                  : "font-medium text-[#828a9b] hover:text-[#e3caa1]"
              }`
            }
          >
            {child.label}
          </NavLink>
        ))}
    </>
  );
}

function AppSidebar({ isOpen, onClose }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { admin, signOut } = useAdminAuth();

  // Clearing the session is what trips RequireAdminAuth into redirecting, so
  // there's no navigate() to pair with this.
  const handleSignOut = () => {
    setIsProfileOpen(false);
    signOut();
  };

  return (
    <>
      {/* Below lg the sidebar is an overlay drawer; the scrim only exists there. */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/50 lg:hidden ${
          isOpen ? "" : "pointer-events-none opacity-0"
        } transition-opacity`}
      />

      <aside
        // Pinned to the viewport at every size: an overlay drawer below lg, a
        // sticky full-height column above it. Without the sticky it scrolls
        // away with the page, which on a dashboard means losing the nav.
        className={`fixed inset-y-0 left-0 z-40 flex w-[287px] shrink-0 flex-col bg-[#1f1f1f] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-6">
          <img
            src={logo}
            alt="Zeedara"
            className="h-[26px] w-[132px] object-contain"
          />
          <span className="text-[10px] font-medium tracking-[0.08em] text-[#828a9b] uppercase">
            Admin Console
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#4a4a4a] pb-4">
          {NAV_GROUPS.map((group, index) => (
            <div key={group.heading || index}>
              {group.divider && <hr className="mx-6 my-3 border-[#2e323c]" />}
              {group.heading && (
                <p className="px-6 pt-4 pb-2 text-[12px] font-medium text-[#828a9b]">
                  {group.heading}
                </p>
              )}
              {group.items.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setIsSettingsOpen((value) => !value)}
            className="flex w-full cursor-pointer items-center gap-1.5 px-3 py-3 text-[14px] font-medium text-[#828a9b] transition-colors hover:bg-[#262626] hover:text-[#e3caa1]"
          >
            <Settings className="size-5 shrink-0" strokeWidth={1.75} />
            <span className="flex-1 text-left">Settings</span>
            <ChevronDown
              className={`size-4 shrink-0 transition-transform ${
                isSettingsOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </nav>

        <div className="relative">
          {isProfileOpen && (
            <div className="absolute right-3 bottom-full left-3 mb-2 bg-[#262626] py-1 shadow-lg">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-[14px] font-medium text-[#828a9b] transition-colors hover:text-[#e3caa1]"
              >
                <LogOut className="size-4 shrink-0" strokeWidth={1.75} />
                Sign out
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsProfileOpen((value) => !value)}
            aria-expanded={isProfileOpen}
            className="flex w-full cursor-pointer items-center gap-3 bg-[#262626] px-6 py-3 text-left"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ca9949] text-[14px] font-bold text-[#1f1f1f]">
              {adminInitial(admin)}
            </span>
            {/* Kept in step with the topbar's profile block — the same account,
              so the two shouldn't be set at different sizes. */}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold text-white">
                {adminDisplayName(admin)}
              </span>
              <span className="block truncate text-[11px] font-medium text-[#828a9b]">
                {adminRoleLabel(admin)}
              </span>
            </span>
            {isProfileOpen ? (
              <ChevronUp className="size-4 shrink-0 text-[#828a9b]" />
            ) : (
              <ChevronDown className="size-4 shrink-0 text-[#828a9b]" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default AppSidebar;
