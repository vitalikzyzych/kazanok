import type { RecipeCategory } from "@/domain";
import type { IconName } from "@/ui";

export interface INavItem {
  to: string;
  label: string;
  /** Under the icon in the bottom bar and the rail. */
  shortLabel: string;
  icon: IconName;
  activeIcon: IconName;
  /** Pages under this item; openRecipe is the section of the recipe open. */
  isActive: (pathname: string, openRecipe: RecipeCategory | null) => boolean;
}

/** Where each section's list lives. */
export const SECTION_PATHS: Record<RecipeCategory, string> = {
  dish: "/",
  baking: "/baking",
};

export const NAV_ITEMS: INavItem[] = [
  {
    to: "/",
    label: "Страви",
    shortLabel: "Страви",
    icon: "Food",
    activeIcon: "FoodFilled",
    isActive: (p, open) => p === "/" || open === "dish",
  },
  {
    to: "/baking",
    label: "Випічка",
    shortLabel: "Випічка",
    icon: "FoodCake",
    activeIcon: "FoodCakeFilled",
    isActive: (p, open) => p === "/baking" || open === "baking",
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
  if (pathname === "/baking") return "Випічка";
  if (pathname === "/add") return "Новий рецепт";
  if (pathname === "/shopping") return "Покупки";
  if (pathname.endsWith("/edit")) return "Редагування";
  if (pathname.startsWith("/recipes/")) return "Рецепт";
  return "Страви";
};
