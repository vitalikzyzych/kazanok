import {
  BowlChopsticksRegular,
  BowlSaladRegular,
  DrinkCoffeeRegular,
  type FluentIcon,
  FoodCakeRegular,
  FoodCarrotRegular,
  FoodChickenLegRegular,
  FoodEggRegular,
  FoodFishRegular,
  FoodPizzaRegular,
  FoodRegular,
  FoodToastRegular,
} from "@fluentui/react-icons";

import { tintClass } from "./tint";

import { type DishKind, dishKind, type IRecipe } from "@/domain";

/** Icon and tint per kind of dish; "other" takes a tint from the title. */
const KINDS: Record<DishKind, { icon: FluentIcon; tint: string | null }> = {
  soup: { icon: BowlChopsticksRegular, tint: "t5" },
  salad: { icon: BowlSaladRegular, tint: "t2" },
  breakfast: { icon: FoodEggRegular, tint: "t3" },
  dessert: { icon: FoodCakeRegular, tint: "t1" },
  baking: { icon: FoodToastRegular, tint: "t3" },
  pizza: { icon: FoodPizzaRegular, tint: "t5" },
  fish: { icon: FoodFishRegular, tint: "t4" },
  meat: { icon: FoodChickenLegRegular, tint: "t0" },
  drink: { icon: DrinkCoffeeRegular, tint: "t4" },
  vegetable: { icon: FoodCarrotRegular, tint: "t2" },
  other: { icon: FoodRegular, tint: null },
};

export type DishInfo = Pick<IRecipe, "title" | "tags"> &
  Partial<Pick<IRecipe, "ingredients">>;

/**
 * Cover of a recipe without a photo: a soft tint and an outline icon of the
 * kind of dish (soup, salad, breakfast...), not an imitation of a photo.
 */
const DishCover = ({ dish }: { dish: DishInfo }) => {
  const { icon: Icon, tint } = KINDS[dishKind(dish)];
  return (
    <div className={`cover ${tint ?? tintClass(dish.title)}`} aria-hidden>
      <Icon className="cover__icon" />
    </div>
  );
};

export default DishCover;
