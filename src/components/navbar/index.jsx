import { NavLink } from "react-router-dom";
import { Search, ShoppingCart, ChevronDown } from "lucide-react";
import AccountDropdown from "./AccountDropdown";
import zeedaraLogo from "../../assets/navbar/zeedara_logo.png";
import instagramIcon from "../../assets/navbar/instagram_icon.svg";
import youtubeIcon from "../../assets/navbar/youtube_icon.svg";
import facebookIcon from "../../assets/navbar/facebook_icon.svg";
import twitterIcon from "../../assets/navbar/twitter_icon.svg";

const navLinks = [
  { name: "HOME", path: "/" },
  { name: "CATEGORIES", path: "/categories", hasDropdown: true },
  { name: "NEW ARRIVALS", path: "/new-arrivals" },
  { name: "SKINCARE CLINIC", path: "/skincare-clinic" },
  { name: "CONSULTATION", path: "/consultation" },
  { name: "REQUEST A QUOTE", path: "/request-a-quote" },
];

const socialIcons = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/zeedara",
    path: instagramIcon,
  },
  {
    name: "Youtube",
    url: "https://www.youtube.com/zeedara",
    path: youtubeIcon,
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/zeedara",
    path: facebookIcon,
  },
  {
    name: "Twitter",
    url: "https://www.twitter.com/zeedara",
    path: twitterIcon,
  },
];

const sidePadding = "px-[clamp(1rem,2.5vw,3rem)]";

function Navbar() {
  return (
    <div className="navbar">
      {/* Top bar */}
      <div className={`navbar-banner bg-black py-4 ${sidePadding}`}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: socials + call */}
          <div className="nav-contact-left hidden lg:flex items-center gap-4">
            <div className="socials flex items-center gap-[10px]">
              <span className="text-white text-[10px] font-semibold whitespace-nowrap">
                Follow Us :
              </span>
              <div className="social-icons flex items-center gap-[2px]">
                {socialIcons.map(({ name, url, path }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="p-[5px] transition-opacity hover:opacity-70"
                  >
                    <img src={path} alt={name} className="size-4" />
                  </a>
                ))}
              </div>
            </div>
            <span className="h-4 w-px bg-[#e3caa1]" />
            <span className="text-white font-semibold text-[10px] whitespace-nowrap">
              CALL: 090123455869 FOR INQUIRIES
            </span>
          </div>

          {/* Center: promo */}
          <div className="nav-contact-center col-start-2 flex items-center justify-center text-center text-[10px] font-semibold text-white">
            <p>
              Members Save <span className="text-(--primary-color)">10%</span>{" "}
              Today — SIGN UP ON{" "}
              <span className="text-(--primary-color)">ZEEDARA</span>
            </p>
          </div>

          {/* Right: hours */}
          <div className="nav-contact-right hidden lg:flex items-center justify-end text-white font-semibold text-[10px] whitespace-nowrap">
            OPEN: MON - SAT: 8:00AM - 6:00PM
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className={`navbar-main bg-white py-6 ${sidePadding}`}>
        <div className="navbar-main-inner mx-auto max-w-[1920px]">
          <div className="head flex flex-wrap items-center gap-4 lg:gap-8">
            <NavLink to="/" className="navbar-logo shrink-0">
              <img
                src={zeedaraLogo}
                alt="Zeedara Logo"
                className="h-[44px] w-auto"
              />
            </NavLink>

            <div className="searchbar-wrap order-3 w-full lg:order-none lg:flex-1 lg:flex lg:justify-center">
              <div className="searchbar flex w-full items-center bg-[#f7f8fa] lg:max-w-[560px]">
                <input
                  type="text"
                  placeholder="Search a Product here"
                  className="flex-1 min-w-0 bg-transparent border-none pl-5 py-2.5 text-[14px] font-medium text-black placeholder:text-[#bdc2cb] focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Search"
                  className="shrink-0 flex items-center justify-center bg-(--primary-color) p-2.5 cursor-pointer"
                >
                  <Search className="size-5 text-white" />
                </button>
              </div>
            </div>

            <div className="account flex items-center gap-4 ml-auto lg:ml-0">
              <AccountDropdown />

              <button
                type="button"
                aria-label="Shopping cart"
                className="shopping_cart flex items-center gap-1 p-2 cursor-pointer"
              >
                <ShoppingCart className="size-[22px] text-black" />
                <span className="min-w-[19px] rounded-[10px] bg-[#ca9949] px-1 py-px text-center text-[10px] font-semibold text-white leading-[1.4]">
                  1
                </span>
              </button>
            </div>
          </div>

          <div className="foot w-full flex justify-center pt-6">
            <div className="navbar-links flex flex-wrap items-center justify-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 px-2 py-3 text-[14px] font-semibold whitespace-nowrap transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-(--primary-color) after:transition-[transform,opacity] after:duration-300 after:ease-out hover:text-(--primary-color) hover:after:scale-x-100 hover:after:opacity-30 ${
                      isActive
                        ? "text-(--primary-color) after:scale-x-100"
                        : "text-[#667085] after:scale-x-0 after:opacity-100"
                    }`
                  }
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown className="size-6" />}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
