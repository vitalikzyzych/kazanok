import { formatQty } from "./format";
import { newId, normalize } from "./text";
import type {
  IIngredient,
  IRecipe,
  IShoppingGroup,
  IShoppingItem,
} from "./types";

/** Always at home: never preselected for the shopping list. */
const STAPLES = [
  "сіль",
  "вода",
  "олія",
  "цукор",
  "чорний перець",
  "оливкова олія",
];

export const isStaple = (name: string): boolean =>
  STAPLES.includes(normalize(name));

export const isOptional = (ing: IIngredient): boolean =>
  /для подачі|за бажанням/.test(normalize(ing.note));

/** Names of items still to buy, normalised. */
const pendingNames = (items: IShoppingItem[]): Set<string> =>
  new Set(items.filter((i) => !i.checked).map((i) => normalize(i.name)));

export const isInShoppingList = (
  ing: IIngredient,
  items: IShoppingItem[]
): boolean => pendingNames(items).has(normalize(ing.name));

/** Ingredients preselected in "До покупок": no staples, no garnish, nothing already listed. */
export const defaultShoppingSelection = (
  recipe: IRecipe,
  items: IShoppingItem[]
): string[] => {
  const listed = pendingNames(items);
  return recipe.ingredients
    .filter(
      (i) =>
        !isStaple(i.name) && !isOptional(i) && !listed.has(normalize(i.name))
    )
    .map((i) => i.id);
};

/** New shopping items for the chosen ingredients, scaled to the servings chosen. */
export const shoppingItemsFrom = (
  ingredients: IIngredient[],
  recipe: IRecipe | null,
  factor: number,
  now: string
): IShoppingItem[] =>
  ingredients.map((i) => ({
    id: newId(),
    name: i.name,
    qty: i.qty === null ? null : Math.round(i.qty * factor * 100) / 100,
    unit: i.unit,
    recipeId: recipe?.id ?? null,
    recipeTitle: recipe?.title ?? null,
    checked: false,
    addedAt: now,
  }));

/** Items with the same name become one row, amounts added up per unit. */
export const mergeShopping = (items: IShoppingItem[]): IShoppingGroup[] => {
  const groups = new Map<string, IShoppingGroup>();
  for (const it of items) {
    const key = normalize(it.name);
    let g = groups.get(key);
    if (!g) {
      g = { name: it.name, amounts: [], ids: [], checked: true };
      groups.set(key, g);
    }
    if (it.qty !== null) {
      const same = g.amounts.find((a) => a.unit === it.unit);
      if (same) same.qty += it.qty;
      else g.amounts.push({ qty: it.qty, unit: it.unit });
    }
    g.ids.push(it.id);
    if (!it.checked) g.checked = false;
  }
  return [...groups.values()];
};

/** "400 г", or "1 кг + 200 г" when recipes used different units. */
export const formatGroupAmount = (g: IShoppingGroup): string =>
  g.amounts
    .map((a) => `${formatQty(a.qty, a.unit)} ${a.unit}`.trim())
    .join(" + ");

/** To buy first, then what is ticked; the same product is one row. */
export const shoppingRows = (items: IShoppingItem[]): IShoppingGroup[] => [
  ...mergeShopping(items.filter((i) => !i.checked)),
  ...mergeShopping(items.filter((i) => i.checked)),
];

export const shoppingAsText = (items: IShoppingItem[]): string =>
  [
    "Купити:",
    ...mergeShopping(items.filter((i) => !i.checked)).map((g) => {
      const amount = formatGroupAmount(g);
      return `- ${g.name}${amount ? `, ${amount}` : ""}`;
    }),
  ].join("\n");
