import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LogIn,
  UserPlus,
  Package,
  Truck,
  CircleUser,
  ChevronDown,
} from "lucide-react";

const accountMenu = [
  { label: "Sign in", icon: LogIn, to: "/login" },
  { label: "Create an Account", icon: UserPlus, to: "/register" },
  { label: "Your Orders", icon: Package, to: "/orders" },
  { label: "Track Order", icon: Truck, to: "/track-order" },
];

function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="account-dropdown relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="account_btn flex items-center gap-2 cursor-pointer"
      >
        <div className="account_btn_inner flex items-center gap-2">
          <CircleUser className="size-5 shrink-0 text-black" strokeWidth={2} />
          <span className="text-[16px] font-medium text-black leading-[1.4]">
            Account
          </span>
        </div>
        <ChevronDown
          className={`size-6 shrink-0 text-black transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 flex min-w-[220px] flex-col rounded-br-[20px] bg-white p-3 shadow-[-2px_-9px_43.9px_24px_rgba(0,0,0,0.05)]"
        >
          {accountMenu.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-3 text-[#667085] transition-colors hover:text-(--primary-color)"
            >
              <Icon className="size-5 shrink-0" strokeWidth={2} />
              <span className="whitespace-nowrap text-[16px] font-semibold leading-[1.4]">
                {label}
              </span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountDropdown;
