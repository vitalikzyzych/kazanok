import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { IRecipe, IShoppingItem } from "@/domain";
import { subscribeRecipes, subscribeShopping } from "@/source/RecipeSource";

interface IRecipeData {
  recipes: IRecipe[];
  recipeById: Map<string, IRecipe>;
  shopping: IShoppingItem[];
  /** Shopping items not bought yet (the badge on "Покупки"). */
  toBuyCount: number;
  loading: boolean;
  error: string | null;
}

const RecipeDataContext = createContext<IRecipeData | null>(null);

/**
 * One live subscription to all recipes and one to the shopping list, shared
 * by every screen. A few hundred recipes are small documents (photos are
 * separate), so search and filters run on this list in the browser.
 */
export const RecipeDataProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<IRecipe[] | null>(null);
  const [shopping, setShopping] = useState<IShoppingItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onError = (e: Error) => setError(e.message);
    const unsubscribeRecipes = subscribeRecipes(setRecipes, onError);
    const unsubscribeShopping = subscribeShopping(setShopping, onError);
    return () => {
      unsubscribeRecipes();
      unsubscribeShopping();
    };
  }, []);

  const value = useMemo<IRecipeData>(() => {
    const list = recipes ?? [];
    const items = shopping ?? [];
    return {
      recipes: list,
      recipeById: new Map(list.map((r) => [r.id, r])),
      shopping: items,
      toBuyCount: items.filter((i) => !i.checked).length,
      loading: (recipes === null || shopping === null) && !error,
      error,
    };
  }, [recipes, shopping, error]);

  return (
    <RecipeDataContext.Provider value={value}>
      {children}
    </RecipeDataContext.Provider>
  );
};

export const useRecipeData = (): IRecipeData => {
  const context = useContext(RecipeDataContext);
  if (!context)
    throw new Error("useRecipeData must be used inside RecipeDataProvider");
  return context;
};
