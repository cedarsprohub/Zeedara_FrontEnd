import { useEffect, useRef, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Outlet } from "react-router-dom";
import { NavbarHeightContext } from "../context/NavbarHeightContext";

function Layout() {
  const navRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const updateHeight = () => setNavbarHeight(navEl.offsetHeight);
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(navEl);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="layout">
      <div ref={navRef}>
        <Navbar />
      </div>
      <NavbarHeightContext.Provider value={navbarHeight}>
        <main>
          <Outlet />
        </main>
      </NavbarHeightContext.Provider>
      <Footer />
    </div>
  );
}

export default Layout;
