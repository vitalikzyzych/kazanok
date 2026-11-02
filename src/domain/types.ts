export interface IIngredient {
  id: string;
  name: string;
  /** null for "за смаком" and other amounts without a number. */
  qty: number | null;
  /** Normalised unit ("г", "ст. л.", "шт"), "" when there is none. */
  unit: string;
  /** "за смаком", "для подачі", "дрібно нарізана", ... */
  note: string;
}

export interface IStep {
  id: string;
  text: string;
  /** Minutes found in the text ("10 хвилин"); the step gets a timer. */
  timerMin: number | null;
}

/**
 * One document per recipe: ingredients and steps live inside it. The photo is
 * a separate document (photoId), so the list never downloads photos.
 */
/** Section in the bottom bar: "Страви" or "Випічка". */
export type RecipeCategory = "dish" | "baking";

export interface IRecipe {
  id: string;
  title: string;
  category: RecipeCategory;
  description: string;
  photoId: string | null;
  tags: string[];
  totalMin: number | null;
  servings: number;
  ingredients: IIngredient[];
  steps: IStep[];
  notes: string;
  favorite: boolean;
  cookCount: number;
  /** ISO date-time strings. */
  lastCookedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IShoppingItem {
  id: string;
  name: string;
  qty: number | null;
  unit: string;
  recipeId: string | null;
  recipeTitle: string | null;
  checked: boolean;
  addedAt: string;
}

/** Shopping items with the same name, shown as one row. */
export interface IShoppingGroup {
  name: string;
  /** Summed per unit; items without an amount add nothing. */
  amounts: { qty: number; unit: string }[];
  ids: string[];
  checked: boolean;
}

/** What the paste parser found in a recipe text. */
export interface IParsedRecipe {
  title: string;
  description: string;
  servings: number | null;
  totalMin: number | null;
  /** From a "Розділ:" line; null when the text has none. */
  category: RecipeCategory | null;
  /** As written in the text; the editor matches them to known tags. */
  tags: string[];
  ingredients: IIngredient[];
  steps: IStep[];
}

export type RecipeSort = "often" | "recent" | "fast" | "added" | "az";

export interface IRecipeFilter {
  /** Only recipes of this section. */
  category: RecipeCategory;
  query: string;
  tags: string[];
  /** 0 means no time limit. */
  maxMin: number;
  favoritesOnly: boolean;
}
