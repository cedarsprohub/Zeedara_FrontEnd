import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Search, ChevronRight, ChevronLeft } from "lucide-react";
import userAddIcon from "../../../assets/navbar/user-add-02.svg";
import loginIcon from "../../../assets/navbar/login-02.svg";
import NavCard from "../NavCard";

import navcardImg from "../../../assets/navbar/navcardImg.png";

const categoryLinks = [
  {
    name: "Hair",
    sublinks: [
      { name: "Wigs", path: "/categories" },
      { name: "Extensions", path: "/categories" },
      { name: "Hair Care", path: "/categories" },
    ],
  },
  {
    name: "Skincare",
    sublinks: [
      { name: "Cleansers", path: "/categories" },
      { name: "Moisturizers", path: "/categories" },
      { name: "Serums", path: "/categories" },
    ],
  },
  {
    name: "Makeup",
    sublinks: [
      { name: "Face", path: "/categories" },
      { name: "Eyes", path: "/categories" },
      { name: "Lips", path: "/categories" },
    ],
  },
  {
    name: "Brushes",
    sublinks: [
      { name: "Face Brushes", path: "/categories" },
      { name: "Eye Brushes", path: "/categories" },
      { name: "Brush Sets", path: "/categories" },
    ],
  },
];

function MobileNav({ navLinks = [], logo }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("main"); // "main" | "categories"
  const [openCategory, setOpenCategory] = useState(-1);

  const close = () => setOpen(false);

  const openDrawer = () => {
    setView("main");
    setOpenCategory(-1);
    setOpen(true);
  };

  const toggleCategory = (index) =>
    setOpenCategory((current) => (current === index ? -1 : index));

  // Lock page scroll while the drawer is open + close on Escape.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="mobile-nav lg:hidden">
      {/* Hamburger trigger */}
      <button
        type="button"
        onClick={openDrawer}
        aria-label="Open menu"
        aria-expanded={open}
        className="mobile-nav-trigger flex items-center p-2 cursor-pointer"
      >
        <Menu className="size-6 text-black" />
      </button>

      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed right-0 top-0 z-50 flex h-screen w-[85%] max-w-[380px] flex-col bg-white shadow-[-2px_0_43.9px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header (shared across views) */}
        <div className="flex flex-col gap-4 px-5 py-5">
          {/* Close button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="flex items-center justify-center p-2 cursor-pointer"
            >
              <X className="size-6 text-black" />
            </button>
          </div>

          {/* Logo + search */}
          <div className="flex items-center justify-between gap-4">
            <NavLink to="/" onClick={close} className="shrink-0">
              <img src={logo} alt="Zeedara Logo" className="h-[24px] w-auto" />
            </NavLink>
            <button
              type="button"
              aria-label="Search"
              className="flex items-center justify-center p-2 cursor-pointer"
            >
              <Search className="size-5 text-black" />
            </button>
          </div>
        </div>

        {/* Sliding views */}
        <div className="relative flex-1 overflow-hidden">
          <div
            className={`flex h-full w-[200%] transition-transform duration-300 ease-out ${
              view === "categories" ? "-translate-x-1/2" : "translate-x-0"
            }`}
          >
            {/* View 1: main menu */}
            <div className="flex h-full w-1/2 flex-col">
              <nav className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
                {navLinks.map((link) =>
                  link.hasDropdown ? (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => setView("categories")}
                      aria-label={`Open ${link.name}`}
                      className="flex w-full items-center uppercase justify-between gap-2 py-4 text-[14px] font-semibold text-[#000] cursor-pointer transition-colors hover:text-(--primary-color)"
                    >
                      {link.name}
                      <ChevronRight className="size-5 shrink-0" />
                    </button>
                  ) : (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      end={link.path === "/"}
                      onClick={close}
                      className={({ isActive }) =>
                        `py-4 text-[14px] font-semibold uppercase transition-colors ${
                          isActive
                            ? "text-(--primary-color)"
                            : "text-[#000] hover:text-(--primary-color)"
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ),
                )}
              </nav>
            </div>

            {/* View 2: categories */}
            <div className="flex h-full w-1/2 flex-col">
              {/* Back button */}
              <div className="px-5 py-2">
                <button
                  type="button"
                  onClick={() => setView("main")}
                  className="flex items-center gap-1 py-2 capitalize px-4 text-(--primary-color) bg-[#faf4eb] border border-[#efe0c8] text-[14px] font-semibold cursor-pointer transition-colors hover:text-(--primary-color)"
                >
                  <ChevronLeft className="size-5 shrink-0" />
                  Back
                </button>
              </div>

              {/* Category accordions */}
              <div className="flex flex-1 flex-col overflow-y-auto px-5 py-2">
                {categoryLinks.map((category, index) => {
                  const isOpen = openCategory === index;
                  return (
                    <div key={category.name}>
                      <button
                        type="button"
                        onClick={() => toggleCategory(index)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center uppercase justify-between gap-2 py-4 text-[14px] font-semibold text-[#000] cursor-pointer transition-colors hover:text-(--primary-color)"
                      >
                        {category.name}
                        <ChevronLeft
                          className={`size-5 shrink-0 transition-transform duration-300 rotate-180 ${
                            isOpen ? "rotate-270" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="flex flex-col pb-2 pl-4">
                            {category.sublinks.map((sub) => (
                              <NavLink
                                key={sub.name}
                                to={sub.path}
                                onClick={close}
                                className="py-2.5 text-[12px] uppercase font-medium text-[#000] transition-colors hover:text-(--primary-color)"
                              >
                                {sub.name}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions (shared across views) */}
        <div className="flex flex-col gap-3 px-5 py-5">
          <NavCard
            label={
              <>
                <span>
                  Shop by <br />
                  Brands
                </span>
              </>
            }
            img={navcardImg}
            to="shop"
            alt="by-brand-Image"
          />
          <div className="footer auth-links flex flex-col gap-3">
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
        </div>
      </div>
    </div>
  );
}

export default MobileNav;
