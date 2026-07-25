import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import shopByBrandsImg from "../../../assets/navbar/shopByBrands.png";
import shopByOffersImg from "../../../assets/navbar/shopByOffers.png";

// All category links currently point at the products listing until per-category
// routes exist.
const CATEGORY_PATH = "/products";

// First three tall columns rendered directly in the mega-menu row.
const PRIMARY_COLUMNS = [
  {
    title: "SKINCARE",
    items: [
      "Cleansers",
      "Toners",
      "Serums",
      "Moisturizers",
      "Sunscreen",
      "Face Masks",
      "Treatment Products",
      "Skincare Equipments",
    ],
  },
  {
    title: "HAIRS, WIGS & EXTENSIONS",
    items: [
      "100% Human Hair Wigs",
      "100% Human Hair Weaves",
      "Synthetic, Blend & Fiber Wigs",
      "Extensions & Attachments",
      "Crochet Hair",
      "Wool Hair",
      "Kinky Breeds",
    ],
  },
  {
    title: "MAKEUP",
    items: ["Face", "Eyes", "Lips", "Brows", "Lashes", "Makeup Tools", "Makeup Sets"],
  },
];

// The fourth block: a 4-column grid stacked above the two promo cards.
const SECONDARY_COLUMNS = [
  {
    title: "ACCESSORIES",
    items: [
      "Jewelry",
      "Sunglasses",
      "Hair Accessories",
      "Haircare Products and Equipment",
      "Beauty Accessories",
    ],
  },
  {
    title: "BODY CARE",
    items: ["Body Butters", "Body Oils", "Body Scrubs", "Soaps & Washes", "Personal care"],
  },
  {
    title: "ORGANIC & NATURAL",
    items: ["Organic Skincare", "Natural Body Care", "Shea Butter", "Natural Haircare"],
  },
  {
    title: "NAILS",
    items: ["Press-On Nails", "Nail Care", "Nail Tools", "Nail Accessories"],
  },
];

const PROMOS = [
  { title: "SHOP BY BRANDS", img: shopByBrandsImg },
  { title: "SHOP BY OFFERS", img: shopByOffersImg },
];

function Column({ title, items, onNavigate }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-[18px] items-center border-b-[1.5px] border-[#9fa5b2]">
        <span className="whitespace-nowrap text-[13px] font-medium text-black">
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item}
            to={CATEGORY_PATH}
            onClick={onNavigate}
            className="whitespace-nowrap px-1 py-[5px] text-[12px] font-medium text-[#667085] transition-colors hover:text-(--primary-color)"
          >
            {item}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function PromoCard({ title, img, onNavigate }) {
  return (
    <NavLink
      to={CATEGORY_PATH}
      onClick={onNavigate}
      className="flex flex-1 items-center gap-6 bg-[#faf4eb] py-4 pl-6 pr-5 transition-opacity hover:opacity-90"
    >
      <span className="flex-1 text-[16px] font-bold leading-[1.4] text-[#573b0f]">
        {title}
      </span>
      <div className="h-[60px] flex-1 overflow-hidden bg-white">
        <img src={img} alt="" className="h-full w-full object-cover" />
      </div>
    </NavLink>
  );
}

function CategoriesDropdown({ link }) {
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

  const closeMenu = () => setOpen(false);

  return (
    <div className="categories-dropdown" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative flex items-center gap-1.5 px-2 py-3 text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-(--primary-color) after:transition-[transform,opacity] after:duration-300 after:ease-out hover:text-(--primary-color) hover:after:scale-x-100 hover:after:opacity-30 ${
          open
            ? "text-(--primary-color) after:scale-x-100"
            : "text-[#667085] after:scale-x-0 after:opacity-100"
        }`}
      >
        {link.name}
        <ChevronDown
          className={`size-6 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 right-0 top-full z-50 border-b-2 border-(--primary-color) bg-white shadow-[-2px_-9px_43.9px_rgba(0,0,0,0.05)]"
        >
          <div className="mx-auto flex max-w-[1920px] items-start justify-center gap-[clamp(1.5rem,2vw,3rem)] overflow-x-auto px-[clamp(1rem,3vw,60px)] py-10">
            {PRIMARY_COLUMNS.map((column) => (
              <Column key={column.title} {...column} onNavigate={closeMenu} />
            ))}

            {/* Fourth block: 4-column grid above the two promo cards */}
            <div className="flex flex-col gap-12">
              <div className="flex items-start gap-[clamp(1.5rem,1.75vw,2.5rem)]">
                {SECONDARY_COLUMNS.map((column) => (
                  <Column key={column.title} {...column} onNavigate={closeMenu} />
                ))}
              </div>
              <div className="flex w-full gap-[clamp(1rem,1.75vw,2.5rem)]">
                {PROMOS.map((promo) => (
                  <PromoCard key={promo.title} {...promo} onNavigate={closeMenu} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesDropdown;
