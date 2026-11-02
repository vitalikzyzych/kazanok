import type { IRecipe } from "./types";

const DAY_MS = 864e5;

export const daysSince = (iso: string | null, now: number): number | null =>
  iso ? Math.max(0, Math.round((now - Date.parse(iso)) / DAY_MS)) : null;

export const greeting = (hour: number): string => {
  if (hour < 5) return "Доброї ночі";
  if (hour < 11) return "Доброго ранку";
  if (hour < 17) return "Доброго дня";
  if (hour < 23) return "Доброго вечора";
  return "Доброї ночі";
};

/** Tags that fit the time of day. */
const mealTags = (hour: number): string[] => {
  if (hour < 11) return ["Сніданок"];
  if (hour < 16) return ["Обід", "Суп", "Салат"];
  return ["Вечеря", "Основна страва"];
};

/**
 * "What shall we cook?" on the home screen: a recipe with steps, not cooked in
 * the last 3 days, preferring the meal of the hour, favourites and recipes not
 * cooked for a while. skip moves to the next candidate ("Інша ідея").
 */
export const pickForToday = (
  recipes: IRecipe[],
  now: Date,
  skip = 0
): IRecipe | null => {
  const ms = now.getTime();
  const want = mealTags(now.getHours());
  let pool = recipes.filter((r) => {
    const d = daysSince(r.lastCookedAt, ms);
    return r.steps.length > 0 && (d === null || d >= 3);
  });
  if (!pool.length) pool = recipes;
  if (!pool.length) return null;

  const score = (r: IRecipe) =>
    (r.tags.some((t) => want.includes(t)) ? 4 : 0) +
    (r.favorite ? 2 : 0) +
    Math.min(3, (daysSince(r.lastCookedAt, ms) ?? 30) / 10);
  const sorted = [...pool].sort(
    (a, b) => score(b) - score(a) || a.title.localeCompare(b.title, "uk")
  );
  return sorted[skip % sorted.length];
};
