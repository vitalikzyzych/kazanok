import {
  guessCategory,
  ingredientToLine,
  type IRecipe,
  LIMITS,
  newId,
  parseIngredients,
  parseSteps,
  type RecipeCategory,
} from "@/domain";

/** The photo while editing: the stored one, a new one, or none. */
export type DraftPhoto =
  { kind: "keep" } | { kind: "new"; dataUrl: string } | { kind: "none" };

export interface IDraft {
  title: string;
  /** Chosen on the switch; null follows the dish type (guessCategory). */
  category: RecipeCategory | null;
  description: string;
  photo: DraftPhoto;
  totalMin: string;
  servings: string;
  tags: string[];
  ingText: string;
  stepText: string;
  notes: string;
}

export const draftFrom = (r: IRecipe | null): IDraft =>
  r
    ? {
        title: r.title,
        category: r.category,
        description: r.description,
        photo: r.photoId ? { kind: "keep" } : { kind: "none" },
        totalMin: r.totalMin ? String(r.totalMin) : "",
        servings: String(r.servings),
        tags: [...r.tags],
        ingText: r.ingredients.map(ingredientToLine).join("\n"),
        stepText: r.steps.map((s) => s.text).join("\n"),
        notes: r.notes,
      }
    : {
        title: "",
        category: null,
        description: "",
        photo: { kind: "none" },
        totalMin: "",
        servings: "4",
        tags: [],
        ingText: "",
        stepText: "",
        notes: "",
      };

/** The section the switch shows: the chosen one, or the guess. */
export const draftCategory = (d: IDraft): RecipeCategory =>
  d.category ?? guessCategory({ title: d.title, tags: d.tags });

const clampInt = (v: string, min: number, max: number): number | null => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= min ? Math.min(n, max) : null;
};

/** The recipe to store. Counters and favourite stay as they were. */
export const recipeFromDraft = (
  d: IDraft,
  old: IRecipe | null,
  photoId: string | null,
  now: string
): IRecipe => ({
  id: old?.id ?? newId(16),
  title: d.title.trim().slice(0, LIMITS.title),
  category: draftCategory(d),
  description: d.description.trim().slice(0, LIMITS.description),
  photoId,
  tags: d.tags.slice(0, LIMITS.tags),
  totalMin: clampInt(d.totalMin, 1, LIMITS.totalMin),
  servings: clampInt(d.servings, 1, LIMITS.servings) ?? 1,
  ingredients: parseIngredients(d.ingText).slice(0, LIMITS.ingredients),
  steps: parseSteps(d.stepText).slice(0, LIMITS.steps),
  notes: d.notes.trim().slice(0, LIMITS.notes),
  favorite: old?.favorite ?? false,
  cookCount: old?.cookCount ?? 0,
  lastCookedAt: old?.lastCookedAt ?? null,
  createdAt: old?.createdAt ?? now,
  updatedAt: now,
});
