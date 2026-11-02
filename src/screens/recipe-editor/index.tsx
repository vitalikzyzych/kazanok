import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

import { IngredientsPreview, StepsPreview } from "./components/ParsePreview";
import PastePanel from "./components/PastePanel";
import PhotoPicker from "./components/PhotoPicker";
import TagsField from "./components/TagsField";
import { draftFrom, type IDraft, recipeFromDraft } from "./draft";

import {
  allTags,
  ingredientToLine,
  type IRecipe,
  newId,
  parseIngredients,
  parseRecipeText,
  parseSteps,
} from "@/domain";
import { rememberPhoto, useDocumentTitle } from "@/hooks";
import { useRecipeData, useToast } from "@/providers";
import { saveRecipe } from "@/source/RecipeSource";
import { EmptyState, FluentIcon } from "@/ui";
import { countLabel, INGREDIENTS, STEPS } from "@/utils";

const EditorForm = ({ recipe }: { recipe: IRecipe | null }) => {
  const { recipes } = useRecipeData();
  const toast = useToast();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<IDraft>(() => draftFrom(recipe));
  const [titleError, setTitleError] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const isNew = recipe === null;
  useDocumentTitle(isNew ? "Новий рецепт" : "Редагування");

  const knownTags = useMemo(() => allTags(recipes), [recipes]);
  const ingredients = useMemo(
    () => parseIngredients(draft.ingText),
    [draft.ingText]
  );
  const steps = useMemo(() => parseSteps(draft.stepText), [draft.stepText]);
  const back = isNew ? "/" : `/recipes/${recipe.id}`;

  const set = <K extends keyof IDraft>(key: K, value: IDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const parse = (text: string, auto: boolean) => {
    if (!text.trim()) {
      if (!auto) toast.show("warn", "Спершу вставте текст рецепта");
      return;
    }
    const p = parseRecipeText(text);
    setDraft((d) => ({
      ...d,
      title: p.title || d.title,
      description: p.description || d.description,
      servings: p.servings ? String(p.servings) : d.servings,
      totalMin: p.totalMin ? String(p.totalMin) : d.totalMin,
      ingText: p.ingredients.length
        ? p.ingredients.map(ingredientToLine).join("\n")
        : d.ingText,
      stepText: p.steps.length
        ? p.steps.map((s) => s.text).join("\n")
        : d.stepText,
    }));
    if (p.title) setTitleError(false);
    toast.show(
      "success",
      `Заповнили форму: ${countLabel(p.ingredients.length, INGREDIENTS)}, ${countLabel(p.steps.length, STEPS)}`,
      "Перевірте й збережіть."
    );
    titleRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const save = () => {
    if (!draft.title.trim()) {
      setTitleError(true);
      titleRef.current?.focus();
      return;
    }
    const oldPhotoId = recipe?.photoId ?? null;
    const added =
      draft.photo.kind === "new"
        ? { id: newId(16), dataUrl: draft.photo.dataUrl }
        : undefined;
    const photoId =
      added?.id ?? (draft.photo.kind === "keep" ? oldPhotoId : null);
    const next = recipeFromDraft(
      draft,
      recipe,
      photoId,
      new Date().toISOString()
    );
    const onError = (e: unknown) =>
      toast.show(
        "error",
        "Не вдалося зберегти",
        e instanceof Error ? e.message : String(e)
      );
    try {
      // The local copy updates at once; the server may answer much later
      // (offline in the kitchen), so the screen does not wait.
      saveRecipe(next, { add: added, removeId: oldPhotoId }).catch(onError);
    } catch (e) {
      onError(e);
      return;
    }
    if (added) rememberPhoto(added.id, added.dataUrl);
    toast.show("success", isNew ? "Рецепт додано" : "Зміни збережено");
    navigate(`/recipes/${next.id}`, { replace: true });
  };

  const formEmpty = !draft.title && !draft.ingText && !draft.stepText;

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-row">
          <Link
            to={back}
            className="bar-btn bar-btn--plain"
            aria-label="Скасувати"
          >
            <FluentIcon name="ArrowLeft" />
          </Link>
          <div className="grow">
            <h1 className="h-display h-display--sm">
              {isNew ? "Новий рецепт" : "Редагування"}
            </h1>
          </div>
          <Button
            icon={<FluentIcon name="Checkmark" size={20} />}
            label="Зберегти"
            onClick={save}
          />
        </div>
      </header>

      {isNew && <PastePanel onParse={parse} formEmpty={formEmpty} />}

      <form
        className="form"
        autoComplete="off"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="field">
          <span>Назва *</span>
          <InputText
            ref={titleRef}
            value={draft.title}
            onChange={(e) => {
              set("title", e.target.value);
              setTitleError(false);
            }}
            placeholder="Напр.: Борщ зелений"
            invalid={titleError}
          />
          {titleError && (
            <small className="err">Додайте назву, щоб зберегти рецепт.</small>
          )}
        </label>

        <label className="field">
          <span>Короткий опис</span>
          <InputTextarea
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            autoResize
            placeholder="Чим цей рецепт особливий"
          />
        </label>

        <div className="field">
          <span>Фото</span>
          <PhotoPicker
            seed={recipe?.id ?? (draft.title || "new")}
            storedPhotoId={recipe?.photoId ?? null}
            photo={draft.photo}
            onChange={(p) => set("photo", p)}
          />
        </div>

        <div className="two">
          <label className="field">
            <span>Час, хв</span>
            <InputText
              value={draft.totalMin}
              onChange={(e) => set("totalMin", e.target.value)}
              keyfilter="pint"
              inputMode="numeric"
            />
          </label>
          <label className="field">
            <span>Порцій</span>
            <InputText
              value={draft.servings}
              onChange={(e) => set("servings", e.target.value)}
              keyfilter="pint"
              inputMode="numeric"
            />
          </label>
        </div>

        <div className="field">
          <span>Теги</span>
          <TagsField
            value={draft.tags}
            known={knownTags}
            onChange={(t) => set("tags", t)}
          />
        </div>

        <label className="field">
          <span>Інгредієнти, по одному в рядку</span>
          <InputTextarea
            value={draft.ingText}
            onChange={(e) => set("ingText", e.target.value)}
            rows={9}
            placeholder={"Картопля — 1 кг\n2 яйця\nСіль (за смаком)"}
          />
        </label>
        <IngredientsPreview list={ingredients} />

        <label className="field">
          <span>Кроки, по одному в рядку</span>
          <InputTextarea
            value={draft.stepText}
            onChange={(e) => set("stepText", e.target.value)}
            rows={9}
            placeholder={
              "Натріть картоплю…\nСмажте по 3 хвилини з кожного боку."
            }
          />
        </label>
        <StepsPreview list={steps} />

        <label className="field">
          <span>Нотатки</span>
          <InputTextarea
            value={draft.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            autoResize
            placeholder="Що змінили, що варто пам’ятати"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            size="large"
            icon={<FluentIcon name="Checkmark" />}
            label="Зберегти рецепт"
          />
          <Button
            type="button"
            size="large"
            text
            severity="secondary"
            label="Скасувати"
            onClick={() => navigate(back)}
          />
        </div>
      </form>
    </div>
  );
};

/** /add and /recipes/:id/edit. The key gives each recipe a fresh form. */
const RecipeEditor = () => {
  const { id } = useParams();
  const { recipeById } = useRecipeData();
  if (!id) return <EditorForm key="new" recipe={null} />;

  const recipe = recipeById.get(id);
  if (!recipe)
    return (
      <div className="page">
        <EmptyState title="Рецепт не знайдено">
          <span>Можливо, його видалили.</span>
        </EmptyState>
      </div>
    );
  return <EditorForm key={id} recipe={recipe} />;
};

export default RecipeEditor;
