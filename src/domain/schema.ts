import { z } from "zod";

/**
 * Shapes and size limits of stored documents. The Firestore rules will check
 * the same limits, so keep both in sync once the rules exist.
 */
export const LIMITS = {
  title: 120,
  description: 500,
  tags: 12,
  tag: 30,
  ingredients: 80,
  ingredientName: 120,
  ingredientNote: 120,
  steps: 60,
  stepText: 1000,
  notes: 2000,
  servings: 50,
  totalMin: 24 * 60,
  /** Data URL of a photo; Firestore allows 1 MiB per document. */
  photo: 900_000,
} as const;

const isoDate = z.string().min(10).max(40);

export const ingredientSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(LIMITS.ingredientName),
  qty: z.number().nonnegative().max(100_000).nullable(),
  unit: z.string().max(20),
  note: z.string().max(LIMITS.ingredientNote),
});

export const stepSchema = z.object({
  id: z.string().min(1).max(40),
  text: z.string().min(1).max(LIMITS.stepText),
  timerMin: z.number().int().positive().max(LIMITS.totalMin).nullable(),
});

export const recipeSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().trim().min(1, "Додайте назву").max(LIMITS.title),
  category: z.enum(["dish", "baking"]),
  description: z.string().max(LIMITS.description),
  photoId: z.string().min(1).max(40).nullable(),
  tags: z.array(z.string().min(1).max(LIMITS.tag)).max(LIMITS.tags),
  totalMin: z.number().int().positive().max(LIMITS.totalMin).nullable(),
  servings: z.number().int().min(1).max(LIMITS.servings),
  ingredients: z.array(ingredientSchema).max(LIMITS.ingredients),
  steps: z.array(stepSchema).max(LIMITS.steps),
  notes: z.string().max(LIMITS.notes),
  favorite: z.boolean(),
  cookCount: z.number().int().nonnegative(),
  lastCookedAt: isoDate.nullable(),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const shoppingItemSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(LIMITS.ingredientName),
  qty: z.number().nonnegative().max(100_000).nullable(),
  unit: z.string().max(20),
  recipeId: z.string().max(40).nullable(),
  recipeTitle: z.string().max(LIMITS.title).nullable(),
  checked: z.boolean(),
  addedAt: isoDate,
});
