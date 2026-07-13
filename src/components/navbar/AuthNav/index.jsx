import { NavLink } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import Navbar from "../";
import MobileNav from "../MobileNav";
import zeedaraLogo from "../../../assets/navbar/zeedara_logo.png";

const navLinks = [
  { name: "HOME", path: "/" },
  { name: "CATEGORIES", path: "/categories", hasDropdown: true },
  { name: "NEW ARRIVALS", path: "/new-arrivals" },
  { name: "SKINCARE CLINIC", path: "/skincare-clinic" },
  { name: "CONSULTATION", path: "/consultation" },
  { name: "CUSTOM WIG", path: "/custom-wig" },
  { name: "REQUEST A QUOTE", path: "/request-a-quote" },
];

// Nav used across the auth pages: the full site navbar on desktop,
// and the compact white bar + hamburger drawer on mobile.
function AuthNav() {
  return (
    <>
      {/* Desktop: full site navbar (top banner, search, links row) */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      {/* Mobile: compact white bar with hamburger */}
      <div className="mobile-auth-nav relative z-20 flex items-center justify-between bg-white px-[clamp(1rem,2.5vw,3rem)] py-5 lg:hidden">
        <NavLink to="/" className="shrink-0">
          <img src={zeedaraLogo} alt="Zeedara Logo" className="h-[24px] w-auto" />
        </NavLink>

        <div className="flex items-center gap-3 text-black">
          <button
            type="button"
            aria-label="Shopping cart"
            className="flex items-center gap-1 p-2 cursor-pointer"
          >
            <ShoppingCart className="size-[22px]" />
            <span className="min-w-[19px] rounded-[10px] bg-[#ca9949] px-1 py-px text-center text-[12px] font-semibold text-white leading-[1.4]">
              1
            </span>
          </button>
          <MobileNav navLinks={navLinks} logo={zeedaraLogo} />
        </div>
      </div>
    </>
  );
}

export default AuthNav;
