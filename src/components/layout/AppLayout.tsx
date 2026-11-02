import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { ProgressSpinner } from "primereact/progressspinner";

import { pageHeading } from "./navigation";
import NavLinks from "./NavLinks";
import ThemeButton from "./ThemeButton";
import TimerDock from "./TimerDock";

import { useRecipeData } from "@/providers";
import { FluentIcon, Logo } from "@/ui";

/** Icon rail from 900px, bottom navigation on phones (design: Threads-like). */
const AppLayout = () => {
  const { loading, error } = useRecipeData();
  const { pathname } = useLocation();

  // A new page starts at the top; the browser keeps the old scroll position
  // on client-side navigation.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <>
      <nav className="rail" aria-label="Основна навігація">
        <Link to="/" className="rail__logo" aria-label="Казанок, на головну">
          <Logo />
        </Link>
        <div className="rail__links">
          <NavLinks />
        </div>
        <div className="rail__foot">
          <ThemeButton />
        </div>
      </nav>

      <main className="main">
        <div className="page-head">{pageHeading(pathname)}</div>
        {error && (
          <div className="page">
            <div className="notice notice--error">
              <FluentIcon name="ErrorCircle" size={20} />
              <span>Не вдалося завантажити дані: {error}</span>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex justify-content-center py-8">
            <ProgressSpinner
              style={{ width: "3rem", height: "3rem" }}
              strokeWidth="4"
            />
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <TimerDock />
      <nav className="bnav" aria-label="Основна навігація">
        <NavLinks />
      </nav>
    </>
  );
};

export default AppLayout;
