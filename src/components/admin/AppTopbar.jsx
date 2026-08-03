import { Link } from "react-router-dom";
import { PanelLeft, Search, ExternalLink, Bell } from "lucide-react";

function AppTopbar({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-20 flex h-[82px] shrink-0 items-center gap-4 border-b border-[#f0f1f3] bg-white px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        className="cursor-pointer p-1.5 text-[#48505e] transition-colors hover:text-black"
      >
        <PanelLeft className="size-5" strokeWidth={1.75} />
      </button>

      <div className="flex h-[41px] max-w-[602px] flex-1 items-center gap-2 border border-[#f0f1f3] bg-[#f9fafb] px-3 focus-within:border-[#dadde2]">
        <Search className="size-5 shrink-0 text-[#828a9b]" strokeWidth={1.75} />
        <input
          type="search"
          aria-label="Search orders, products, customers"
          placeholder="Search orders, products, customers..."
          className="min-w-0 flex-1 bg-transparent text-[14px] text-[#262626] placeholder:text-[#828a9b] focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* The storefront is a different app surface, so this leaves the
            dashboard rather than routing inside it. */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View storefront"
          title="View storefront"
          className="p-2 text-[#48505e] transition-colors hover:text-black"
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

        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ca9949] text-[14px] font-bold text-white">
            Z
          </span>
          <span className="hidden sm:block">
            <span className="block text-[16px] font-semibold text-[#262626]">
              Zeedara
            </span>
            <span className="block text-[12px] font-medium text-[#828a9b]">
              Admin
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}

export default AppTopbar;
