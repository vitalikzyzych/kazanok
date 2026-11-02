import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";

import FilterChips from "./components/FilterChips";
import RecipePost from "./components/RecipePost";
import TodayCard from "./components/TodayCard";

import { AddToShoppingDialog, ThemeButton } from "@/components";
import {
  allTags,
  filterRecipes,
  type IRecipe,
  type IRecipeFilter,
  isFilterActive,
  type RecipeSort,
  SORT_OPTIONS,
  sortRecipes,
} from "@/domain";
import { useDocumentTitle } from "@/hooks";
import { useRecipeData } from "@/providers";
import { EmptyState, FluentIcon, Logo } from "@/ui";
import { countLabel, RECIPES } from "@/utils";

const isSort = (v: string | null): v is RecipeSort =>
  SORT_OPTIONS.some((o) => o.value === v);

/**
 * Home and "Улюблені": search, filters and the feed. Filters live in the URL
 * (?q=&tag=&time=&sort=), so going back from a recipe keeps them.
 */
const Recipes = ({ favoritesOnly = false }: { favoritesOnly?: boolean }) => {
  const { recipes } = useRecipeData();
  const [params, setParams] = useSearchParams();
  const [shopFor, setShopFor] = useState<IRecipe | null>(null);
  useDocumentTitle(favoritesOnly ? "Улюблені" : null);

  const sortParam = params.get("sort");
  const sort: RecipeSort = isSort(sortParam) ? sortParam : "often";
  const filter: IRecipeFilter = {
    query: params.get("q") ?? "",
    tags: params.getAll("tag"),
    maxMin: Number(params.get("time")) || 0,
    favoritesOnly,
  };

  const update = (change: (p: URLSearchParams) => void) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        change(next);
        return next;
      },
      { replace: true }
    );

  const setQuery = (q: string) =>
    update((p) => (q ? p.set("q", q) : p.delete("q")));
  const toggleTag = (tag: string) =>
    update((p) => {
      const tags = p.getAll("tag");
      p.delete("tag");
      for (const t of tags.includes(tag)
        ? tags.filter((x) => x !== tag)
        : [...tags, tag])
        p.append("tag", t);
    });
  const setTime = (m: number) =>
    update((p) => (m ? p.set("time", String(m)) : p.delete("time")));
  const setSort = (s: RecipeSort) =>
    update((p) => (s === "often" ? p.delete("sort") : p.set("sort", s)));
  const reset = () =>
    update((p) => ["q", "tag", "time"].forEach((k) => p.delete(k)));

  const tags = useMemo(() => allTags(recipes), [recipes]);
  const list = sortRecipes(filterRecipes(recipes, filter), sort);
  const filtering = isFilterActive({ ...filter, favoritesOnly: false });

  const empty =
    favoritesOnly && !filtering ? (
      <EmptyState icon="Heart" title="Тут поки порожньо">
        <span>Натисніть сердечко під рецептом, і він з’явиться тут.</span>
      </EmptyState>
    ) : (
      <EmptyState title="Нічого не знайшли">
        <span>Спробуйте інше слово або приберіть фільтри.</span>
        <div className="flex flex-wrap gap-2 justify-content-center">
          {filtering && (
            <Button
              label="Скинути фільтри"
              outlined
              severity="secondary"
              onClick={reset}
            />
          )}
          <Link
            to="/add"
            className="p-button p-button-outlined p-button-secondary"
          >
            <FluentIcon name="Add" size={20} />
            Додати рецепт
          </Link>
        </div>
      </EmptyState>
    );

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-row hide-desk">
          <span className="side" />
          <span className="center-logo">
            <Logo />
          </span>
          <span className="side">
            <ThemeButton />
          </span>
        </div>
        {favoritesOnly ? (
          <h1 className="h-display">Улюблені</h1>
        ) : (
          <h1 className="sr-only">Рецепти</h1>
        )}
        <label className="search">
          <span className="sr-only">Пошук</span>
          <FluentIcon name="Search" size={20} />
          <InputText
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Страва, інгредієнт або тег"
            value={filter.query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {filter.query && (
            <Button
              rounded
              text
              icon={<FluentIcon name="Dismiss" />}
              onClick={() => setQuery("")}
              aria-label="Очистити пошук"
              className="btn-icon search__clear"
            />
          )}
        </label>
        <FilterChips
          tags={tags}
          selectedTags={filter.tags}
          maxMin={filter.maxMin}
          onToggleTag={toggleTag}
          onTime={setTime}
        />
      </header>

      {!favoritesOnly && !filtering && recipes.length > 0 && (
        <TodayCard recipes={recipes} />
      )}

      <div className="results-head">
        <span className="count">{countLabel(list.length, RECIPES)}</span>
        <Dropdown
          value={sort}
          options={SORT_OPTIONS}
          onChange={(e) => setSort(e.value as RecipeSort)}
          aria-label="Сортування"
          className="sort-dropdown"
          panelClassName="sort-panel"
        />
      </div>

      {list.length ? (
        <div className="feed">
          {list.map((r) => (
            <RecipePost key={r.id} recipe={r} onShop={setShopFor} />
          ))}
        </div>
      ) : (
        empty
      )}

      {shopFor && (
        <AddToShoppingDialog recipe={shopFor} onHide={() => setShopFor(null)} />
      )}
    </div>
  );
};

export default Recipes;
