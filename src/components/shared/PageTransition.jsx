import { useLocation } from "react-router-dom";

/**
 * Replays the route-enter animation on every navigation.
 *
 * The `key` is the pathname, so React swaps the element rather than updating it
 * and the CSS animation runs again from the start — no timers, no transition
 * library, and nothing to clean up. The animation itself is a compositor-only
 * opacity/transform pair, and it's switched off under `prefers-reduced-motion`.
 */
function PageTransition({ children }) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}

export default PageTransition;
