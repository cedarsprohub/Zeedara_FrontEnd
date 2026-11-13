import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GAP = 8;
const EDGE = 8;

// The admin console's popover menu: the period and country pickers, a table
// row's "More options", the topbar profile menu. Rendered into <body> with
// fixed positioning, so a menu opened from inside a horizontally scrolling
// table isn't clipped by it; it flips above the trigger when there isn't room
// below, and keeps inside the viewport sideways.
//
// `trigger` gets ({ isOpen, toggle, ref }) and renders the button; `children`
// gets `close` and renders the items.
function Dropdown({ trigger, children, align = "left", width = 196, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((open) => !open), []);

  const place = useCallback(() => {
    const anchor = triggerRef.current?.getBoundingClientRect();
    const menu = menuRef.current;
    if (!anchor || !menu) return;
    const height = menu.offsetHeight;
    const roomBelow = window.innerHeight - anchor.bottom;
    const top =
      roomBelow < height + GAP && anchor.top > roomBelow
        ? Math.max(EDGE, anchor.top - height - GAP)
        : anchor.bottom + GAP;
    const preferred = align === "right" ? anchor.right - width : anchor.left;
    const left = Math.min(
      Math.max(EDGE, preferred),
      window.innerWidth - width - EDGE,
    );
    setPosition({ top, left });
  }, [align, width]);

  // Measured before paint, so the menu never flashes at the wrong spot.
  useLayoutEffect(() => {
    if (isOpen) place();
  }, [isOpen, place]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    // A fixed menu would drift away from its trigger as the page scrolls, so
    // it follows along (capture: the table's own scroller counts too).
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, place]);

  return (
    <>
      {trigger({ isOpen, toggle, ref: triggerRef })}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            style={{
              width,
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
            }}
            className="fixed z-[60] flex max-h-[calc(100vh-16px)] flex-col overflow-y-auto rounded-lg border border-[#f0f1f3] bg-white px-2 py-3 shadow-[-2px_-9px_43.9px_24px_rgba(0,0,0,0.05)]"
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </>
  );
}

// One row of a Dropdown. `as` lets a row be a Link or <a> instead of a button.
export function DropdownItem({
  as: Component = "button",
  icon: Icon,
  tone = "default",
  selected = false,
  className = "",
  children,
  ...props
}) {
  const color =
    tone === "danger"
      ? "text-[#cf251f] hover:bg-[#fef3f2]"
      : selected
        ? "text-(--primary-color) font-semibold"
        : `${tone === "strong" ? "text-black" : "text-[#667085]"} hover:text-(--primary-color)`;
  return (
    <Component
      role="menuitem"
      {...(Component === "button" ? { type: "button" } : {})}
      {...props}
      className={`flex w-full shrink-0 cursor-pointer items-center gap-2 rounded px-2 py-3 text-left text-[12px] font-medium leading-[1.4] transition-colors hover:bg-[#fcfcfc] disabled:cursor-not-allowed disabled:opacity-50 ${color} ${className}`}
    >
      {Icon && <Icon className="size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />}
      {children}
    </Component>
  );
}

export function DropdownDivider() {
  return <hr className="my-0 shrink-0 border-[#f0f1f3]" />;
}

export default Dropdown;
