/**
 * Checks firestore.rules against the payloads the app really sends.
 * Needs the emulator running: `npm run emulator`, then `npm run test:rules`.
 */
import { initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildSampleData } from "./sampleRecipes";

import { type IRecipe, shoppingItemsFrom } from "@/domain";

const PROJECT_ID = "demo-kazanok";
const app = initializeApp({ projectId: PROJECT_ID }, "rules-test");
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8180);

vi.mock("@/core/firebase", () => ({ getDb: () => db }));

const {
  addShoppingItems,
  deleteRecipe,
  deleteShoppingItems,
  getPhoto,
  markCooked,
  saveRecipe,
  setFavorite,
  setShoppingChecked,
} = await import("./RecipeSource");

const sample = buildSampleData();
const borshch = sample.recipes[0];
const photoId = borshch.photoId ?? "";
const photo = sample.photos[photoId];

beforeAll(async () => {
  await fetch(
    `http://127.0.0.1:8180/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: "DELETE" }
  );
});

const refused = (p: Promise<unknown>) =>
  expect(p).rejects.toMatchObject({ code: "permission-denied" });

describe("firestore.rules", () => {
  it("saves a recipe with its photo, then edits it", async () => {
    await saveRecipe(borshch, { add: { id: photoId, dataUrl: photo } });
    expect(await getPhoto(photoId)).toBe(photo);

    await saveRecipe({ ...borshch, title: "Борщ", totalMin: null });
    await setFavorite(borshch.id, false);
    await markCooked(borshch.id);
  });

  it("saves every sample recipe", async () => {
    for (const r of sample.recipes.slice(1)) await saveRecipe(r);
  });

  it("replaces a photo and removes the old one in one batch", async () => {
    const webp = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4";
    await saveRecipe(
      { ...borshch, photoId: "new-photo" },
      { add: { id: "new-photo", dataUrl: webp }, removeId: photoId }
    );
    expect(await getPhoto(photoId)).toBeNull();
    expect(await getPhoto("new-photo")).toBe(webp);
  });

  it("refuses recipes of another shape", async () => {
    const ref = doc(db, "recipes", "bad");
    const { id: _id, ...data } = borshch;
    await refused(setDoc(ref, { ...data, title: "" }));
    await refused(setDoc(ref, { ...data, servings: 0 }));
    await refused(setDoc(ref, { ...data, extra: true }));
    await refused(setDoc(ref, { ...data, notes: "x".repeat(2001) }));
    await refused(
      setDoc(ref, { ...data, steps: Array(61).fill(borshch.steps[0]) })
    );
  });

  it("keeps recipes stored before sections editable", async () => {
    const { id: _id, category: _c, ...old } = sample.recipes[1];
    await setDoc(doc(db, "recipes", "old-recipe"), old);
    await setFavorite("old-recipe", true);
    await refused(
      setDoc(doc(db, "recipes", "bad-section"), { ...old, category: "drinks" })
    );
  });

  it("refuses photos that are not images or are too big", async () => {
    await refused(
      setDoc(doc(db, "recipePhotos", "p1"), { dataUrl: "javascript:alert(1)" })
    );
    await refused(
      setDoc(doc(db, "recipePhotos", "p2"), {
        dataUrl: `data:image/webp;base64,${"A".repeat(900_000)}`,
      })
    );
    // Photos never change once written.
    await refused(
      setDoc(doc(db, "recipePhotos", "new-photo"), {
        dataUrl: "data:image/png;base64,AA",
      })
    );
  });

  it("deletes a recipe with its photo", async () => {
    const recipe: IRecipe = { ...borshch, photoId: "new-photo" };
    await deleteRecipe(recipe);
    expect(await getPhoto("new-photo")).toBeNull();
  });

  it("adds, ticks and clears shopping items", async () => {
    const items = shoppingItemsFrom(
      borshch.ingredients,
      borshch,
      1.5,
      new Date().toISOString()
    );
    await addShoppingItems(items);
    await addShoppingItems(sample.shopping);
    const ids = items.slice(0, 2).map((i) => i.id);
    await setShoppingChecked(ids, true);
    await deleteShoppingItems(ids);
  });

  it("allows only ticking on a stored shopping item", async () => {
    const ref = doc(db, "shoppingItems", sample.shopping[0].id);
    await updateDoc(ref, { checked: false });
    await refused(updateDoc(ref, { name: "Інше" }));
    await refused(updateDoc(ref, { checked: "yes" }));
  });

  it("refuses other collections", async () => {
    await refused(setDoc(doc(db, "tournaments", "x"), { name: "x" }));
  });
});
