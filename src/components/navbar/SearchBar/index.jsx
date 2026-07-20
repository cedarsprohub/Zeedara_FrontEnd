import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import sampleImg from "../../../assets/ui/sampleImg.png";

const placeholderSuggestions = [
  "Bare Lace 13X6 Wig Lacefrontal",
  "Glow Hydration Serum",
  "Custom Wig Consultation",
  "Vitamin C Serum",
  "Skincare Clinic Package",
];

const recommendedProducts = [
  { id: 1, name: "Bare Lace Wig Lacefrontal", image: sampleImg },
  { id: 2, name: "Glow Hydration Serum", image: sampleImg },
  { id: 3, name: "Vitamin C Serum", image: sampleImg },
  { id: 4, name: "Custom Wig Bundle", image: sampleImg },
  { id: 5, name: "SPF 50 Sunscreen", image: sampleImg },
];

function highlightMatch(text, query) {
  const matchIndex = text.toLowerCase().indexOf(query.toLowerCase());
  if (matchIndex === -1) return text;

  const matchEnd = matchIndex + query.length;
  return (
    <>
      {text.slice(0, matchIndex)}
      <span className="text-(--primary-color) font-semibold">
        {text.slice(matchIndex, matchEnd)}
      </span>
      {text.slice(matchEnd)}
    </>
  );
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const submitSearch = (event) => {
    event.preventDefault();
    if (query.trim() === "") return;
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Disable page scroll while the dropdown is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const hasQuery = query.trim() !== "";

  return (
    <div className="searchbar-wrap hidden lg:flex order-3 w-full lg:order-none lg:flex-1 lg:justify-center">
      <div ref={containerRef} className="relative w-full lg:max-w-[560px]">
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/40"
          />
        )}

        <form
          onSubmit={submitSearch}
          className="searchbar relative z-50 flex w-full items-center border border-transparent bg-[#f7f8fa] transition-colors focus-within:border-(--primary-color)"
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search a Product here"
            className="flex-1 min-w-0 bg-transparent border-none pl-5 py-2.5 text-[14px] font-medium text-black placeholder:text-[#bdc2cb] focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="shrink-0 flex items-center justify-center bg-(--primary-color) p-2.5 cursor-pointer"
          >
            <Search className="size-5 text-white" />
          </button>
        </form>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] w-full overflow-y-auto border border-gray-100 bg-white shadow-lg">
            {/* Suggestions container - empty until the user types, will be populated from an API later */}
            {hasQuery && (
              <div className="border-b border-gray-100 p-4">
                <ul className="flex flex-col gap-1">
                  {placeholderSuggestions.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        onClick={() => setQuery(suggestion)}
                        className="flex w-full items-center px-2 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        {highlightMatch(suggestion, query)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended products container */}
            <div className="p-4">
              <h4 className="mb-3 text-sm font-semibold uppercase text-gray-900">
                Recommended Products
              </h4>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {recommendedProducts.map((product) => (
                  <NavLink
                    key={product.id}
                    to={`/products/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-center gap-1.5 border border-gray-200 px-1 pb-1 transition-colors hover:border-(--primary-color)"
                  >
                    <div className="h-[73px] w-full overflow-hidden bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="line-clamp-2 text-[9px] font-medium text-gray-800">
                      {product.name}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
