import { Link, useLocation } from "react-router-dom";

import { NAV_ITEMS } from "./navigation";

import { useRecipeData } from "@/providers";
import { FluentIcon } from "@/ui";

/**
 * Icon and label links of the bottom bar and the desktop rail. The page that
 * is open shows a filled icon, and its icon and label take the active colour.
 */
const NavLinks = () => {
  const { pathname } = useLocation();
  const { toBuyCount, recipeById } = useRecipeData();
  const openId = pathname.match(/^\/recipes\/([^/]+)/)?.[1];
  const openRecipe = (openId && recipeById.get(openId)?.category) || null;

  return NAV_ITEMS.map((item) => {
    const active = item.isActive(pathname, openRecipe);
    const badge = item.to === "/shopping" ? toBuyCount : 0;
    return (
      <Link
        key={item.to}
        to={item.to}
        className="nv"
        aria-label={badge ? `${item.label}, ${badge}` : item.label}
        title={item.label}
        aria-current={active ? "page" : undefined}
      >
        <span className="nv__icon">
          <FluentIcon name={active ? item.activeIcon : item.icon} size={24} />
          {badge > 0 && <span className="badge">{badge}</span>}
        </span>
        <span className="nv__label" aria-hidden>
          {item.shortLabel}
        </span>
      </Link>
    );
  });
};

export default NavLinks;
