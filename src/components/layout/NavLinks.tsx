import { Link, useLocation } from "react-router-dom";

import { NAV_ITEMS } from "./navigation";

import { useRecipeData } from "@/providers";
import { FluentIcon } from "@/ui";

/** Icon-only links of the bottom bar and the desktop rail. */
const NavLinks = () => {
  const { pathname } = useLocation();
  const { toBuyCount } = useRecipeData();

  return NAV_ITEMS.map((item) => {
    const active = item.isActive(pathname);
    const badge = item.to === "/shopping" ? toBuyCount : 0;
    const icon = (
      <FluentIcon
        name={active && item.activeIcon ? item.activeIcon : item.icon}
        size={27}
      />
    );
    return (
      <Link
        key={item.to}
        to={item.to}
        className={item.to === "/add" ? "nv nv-add" : "nv"}
        aria-label={badge ? `${item.label}, ${badge}` : item.label}
        title={item.label}
        aria-current={active ? "page" : undefined}
      >
        {item.to === "/add" ? <span className="sq">{icon}</span> : icon}
        {badge > 0 && <span className="badge">{badge}</span>}
      </Link>
    );
  });
};

export default NavLinks;
