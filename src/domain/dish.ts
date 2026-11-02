import { normalize } from "./text";
import type { IRecipe, RecipeCategory } from "./types";

/** What kind of dish a recipe is: picks the icon of a cover without a photo. */
export type DishKind =
  | "soup"
  | "salad"
  | "breakfast"
  | "dessert"
  | "baking"
  | "pizza"
  | "fish"
  | "meat"
  | "drink"
  | "vegetable"
  | "other";

/** In order: the first rule that matches wins (chicken soup is a soup). */
const RULES: [DishKind, RegExp][] = [
  ["soup", /суп|борщ|бульйон|юшк|солянк|розсольник|окрошк|капусняк/],
  ["salad", /салат|вінегрет/],
  ["dessert", /десерт|торт|морозив|пудинг|мус\b|тірамісу|чізкейк|желе/],
  [
    "baking",
    /випічк|шарлотк|штрудел|рулет|пиріг|пиріж|кекс|печиво|булочк|хліб|пампушк|маффін|круасан/,
  ],
  [
    "breakfast",
    /сніданок|сирник|панкейк|млинц|млинч|оладк|омлет|яєчн|шакшук|каша|гранол|тост/,
  ],
  ["pizza", /піц/],
  ["fish", /риб|лосос|оселед|тунц|тунец|скумбр|креветк|морепродукт/],
  [
    "meat",
    /мяс|куряч|курк|курят|свин|ялович|телят|індич|качк|котлет|фарш|шашлик|стейк|ковбас|бекон|гуанчале|голубц|плов/,
  ],
  ["drink", /напій|напої|кава|чай|смузі|коктейль|компот|узвар|лимонад/],
  [
    "vegetable",
    /вегетар|веган|овоч|деруни|картопл|капуст|гарбуз|баклажан|кабачк/,
  ],
];

const match = (text: string, kinds?: DishKind[]): DishKind | null => {
  for (const [kind, re] of RULES)
    if ((!kinds || kinds.includes(kind)) && re.test(text)) return kind;
  return null;
};

/**
 * The title decides first, then the tags; ingredients only tell meat or fish
 * (nearly every recipe has eggs or potatoes somewhere).
 */
export const dishKind = (
  r: Pick<IRecipe, "title" | "tags"> & Partial<Pick<IRecipe, "ingredients">>
): DishKind =>
  match(normalize(r.title)) ??
  match(normalize(r.tags.join(" "))) ??
  match(normalize((r.ingredients ?? []).map((i) => i.name).join(" ")), [
    "fish",
    "meat",
  ]) ??
  "other";

export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  dish: "Страви",
  baking: "Випічка",
};

/**
 * The section a recipe most likely belongs to: desserts and baking go to
 * "Випічка", everything else to "Страви". Preselects the editor's switch and
 * files recipes stored before sections existed.
 */
export const guessCategory = (
  r: Pick<IRecipe, "title" | "tags"> & Partial<Pick<IRecipe, "ingredients">>
): RecipeCategory => {
  const kind = dishKind(r);
  return kind === "dessert" || kind === "baking" ? "baking" : "dish";
};

/** "Страви" / "Випічка" in pasted text; null when it is neither. */
export const categoryFromText = (text: string): RecipeCategory | null => {
  const t = normalize(text);
  if (/випічк|солодк|десерт/.test(t)) return "baking";
  if (/страв/.test(t)) return "dish";
  return null;
};
