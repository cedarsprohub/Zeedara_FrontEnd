import { useEffect, useRef, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Outlet } from "react-router-dom";
import {
  NavbarHeightContext,
  StickyNavHeightContext,
} from "../context/NavbarHeightContext";

function Layout() {
  const navRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const bannerEl = navEl.querySelector(".navbar-banner");

    const updateHeight = () => {
      setNavbarHeight(navEl.offsetHeight);
      setBannerHeight(bannerEl ? bannerEl.offsetHeight : 0);
    };
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(navEl);
    if (bannerEl) resizeObserver.observe(bannerEl);

    return () => resizeObserver.disconnect();
  }, []);

  // The main nav (logo/search + links) is what stays pinned; the promo banner
  // scrolls off the top.
  const stickyNavHeight = Math.max(navbarHeight - bannerHeight, 0);

  return (
    <div className="layout">
      {/* Sticky navbar. Offsetting `top` by the banner height lets the black
          promo banner scroll away while the white main nav pins to the top. */}
      <div
        ref={navRef}
        className="sticky z-40"
        style={{ top: `-${bannerHeight}px` }}
      >
        <Navbar />
      </div>
      <NavbarHeightContext.Provider value={navbarHeight}>
        <StickyNavHeightContext.Provider value={stickyNavHeight}>
          <main>
            <Outlet />
          </main>
        </StickyNavHeightContext.Provider>
      </NavbarHeightContext.Provider>
      <Footer />
    </div>
  );
}

export default Layout;
