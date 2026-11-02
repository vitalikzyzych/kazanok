import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "primereact/button";

import IngredientsPane from "./components/IngredientsPane";
import RecipeMenu from "./components/RecipeMenu";
import StepsPane from "./components/StepsPane";

import { AddToShoppingDialog, FavoriteButton, useCopyText } from "@/components";
import { formatMinutes, recipeAsText } from "@/domain";
import { rememberPhoto, useDocumentTitle, useWakeLock } from "@/hooks";
import { useCooking, useRecipeData, useToast } from "@/providers";
import {
  deleteRecipe,
  getPhoto,
  markCooked,
  saveRecipe,
} from "@/source/RecipeSource";
import { EmptyState, FluentIcon, RecipeCover, tintClass } from "@/ui";
import { countLabel, TIMES } from "@/utils";

const RecipePage = () => {
  const { id = "" } = useParams();
  const { recipeById } = useRecipeData();
  const { finishCooking } = useCooking();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { copy, dialog: copyDialog } = useCopyText();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const recipe = recipeById.get(id);

  useDocumentTitle(recipe?.title ?? "Рецепт");
  useWakeLock(Boolean(recipe));

  // Opened from a timer in the dock: show its step.
  const stepFromDock = (location.state as { step?: number } | null)?.step;
  useEffect(() => {
    if (stepFromDock === undefined) return;
    document
      .getElementById(`step-${stepFromDock}`)
      ?.scrollIntoView({ block: "center" });
  }, [stepFromDock, location.key]);

  if (!recipe)
    return (
      <div className="page">
        <EmptyState title="Рецепт не знайдено">
          <span>Можливо, його видалили.</span>
          <Link
            to="/"
            className="p-button p-button-outlined p-button-secondary"
          >
            До рецептів
          </Link>
        </EmptyState>
      </div>
    );

  const onError = (e: Error) =>
    toast.show("error", "Не вдалося зберегти", e.message);

  const cooked = () => {
    markCooked(recipe.id).catch(onError);
    finishCooking(recipe.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.show(
      "success",
      `Смачного! Записали, що ви готували «${recipe.title}»`
    );
  };

  const remove = async () => {
    // Kept for "Повернути"; the photo is already in the local cache.
    const photo = recipe.photoId
      ? await getPhoto(recipe.photoId).catch(() => null)
      : null;
    deleteRecipe(recipe).catch(onError);
    finishCooking(recipe.id);
    navigate("/");
    toast.show("info", `«${recipe.title}» видалено`, undefined, {
      label: "Повернути",
      onClick: () => {
        const add =
          recipe.photoId && photo
            ? { id: recipe.photoId, dataUrl: photo }
            : undefined;
        try {
          saveRecipe(add ? recipe : { ...recipe, photoId: null }, {
            add,
          }).catch(onError);
        } catch (e) {
          onError(e instanceof Error ? e : new Error(String(e)));
          return;
        }
        if (add) rememberPhoto(add.id, add.dataUrl);
        navigate(`/recipes/${recipe.id}`);
      },
    });
  };

  const cookedLabel = recipe.cookCount
    ? countLabel(recipe.cookCount, TIMES)
    : "ще ні";

  return (
    <div className="page detail">
      <div className="d-top">
        <div className="d-media">
          <RecipeCover dish={recipe} photoId={recipe.photoId} />
          <div className="d-bar">
            <Link to="/" className="bar-btn" aria-label="До рецептів">
              <FluentIcon name="ArrowLeft" />
            </Link>
            <span className="flex-1" />
            <FavoriteButton recipe={recipe} variant="bar" />
            <Button
              unstyled
              className="bar-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Ще дії"
            >
              <FluentIcon name="More" />
            </Button>
          </div>
        </div>

        <div className="d-head">
          {recipe.tags.length > 0 && (
            <div className="tags">
              {recipe.tags.map((t) => (
                <span key={t} className={`tag tag-tint ${tintClass(t)}`}>
                  {t}
                </span>
              ))}
            </div>
          )}
          <h1>{recipe.title}</h1>
          {recipe.description && <p className="desc">{recipe.description}</p>}
          <dl className="facts">
            <div>
              <dt>Час</dt>
              <dd>{formatMinutes(recipe.totalMin)}</dd>
            </div>
            <div>
              <dt>Порцій</dt>
              <dd>{recipe.servings}</dd>
            </div>
            <div>
              <dt>Готували</dt>
              <dd>{cookedLabel}</dd>
            </div>
          </dl>
          <div className="d-actions">
            <Button
              outlined
              severity="secondary"
              icon={<FluentIcon name="Cart" size={20} />}
              label="До покупок"
              onClick={() => setShopOpen(true)}
            />
            <Button
              text
              severity="secondary"
              icon={<FluentIcon name="Edit" size={20} />}
              label="Редагувати"
              onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
            />
          </div>
        </div>
      </div>

      <div className="d-cols">
        <IngredientsPane recipe={recipe} />
        <StepsPane recipe={recipe} onCooked={cooked} />
      </div>

      {menuOpen && (
        <RecipeMenu
          title={recipe.title}
          onEdit={() => navigate(`/recipes/${recipe.id}/edit`)}
          onCopy={() => copy(recipeAsText(recipe), "Рецепт скопійовано")}
          onDelete={() => void remove()}
          onHide={() => setMenuOpen(false)}
        />
      )}
      {shopOpen && (
        <AddToShoppingDialog
          recipe={recipe}
          onHide={() => setShopOpen(false)}
        />
      )}
      {copyDialog}
    </div>
  );
};

export default RecipePage;
