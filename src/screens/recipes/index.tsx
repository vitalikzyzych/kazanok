import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";

import FilterChips from "./components/FilterChips";
import RecipePost from "./components/RecipePost";
import TodayCard from "./components/TodayCard";

import { AddToShoppingDialog, ThemeButton } from "@/components";
import {
  allTags,
  CATEGORY_LABELS,
  filterRecipes,
  type IRecipe,
  type IRecipeFilter,
  isFilterActive,
  PAGE_SIZES,
  pageOf,
  type RecipeCategory,
  type RecipeSort,
  SORT_OPTIONS,
  sortRecipes,
} from "@/domain";
import {
  DESKTOP_QUERY,
  useDocumentTitle,
  useMediaQuery,
  usePageSize,
} from "@/hooks";
import { useRecipeData } from "@/providers";
import { EmptyState, FluentIcon, Logo } from "@/ui";
import { countLabel, RECIPES } from "@/utils";

const isSort = (v: string | null): v is RecipeSort =>
  SORT_OPTIONS.some((o) => o.value === v);

/** Filters that send the list back to page 1 when they change. */
const FILTER_KEYS = ["q", "tag", "time", "fav", "sort"];

/**
 * "Страви" and "Випічка": search, filters and one page of the feed. Filters
 * and the page live in the URL (?q=&tag=&time=&fav=1&sort=&page=), so going
 * back from a recipe returns to the same place.
 */
const Recipes = ({ category }: { category: RecipeCategory }) => {
  const { recipes } = useRecipeData();
  const [params, setParams] = useSearchParams();
  const [shopFor, setShopFor] = useState<IRecipe | null>(null);
  const [pageSize, setPageSize] = usePageSize();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const listTop = useRef<HTMLDivElement>(null);
  useDocumentTitle(category === "dish" ? null : CATEGORY_LABELS[category]);

  const sortParam = params.get("sort");
  const sort: RecipeSort = isSort(sortParam) ? sortParam : "often";
  const filter: IRecipeFilter = {
    category,
    query: params.get("q") ?? "",
    tags: params.getAll("tag"),
    maxMin: Number(params.get("time")) || 0,
    favoritesOnly: params.get("fav") === "1",
  };

  const update = (change: (p: URLSearchParams) => void) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        change(next);
        next.delete("page");
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
  const setFavorites = (on: boolean) =>
    update((p) => (on ? p.set("fav", "1") : p.delete("fav")));
  const setSort = (s: RecipeSort) =>
    update((p) => (s === "often" ? p.delete("sort") : p.set("sort", s)));
  const reset = () =>
    update((p) =>
      FILTER_KEYS.filter((k) => k !== "sort").forEach((k) => p.delete(k))
    );

  const goToPage = (page: number, size: number) => {
    if (size !== pageSize) setPageSize(size);
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (page > 1 && size === pageSize) next.set("page", String(page));
        else next.delete("page");
        return next;
      },
      { replace: false }
    );
    listTop.current?.scrollIntoView({ block: "start" });
  };

  const sectionRecipes = useMemo(
    () => recipes.filter((r) => r.category === category),
    [recipes, category]
  );
  const tags = useMemo(() => allTags(sectionRecipes), [sectionRecipes]);
  const list = sortRecipes(filterRecipes(recipes, filter), sort);
  const filtering = isFilterActive(filter);
  const page = pageOf(list, Number(params.get("page")) || 1, pageSize);

  const empty =
    filter.favoritesOnly &&
    list.length === 0 &&
    !isFilterActive({ ...filter, favoritesOnly: false }) ? (
      <EmptyState icon="Heart" title="Улюблених поки немає">
        <span>Натисніть сердечко під рецептом, і він з’явиться тут.</span>
      </EmptyState>
    ) : sectionRecipes.length === 0 ? (
      <EmptyState title="Тут поки порожньо">
        <span>
          Додайте перший рецепт у розділ «{CATEGORY_LABELS[category]}».
        </span>
        <Link
          to="/add"
          className="p-button p-button-outlined p-button-secondary"
        >
          <FluentIcon name="Add" size={20} />
          Додати рецепт
        </Link>
      </EmptyState>
    ) : (
      <EmptyState title="Нічого не знайшли">
        <span>Спробуйте інше слово або приберіть фільтри.</span>
        <Button
          label="Скинути фільтри"
          outlined
          severity="secondary"
          onClick={reset}
        />
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
        <h1 className="sr-only">{CATEGORY_LABELS[category]}</h1>
        <label className="search">
          <span className="sr-only">Пошук</span>
          <FluentIcon name="Search" size={20} />
          <InputText
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder={
              category === "dish"
                ? "Страва, інгредієнт або тег"
                : "Випічка, інгредієнт або тег"
            }
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
          favoritesOnly={filter.favoritesOnly}
          onFavorites={setFavorites}
          tags={tags}
          selectedTags={filter.tags}
          maxMin={filter.maxMin}
          onToggleTag={toggleTag}
          onTime={setTime}
        />
      </header>

      {!filtering && sectionRecipes.length > 0 && (
        <TodayCard recipes={sectionRecipes} />
      )}

      <div className="results-head" ref={listTop}>
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
        <>
          <div className="feed">
            {page.items.map((r) => (
              <RecipePost key={r.id} recipe={r} onShop={setShopFor} />
            ))}
          </div>
          {list.length > PAGE_SIZES[0] && (
            <Paginator
              first={(page.page - 1) * pageSize}
              rows={pageSize}
              totalRecords={list.length}
              rowsPerPageOptions={[...PAGE_SIZES]}
              onPageChange={(e) => goToPage(e.page + 1, e.rows)}
              template={
                desktop
                  ? "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                  : "PrevPageLink CurrentPageReport NextPageLink RowsPerPageDropdown"
              }
              currentPageReportTemplate="{currentPage} з {totalPages}"
              pageLinkSize={5}
              className="pager"
            />
          )}
        </>
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
