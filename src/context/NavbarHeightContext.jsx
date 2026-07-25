import { createContext, useContext } from "react";

export const NavbarHeightContext = createContext(0);

export function useNavbarHeight() {
  return useContext(NavbarHeightContext);
}

// Height of the portion of the navbar that stays pinned to the top (the main
// nav with the logo/search), i.e. the full navbar minus the promo banner that
// scrolls away. Consumers use this to offset their own sticky elements.
export const StickyNavHeightContext = createContext(0);

export function useStickyNavHeight() {
  return useContext(StickyNavHeightContext);
}
