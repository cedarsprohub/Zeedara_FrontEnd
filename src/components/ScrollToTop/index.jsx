import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router keeps the window's scroll offset across navigations, so moving
// to a new route from halfway down a page lands you halfway down the next one.
// This resets to the top on every pathname change.
//
// Keyed on `pathname` only — deliberately not `search`. Filters and pagination
// live in the query string and manage their own scrolling (see
// `handlePageChange` in pages/Products), so reacting to `search` here would
// fight them.
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // An anchor link is asking for a specific element, not the top.
    if (hash) return;
    // Instant, not smooth — a slide on every navigation reads as lag.
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
