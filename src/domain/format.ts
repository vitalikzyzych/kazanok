import type { IIngredient, IRecipe } from "./types";

const KITCHEN_FRACTIONS: [number, string][] = [
  [0, ""],
  [0.25, "¼"],
  [1 / 3, "⅓"],
  [0.5, "½"],
  [2 / 3, "⅔"],
  [0.75, "¾"],
  [1, ""],
];

/**
 * Kitchen-friendly amount: grams and millilitres rounded (to 10 from 100),
 * kilograms and litres with two decimals, everything else as ½, ⅓, ¾.
 */
export const formatQty = (qty: number | null, unit: string): string => {
  if (qty === null) return "";
  if (unit === "г" || unit === "мл")
    return String(qty >= 100 ? Math.round(qty / 10) * 10 : Math.round(qty));
  if (unit === "кг" || unit === "л")
    return String(Math.round(qty * 100) / 100).replace(".", ",");

  let whole = Math.floor(qty);
  const frac = qty - whole;
  let best = KITCHEN_FRACTIONS[0];
  for (const c of KITCHEN_FRACTIONS)
    if (Math.abs(c[0] - frac) < Math.abs(best[0] - frac)) best = c;
  if (best[0] === 1) whole += 1;
  return `${whole || ""}${best[1]}` || "¼";
};

/** Amount for the recipe page, scaled by factor (servings chosen / recipe servings). */
export const formatAmount = (ing: IIngredient, factor = 1): string => {
  if (ing.qty === null) return ing.note;
  const qty = formatQty(ing.qty * factor, ing.unit);
  return ing.unit ? `${qty} ${ing.unit}` : qty;
};

/** One editor line, the same form the parser reads back: "Картопля — 1 кг (молода)". */
export const ingredientToLine = (ing: IIngredient): string => {
  const base =
    ing.qty === null
      ? ing.name
      : `${ing.name} — ${formatQty(ing.qty, ing.unit)} ${ing.unit}`.trim();
  return ing.note ? `${base} (${ing.note})` : base;
};

export const formatMinutes = (min: number | null): string => {
  if (!min) return "—";
  if (min < 60) return `${min} хв`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} год ${m} хв` : `${h} год`;
};

/** "4:05" or "1:02:05" for a running timer. */
export const formatCountdown = (ms: number): string => {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return m >= 60
    ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${s}`
    : `${m}:${s}`;
};

/** Plain text of a recipe, to paste into a chat or a note. */
export const recipeAsText = (r: IRecipe): string =>
  [
    r.title,
    ...(r.description ? [r.description] : []),
    `Порцій: ${r.servings}, час: ${formatMinutes(r.totalMin)}`,
    "",
    "Інгредієнти:",
    ...r.ingredients.map((i) => `- ${ingredientToLine(i)}`),
    "",
    "Приготування:",
    ...r.steps.map((s, i) => `${i + 1}. ${s.text}`),
    ...(r.notes ? ["", `Нотатки: ${r.notes}`] : []),
  ].join("\n");
