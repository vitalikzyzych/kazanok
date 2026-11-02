import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  writeBatch,
} from "firebase/firestore";

import { buildSampleData } from "./sampleRecipes";

import { getDb } from "@/core/firebase";

/**
 * Local emulator only (npm run dev:emulator): an empty database gets the
 * sample recipes, so every screen has something to show. The real database
 * never sees them; main.tsx loads this file only with VITE_USE_EMULATOR.
 */
export const seedEmulator = async () => {
  const db = getDb();
  const existing = await getDocs(query(collection(db, "recipes"), limit(1)));
  if (!existing.empty) return;

  const { recipes, photos, shopping } = buildSampleData();
  const batch = writeBatch(db);
  for (const [id, dataUrl] of Object.entries(photos))
    batch.set(doc(db, "recipePhotos", id), { dataUrl });
  for (const { id, ...data } of recipes)
    batch.set(doc(db, "recipes", id), data);
  for (const { id, ...data } of shopping)
    batch.set(doc(db, "shoppingItems", id), data);
  await batch.commit();
};
