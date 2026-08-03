import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Plus, TicketPercent, UserPlus } from "lucide-react";

const ITEMS = [
  { label: "Add Product", to: "/admin/products/new", icon: Package },
  { label: "New Discount Code", to: "/admin/coupons/new", icon: TicketPercent },
  { label: "Add staff member", to: "/admin/staff/new", icon: UserPlus },
];

function QuickAddMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click and on Escape. Bound only while open, so a closed
  // menu costs nothing.
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex cursor-pointer items-center gap-2 bg-(--primary-color) px-4 py-2.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
      >
        <Plus className="size-[17px]" strokeWidth={2.5} />
        Quick Add
      </button>

      {isOpen && (
        // Right-aligned: the button sits at the end of the header row, so a
        // left-aligned menu would overflow the viewport on narrow screens.
        <div
          role="menu"
          className="absolute top-full right-0 z-30 mt-2 flex w-[220px] flex-col rounded-lg bg-white p-3 drop-shadow-[-2px_-9px_21.95px_rgba(0,0,0,0.05)] ring-1 ring-[#f0f1f3]"
        >
          <p className="px-2 py-1 text-[12px] font-medium text-[#9fa5b2]">
            CREATE
          </p>
          <hr className="my-1 border-[#f0f1f3]" />

          {ITEMS.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2 py-3 text-[14px] font-medium text-[#667085] transition-colors hover:text-(--primary-color)"
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuickAddMenu;
