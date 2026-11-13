import { Link } from "react-router-dom";
import {
  Activity,
  Bell,
  ExternalLink,
  LogOut,
  PanelLeft,
  Search,
  Settings,
  Store,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.js";
import Dropdown, { DropdownDivider, DropdownItem } from "./Dropdown";
import {
  adminDisplayName,
  adminInitial,
  adminRoleLabel,
} from "./adminIdentity";

function AppTopbar({ onToggleSidebar }) {
  const { admin, signOut } = useAdminAuth();

  return (
    <header className="sticky top-0 z-20 flex h-[82px] shrink-0 items-center gap-2 border-b border-[#f0f1f3] bg-white px-4 sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        className="shrink-0 cursor-pointer p-1.5 text-[#48505e] transition-colors hover:text-black"
      >
        <PanelLeft className="size-5" strokeWidth={1.75} />
      </button>

      {/* min-w-0 lets the field shrink below its placeholder on narrow screens
          instead of forcing the whole bar wider than the viewport. */}
      <div className="flex h-[41px] min-w-0 max-w-[602px] flex-1 items-center gap-2 border border-[#f0f1f3] bg-[#f9fafb] px-3 focus-within:border-[#dadde2]">
        <Search className="size-5 shrink-0 text-[#828a9b]" strokeWidth={1.75} />
        <input
          type="search"
          aria-label="Search orders, products, customers"
          placeholder="Search orders, products, customers..."
          className="min-w-0 flex-1 bg-transparent text-[14px] text-[#262626] placeholder:text-[#828a9b] focus:outline-none"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-4">
        {/* The storefront is a different app surface, so this leaves the
            dashboard rather than routing inside it. Dropped on phones, where
            the bar has no room to spare and the storefront is a tab away. */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View storefront"
          title="View storefront"
          className="hidden p-2 text-[#48505e] transition-colors hover:text-black sm:block"
        >
          <ExternalLink className="size-5" strokeWidth={1.75} />
        </a>

        <Link
          to="/admin/notifications"
          aria-label="Notifications"
          className="relative p-2 text-[#48505e] transition-colors hover:text-black"
        >
          <Bell className="size-6" strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#f04438]" />
        </Link>

        <Dropdown
          align="right"
          width={212}
          label="Profile options"
          trigger={({ isOpen, toggle, ref }) => (
            <button
              ref={ref}
              type="button"
              onClick={toggle}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-label="Profile options"
              className="flex cursor-pointer items-center gap-2 rounded text-left sm:gap-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ca9949] text-[14px] font-bold text-white sm:size-10">
                {adminInitial(admin)}
              </span>
              {/* 14px/11px rather than the design's 16px/12px — at 16px the name
                  outweighed the 14px nav and page copy around it. */}
              <span className="hidden max-w-[160px] sm:block">
                <span className="block truncate text-[14px] font-semibold text-[#262626]">
                  {adminDisplayName(admin)}
                </span>
                <span className="block truncate text-[11px] font-medium text-[#828a9b]">
                  {adminRoleLabel(admin)}
                </span>
              </span>
            </button>
          )}
        >
          {(close) => (
            <>
              <div className="mb-1 flex flex-col border-b border-[#eaecf0] px-2 py-3 leading-[1.4]">
                <span className="truncate text-[14px] font-semibold text-black">
                  {adminDisplayName(admin)}
                </span>
                <span className="truncate text-[12px] font-medium text-[#667085]">
                  {admin?.email}
                </span>
              </div>
              <DropdownItem as={Link} to="/admin/account-settings" icon={Settings} onClick={close}>
                Account settings
              </DropdownItem>
              <DropdownItem as={Link} to="/admin/settings" icon={Store} onClick={close}>
                Store settings
              </DropdownItem>
              <DropdownItem as={Link} to="/admin/staff-roles?tab=activity" icon={Activity} onClick={close}>
                Activity log
              </DropdownItem>
              <DropdownDivider />
              {/* Clearing the session trips RequireAdminAuth into redirecting. */}
              <DropdownItem
                tone="danger"
                icon={LogOut}
                onClick={() => {
                  close();
                  signOut();
                }}
              >
                Sign out
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
}

export default AppTopbar;
