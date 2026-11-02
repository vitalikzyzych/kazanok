import {
  collection,
  doc,
  type DocumentData,
  getDoc,
  increment,
  onSnapshot,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { getDb } from "@/core/firebase";
import {
  type IRecipe,
  type IShoppingItem,
  recipeSchema,
  shoppingItemSchema,
} from "@/domain";

/**
 * Every Firestore read and write. firestore.rules mirrors these shapes, so
 * keep both in sync.
 *   recipes/{recipeId}         IRecipe without id
 *   recipePhotos/{photoId}     { dataUrl }, never inside the recipe, so the
 *                              list does not download photos
 *   shoppingItems/{itemId}     IShoppingItem without id
 *
 * Writes update the local snapshot at once; the promise settles when the
 * server answers (much later when offline), so screens do not wait for it.
 */
const RECIPES = "recipes";
const PHOTOS = "recipePhotos";
const SHOPPING = "shoppingItems";

type OnError = (error: Error) => void;
type Unsubscribe = () => void;

/** A document that does not fit the schema is skipped, not shown broken. */
const parseDocs = <T>(
  docs: { id: string; data: () => DocumentData }[],
  parse: (value: unknown) => { success: true; data: T } | { success: false }
): T[] =>
  docs.flatMap((d) => {
    const result = parse({ ...d.data(), id: d.id });
    if (result.success) return [result.data];
    console.warn(`Skipped invalid document ${d.id}`);
    return [];
  });

const withoutId = <T extends { id: string }>({ id: _id, ...rest }: T) => rest;

// ---------- recipes ----------

export const subscribeRecipes = (
  onData: (list: IRecipe[]) => void,
  onError: OnError
): Unsubscribe =>
  onSnapshot(
    collection(getDb(), RECIPES),
    (snapshot) =>
      onData(parseDocs(snapshot.docs, (v) => recipeSchema.safeParse(v))),
    onError
  );

interface IPhotoChange {
  /** A new photo to store with the recipe. */
  add?: { id: string; dataUrl: string };
  /** The photo the recipe no longer uses. */
  removeId?: string | null;
}

/** Creates or replaces a recipe, with its photo change in the same batch. */
export const saveRecipe = (
  recipe: IRecipe,
  photo: IPhotoChange = {}
): Promise<void> => {
  const db = getDb();
  const valid = recipeSchema.parse(recipe);
  const batch = writeBatch(db);
  if (photo.add)
    batch.set(doc(db, PHOTOS, photo.add.id), { dataUrl: photo.add.dataUrl });
  batch.set(doc(db, RECIPES, valid.id), withoutId(valid));
  if (photo.removeId && photo.removeId !== photo.add?.id)
    batch.delete(doc(db, PHOTOS, photo.removeId));
  return batch.commit();
};

/** Deletes the recipe and its photo. */
export const deleteRecipe = (recipe: IRecipe): Promise<void> => {
  const db = getDb();
  const batch = writeBatch(db);
  batch.delete(doc(db, RECIPES, recipe.id));
  if (recipe.photoId) batch.delete(doc(db, PHOTOS, recipe.photoId));
  return batch.commit();
};

export const setFavorite = (id: string, favorite: boolean): Promise<void> =>
  updateDoc(doc(getDb(), RECIPES, id), { favorite });

/** "Приготовано": one more time cooked, today. */
export const markCooked = (id: string): Promise<void> =>
  updateDoc(doc(getDb(), RECIPES, id), {
    cookCount: increment(1),
    lastCookedAt: new Date().toISOString(),
  });

// ---------- photos ----------

export const getPhoto = async (photoId: string): Promise<string | null> => {
  const snapshot = await getDoc(doc(getDb(), PHOTOS, photoId));
  const dataUrl: unknown = snapshot.data()?.dataUrl;
  return typeof dataUrl === "string" ? dataUrl : null;
};

// ---------- shopping list ----------

export const subscribeShopping = (
  onData: (list: IShoppingItem[]) => void,
  onError: OnError
): Unsubscribe =>
  onSnapshot(
    collection(getDb(), SHOPPING),
    (snapshot) =>
      onData(
        parseDocs(snapshot.docs, (v) => shoppingItemSchema.safeParse(v)).sort(
          (a, b) => a.addedAt.localeCompare(b.addedAt)
        )
      ),
    onError
  );

export const addShoppingItems = (items: IShoppingItem[]): Promise<void> => {
  const db = getDb();
  const batch = writeBatch(db);
  for (const item of items) {
    const valid = shoppingItemSchema.parse(item);
    batch.set(doc(db, SHOPPING, valid.id), withoutId(valid));
  }
  return batch.commit();
};

export const setShoppingChecked = (
  ids: string[],
  checked: boolean
): Promise<void> => {
  const db = getDb();
  const batch = writeBatch(db);
  for (const id of ids) batch.update(doc(db, SHOPPING, id), { checked });
  return batch.commit();
};

export const deleteShoppingItems = (ids: string[]): Promise<void> => {
  const db = getDb();
  const batch = writeBatch(db);
  for (const id of ids) batch.delete(doc(db, SHOPPING, id));
  return batch.commit();
};
