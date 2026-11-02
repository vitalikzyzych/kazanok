import type { IconName } from "@/ui";

export interface INavItem {
  to: string;
  label: string;
  /** Under the icon in the bottom bar and the rail. */
  shortLabel: string;
  icon: IconName;
  activeIcon: IconName;
  /** Pages under this item. */
  isActive: (pathname: string) => boolean;
}

export const NAV_ITEMS: INavItem[] = [
  {
    to: "/",
    label: "Рецепти",
    shortLabel: "Рецепти",
    icon: "Book",
    activeIcon: "BookFilled",
    isActive: (p) => p === "/" || p.startsWith("/recipes"),
  },
  {
    to: "/favorites",
    label: "Улюблені",
    shortLabel: "Улюблені",
    icon: "Heart",
    activeIcon: "HeartFilled",
    isActive: (p) => p === "/favorites",
  },
  {
    to: "/add",
    label: "Додати рецепт",
    shortLabel: "Додати",
    icon: "AddCircle",
    activeIcon: "AddCircleFilled",
    isActive: (p) => p === "/add",
  },
  {
    to: "/shopping",
    label: "Покупки",
    shortLabel: "Покупки",
    icon: "Cart",
    activeIcon: "CartFilled",
    isActive: (p) => p === "/shopping",
  },
];

/** Title above the page on desktop. */
export const pageHeading = (pathname: string): string => {
  if (pathname === "/favorites") return "Улюблені";
  if (pathname === "/add") return "Новий рецепт";
  if (pathname === "/shopping") return "Покупки";
  if (pathname.endsWith("/edit")) return "Редагування";
  if (pathname.startsWith("/recipes/")) return "Рецепт";
  return "Рецепти";
};
