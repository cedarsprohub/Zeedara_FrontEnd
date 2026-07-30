import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { listProducts, searchProducts } from "../../../api/catalog";
import { primaryImageUrl } from "../../../utils/product";

const SUGGESTION_LIMIT = 5;
const RECOMMENDED_LIMIT = 5;
// Long enough that typing a word doesn't fire a request per keystroke.
const DEBOUNCE_MS = 250;

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
  // Both lists are tagged with the query they answer, so a stale response can't
  // overwrite a newer one.
  const [suggestions, setSuggestions] = useState({ key: "", items: [] });
  const [recommended, setRecommended] = useState([]);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const submitSearch = (event) => {
    event.preventDefault();
    if (query.trim() === "") return;
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
  };

  const trimmedQuery = query.trim();

  // Live suggestions from `GET /search`, debounced.
  useEffect(() => {
    if (!isOpen || trimmedQuery === "") return undefined;

    let active = true;
    const timer = setTimeout(() => {
      searchProducts(trimmedQuery, { limit: SUGGESTION_LIMIT })
        .then((rows) => {
          if (active) {
            setSuggestions({
              key: trimmedQuery,
              items: Array.isArray(rows) ? rows : [],
            });
          }
        })
        .catch(() => {
          if (active) setSuggestions({ key: trimmedQuery, items: [] });
        });
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, trimmedQuery]);

  // Newest products, as the standing recommendation set.
  useEffect(() => {
    if (!isOpen || recommended.length > 0) return undefined;

    let active = true;
    listProducts({ limit: RECOMMENDED_LIMIT, sort: "newest" })
      .then((rows) => {
        if (active) setRecommended(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isOpen, recommended.length]);

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
            {/* Live matches from the search endpoint */}
            {hasQuery && (
              <div className="border-b border-gray-100 p-4">
                {suggestions.key !== trimmedQuery ? (
                  <p className="px-2 py-2 text-sm text-gray-400">Searching…</p>
                ) : suggestions.items.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-gray-400">
                    No matches for “{trimmedQuery}”.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {suggestions.items.map((product) => (
                      <li key={product.id}>
                        <NavLink
                          to={`/products/${product.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex w-full items-center px-2 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          {highlightMatch(product.name, trimmedQuery)}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Recommended products container */}
            {recommended.length > 0 && (
              <div className="p-4">
                <h4 className="mb-3 text-sm font-semibold uppercase text-gray-900">
                  Recommended Products
                </h4>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {recommended.map((product) => (
                    <NavLink
                      key={product.id}
                      to={`/products/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex flex-col items-center gap-1.5 border border-gray-200 px-1 pb-1 transition-colors hover:border-(--primary-color)"
                    >
                      <div className="h-[73px] w-full overflow-hidden bg-gray-100">
                        <img
                          src={primaryImageUrl(product.media)}
                          alt={product.name}
                          loading="lazy"
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
