import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const categories = [
  {
    name: "Hair",
    links: [
      { name: "Wigs", path: "/products" },
      { name: "Extensions", path: "/products" },
      { name: "Frontals & Closures", path: "/products" },
      { name: "Hair Care", path: "/products" },
    ],
  },
  {
    name: "Skincare",
    links: [
      { name: "Cleansers", path: "/products" },
      { name: "Moisturizers", path: "/products" },
      { name: "Serums", path: "/products" },
      { name: "Sunscreen", path: "/products" },
    ],
  },
  {
    name: "Makeup",
    links: [
      { name: "Face", path: "/products" },
      { name: "Eyes", path: "/products" },
      { name: "Lips", path: "/products" },
      { name: "Foundation", path: "/products" },
    ],
  },
  {
    name: "Brushes",
    links: [
      { name: "Face Brushes", path: "/products" },
      { name: "Eye Brushes", path: "/products" },
      { name: "Brush Sets", path: "/products" },
      { name: "Sponges", path: "/products" },
    ],
  },
  {
    name: "Fragrance",
    links: [
      { name: "Perfumes", path: "/products" },
      { name: "Body Mists", path: "/products" },
      { name: "Gift Sets", path: "/products" },
    ],
  },
  {
    name: "Personal Care",
    links: [
      { name: "Bath & Body", path: "/products" },
      { name: "Deodorants", path: "/products" },
      { name: "Oral Care", path: "/products" },
      { name: "Hand & Foot", path: "/products" },
    ],
  },
  {
    name: "Tools & Accessories",
    links: [
      { name: "Mirrors", path: "/products" },
      { name: "Tweezers", path: "/products" },
      { name: "Applicators", path: "/products" },
      { name: "Organizers", path: "/products" },
    ],
  },
];

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

  return (
    <div className="categories-dropdown" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative flex items-center gap-1.5 px-2 py-3 text-[14px] font-semibold whitespace-nowrap cursor-pointer transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-(--primary-color) after:transition-[transform,opacity] after:duration-300 after:ease-out hover:text-(--primary-color) hover:after:scale-x-100 hover:after:opacity-30 ${
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
          className="absolute left-0 right-0 top-full z-50 border-t border-gray-100 bg-white px-[clamp(1rem,2.5vw,3rem)] py-8 shadow-[0_20px_43.9px_rgba(0,0,0,0.08)]"
        >
          <div className="mx-auto grid max-w-[1920px] grid-cols-4 gap-x-10 gap-y-8 xl:grid-cols-7">
            {categories.map((category) => (
              <div key={category.name} className="flex flex-col gap-2">
                <span className="text-[14px] font-bold uppercase text-black">
                  {category.name}
                </span>
                <div className="flex flex-col">
                  {category.links.map((sub) => (
                    <NavLink
                      key={sub.name}
                      to={sub.path}
                      onClick={() => setOpen(false)}
                      className="whitespace-nowrap py-1.5 text-[14px] font-medium text-[#667085] transition-colors hover:text-(--primary-color)"
                    >
                      {sub.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesDropdown;
