import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ProgressSpinner } from "primereact/progressspinner";

import { AppLayout } from "@/components";

const Recipes = lazy(() => import("@/screens/recipes"));
const RecipePage = lazy(() => import("@/screens/recipe"));
const RecipeEditor = lazy(() => import("@/screens/recipe-editor"));
const Shopping = lazy(() => import("@/screens/shopping"));

const ScreenFallback = () => (
  <div className="flex justify-content-center py-8">
    <ProgressSpinner
      style={{ width: "3rem", height: "3rem" }}
      strokeWidth="4"
    />
  </div>
);

const AppRouter = () => (
  <Suspense fallback={<ScreenFallback />}>
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Recipes key="dish" category="dish" />} />
        <Route
          path="baking"
          element={<Recipes key="baking" category="baking" />}
        />
        {/* The favourites page became a filter. */}
        <Route path="favorites" element={<Navigate to="/?fav=1" replace />} />
        <Route path="recipes/:id" element={<RecipePage />} />
        <Route path="recipes/:id/edit" element={<RecipeEditor />} />
        <Route path="add" element={<RecipeEditor />} />
        <Route path="shopping" element={<Shopping />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AppRouter;
