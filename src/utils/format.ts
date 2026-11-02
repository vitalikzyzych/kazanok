/** Ukrainian plural: plural(5, ["рецепт", "рецепти", "рецептів"]) gives "рецептів". */
export const plural = (
  n: number,
  [one, few, many]: [string, string, string]
): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

export const countLabel = (
  n: number,
  forms: [string, string, string]
): string => `${n} ${plural(n, forms)}`;

export const SERVINGS: [string, string, string] = [
  "порція",
  "порції",
  "порцій",
];
export const RECIPES: [string, string, string] = [
  "рецепт",
  "рецепти",
  "рецептів",
];
export const STEPS: [string, string, string] = ["крок", "кроки", "кроків"];
export const INGREDIENTS: [string, string, string] = [
  "інгредієнт",
  "інгредієнти",
  "інгредієнтів",
];
export const TIMES: [string, string, string] = ["раз", "рази", "разів"];
export const DAYS: [string, string, string] = ["день", "дні", "днів"];
