import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const categories = [
  {
    name: "Hair",
    links: [
      { name: "Wigs", path: "/categories" },
      { name: "Extensions", path: "/categories" },
      { name: "Frontals & Closures", path: "/categories" },
      { name: "Hair Care", path: "/categories" },
    ],
  },
  {
    name: "Skincare",
    links: [
      { name: "Cleansers", path: "/categories" },
      { name: "Moisturizers", path: "/categories" },
      { name: "Serums", path: "/categories" },
      { name: "Sunscreen", path: "/categories" },
    ],
  },
  {
    name: "Makeup",
    links: [
      { name: "Face", path: "/categories" },
      { name: "Eyes", path: "/categories" },
      { name: "Lips", path: "/categories" },
      { name: "Foundation", path: "/categories" },
    ],
  },
  {
    name: "Brushes",
    links: [
      { name: "Face Brushes", path: "/categories" },
      { name: "Eye Brushes", path: "/categories" },
      { name: "Brush Sets", path: "/categories" },
      { name: "Sponges", path: "/categories" },
    ],
  },
  {
    name: "Fragrance",
    links: [
      { name: "Perfumes", path: "/categories" },
      { name: "Body Mists", path: "/categories" },
      { name: "Gift Sets", path: "/categories" },
    ],
  },
  {
    name: "Personal Care",
    links: [
      { name: "Bath & Body", path: "/categories" },
      { name: "Deodorants", path: "/categories" },
      { name: "Oral Care", path: "/categories" },
      { name: "Hand & Foot", path: "/categories" },
    ],
  },
  {
    name: "Tools & Accessories",
    links: [
      { name: "Mirrors", path: "/categories" },
      { name: "Tweezers", path: "/categories" },
      { name: "Applicators", path: "/categories" },
      { name: "Organizers", path: "/categories" },
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
    <div className="categories-dropdown relative" ref={ref}>
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
          className="absolute left-0 top-full z-50 mt-3 rounded-br-[20px] bg-white p-7 shadow-[-2px_9px_43.9px_rgba(0,0,0,0.08)]"
        >
          <div className="grid grid-cols-4 gap-x-10 gap-y-8">
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
