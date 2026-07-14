import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Package,
  Truck,
  CircleUser,
  ChevronDown,
  MessageCircleMore,
} from "lucide-react";
import userAddIcon from "../../../assets/navbar/user-add-02.svg";
import loginIcon from "../../../assets/navbar/login-02.svg";

const accountMenu = [
  { label: "My Orders", icon: Package, to: "/orders" },
  { label: "Messages", icon: MessageCircleMore, to: "/register" },
  { label: "Payments", icon: Truck, to: "/payments" },
];

function AccountDropdown({ light = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const triggerColor = light ? "text-white" : "text-black";

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
    <div className="account-dropdown relative hidden lg:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="account_btn flex items-center gap-2 cursor-pointer"
      >
        <div className="account_btn_inner flex items-center gap-2">
          <CircleUser
            className={`size-5 shrink-0 ${triggerColor}`}
            strokeWidth={2}
          />
          <span
            className={`text-[16px] font-medium leading-[1.4] ${triggerColor}`}
          >
            Account
          </span>
        </div>
        <ChevronDown
          className={`size-6 shrink-0 transition-transform duration-300 ${triggerColor} ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 flex min-w-[250px] flex-col rounded-br-[20px] bg-white p-3 shadow-[-2px_-9px_43.9px_24px_rgba(0,0,0,0.05)]"
        >
          <div className="footer auth-links flex flex-col gap-3 pb-2">
            <NavLink
              to="/register"
              onClick={close}
              className="w-full text-(--primary-color) flex items-center justify-center gap-3 bg-[#faf4eb] border border-[#efe0c8] px-6 py-3 text-center text-[14px] font-medium capitalize transition-colors hover:bg-(--primary-color) hover:text-white"
            >
              Create an Account
              <img src={userAddIcon} alt="signup Icon" className="" />
            </NavLink>
            <NavLink
              to="/login"
              onClick={close}
              className="w-full bg-(--primary-color) flex items-center justify-center gap-3 px-6 py-3 text-center text-[14px] font-medium capitalize text-white transition-colors hover:bg-[#573b0f]"
            >
              sign In
              <img src={loginIcon} alt="" className="" />
            </NavLink>
          </div>
          <div className="flex flex-col border-t border-b border-[#bdc2cb]">
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
          <div className="flex flex-col">
            <NavLink
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-3 text-[#667085] transition-colors hover:text-(--primary-color)"
            >
              <span className="whitespace-nowrap text-[16px] font-semibold leading-[1.4]">
                Settings
              </span>
            </NavLink>
            <NavLink
              to="/refund-policy"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-3 text-[#667085] transition-colors hover:text-(--primary-color)"
            >
              <span className="whitespace-nowrap text-[16px] font-semibold leading-[1.4]">
                Return & refund policy
              </span>
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountDropdown;
