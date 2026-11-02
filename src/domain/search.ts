import { normalize } from "./text";
import type { IRecipe, IRecipeFilter, RecipeSort } from "./types";

/** Tags of all recipes, the most used first. */
export const allTags = (recipes: IRecipe[]): string[] => {
  const count = new Map<string, number>();
  for (const r of recipes)
    for (const t of r.tags) count.set(t, (count.get(t) ?? 0) + 1);
  return [...count.keys()].sort(
    (a, b) =>
      (count.get(b) ?? 0) - (count.get(a) ?? 0) || a.localeCompare(b, "uk")
  );
};

/** Search words with the last letter of longer words dropped, so "борщу" finds "борщ". */
const searchWords = (query: string): string[] =>
  normalize(query)
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.length > 4 ? w.slice(0, -1) : w));

const haystack = (r: IRecipe): string =>
  normalize(
    [
      r.title,
      r.description,
      r.tags.join(" "),
      r.ingredients.map((i) => i.name).join(" "),
    ].join(" ")
  );

/** Anything narrowing the section's list (the section itself does not count). */
export const isFilterActive = (f: IRecipeFilter): boolean =>
  Boolean(f.query.trim() || f.tags.length || f.maxMin || f.favoritesOnly);

/** Every word must appear in the title, description, tags or ingredients. */
export const filterRecipes = (
  recipes: IRecipe[],
  f: IRecipeFilter
): IRecipe[] => {
  const words = searchWords(f.query);
  return recipes.filter((r) => {
    if (r.category !== f.category) return false;
    if (f.favoritesOnly && !r.favorite) return false;
    if (f.maxMin && (r.totalMin === null || r.totalMin > f.maxMin))
      return false;
    if (!f.tags.every((t) => r.tags.includes(t))) return false;
    if (!words.length) return true;
    const text = haystack(r);
    return words.every((w) => text.includes(w));
  });
};

export const SORT_OPTIONS: { value: RecipeSort; label: string }[] = [
  { value: "often", label: "Часто готуємо" },
  { value: "recent", label: "Нещодавно готували" },
  { value: "fast", label: "Найшвидші" },
  { value: "added", label: "Нещодавно додані" },
  { value: "az", label: "За абеткою" },
];

const COMPARE: Record<RecipeSort, (a: IRecipe, b: IRecipe) => number> = {
  often: (a, b) => b.cookCount - a.cookCount,
  recent: (a, b) => (b.lastCookedAt ?? "").localeCompare(a.lastCookedAt ?? ""),
  fast: (a, b) => (a.totalMin ?? Infinity) - (b.totalMin ?? Infinity),
  added: (a, b) => b.createdAt.localeCompare(a.createdAt),
  az: (a, b) => a.title.localeCompare(b.title, "uk"),
};

export const sortRecipes = (recipes: IRecipe[], sort: RecipeSort): IRecipe[] =>
  [...recipes].sort(
    (a, b) => COMPARE[sort](a, b) || a.title.localeCompare(b.title, "uk")
  );

export const PAGE_SIZES = [10, 20, 50] as const;

/**
 * One page of a list, 1-based. A page past the end shows the last page, so a
 * link kept from a longer list still shows something.
 */
export const pageOf = <T>(
  list: T[],
  page: number,
  size: number
): { items: T[]; page: number; pages: number } => {
  const pages = Math.max(1, Math.ceil(list.length / size));
  const p = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  return { items: list.slice((p - 1) * size, p * size), page: p, pages };
};
