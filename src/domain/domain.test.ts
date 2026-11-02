import { describe, expect, it } from "vitest";

import {
  categoryFromText,
  CHATGPT_PROMPT_TEMPLATE,
  cleanTags,
  defaultShoppingSelection,
  detectTimer,
  filterRecipes,
  formatAmount,
  formatCountdown,
  formatGroupAmount,
  formatMinutes,
  formatQty,
  guessCategory,
  ingredientToLine,
  mergeShopping,
  pageOf,
  parseIngredient,
  parseQty,
  parseRecipeText,
  parseSteps,
  pickForToday,
  RECIPE_FORMAT_EXAMPLE,
  recipeAsText,
  recipeSchema,
  shoppingAsText,
  shoppingItemsFrom,
  shoppingRows,
  sortRecipes,
} from "./index";
import type { IRecipe, IRecipeFilter, IShoppingItem } from "./types";

const recipe = (over: Partial<IRecipe>): IRecipe => ({
  id: "r1",
  title: "Борщ",
  category: "dish",
  description: "",
  photoId: null,
  tags: [],
  totalMin: 60,
  servings: 4,
  ingredients: [],
  steps: [{ id: "s1", text: "Варіть", timerMin: null }],
  notes: "",
  favorite: false,
  cookCount: 0,
  lastCookedAt: null,
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
  ...over,
});

const noFilter: IRecipeFilter = {
  category: "dish",
  query: "",
  tags: [],
  maxMin: 0,
  favoritesOnly: false,
};

const item = (over: Partial<IShoppingItem>): IShoppingItem => ({
  id: "i1",
  name: "Буряк",
  qty: 2,
  unit: "шт",
  recipeId: null,
  recipeTitle: null,
  checked: false,
  addedAt: "2026-11-01T10:00:00.000Z",
  ...over,
});

const strip = <T extends { id: string }>(x: T | null) => {
  if (!x) return null;
  const { id: _id, ...rest } = x;
  return rest;
};

describe("parseIngredient", () => {
  it("reads name first, then amount", () => {
    expect(strip(parseIngredient("Картопля — 1 кг"))).toEqual({
      name: "Картопля",
      qty: 1,
      unit: "кг",
      note: "",
    });
    expect(strip(parseIngredient("Часник — 3 зубч."))).toMatchObject({
      qty: 3,
      unit: "зубч.",
    });
  });

  it("reads amount first, with units and list markers", () => {
    expect(strip(parseIngredient("- 500 мл молока"))).toEqual({
      name: "Молока",
      qty: 500,
      unit: "мл",
      note: "",
    });
    expect(strip(parseIngredient("1 ст. л. цукру"))).toMatchObject({
      name: "Цукру",
      qty: 1,
      unit: "ст. л.",
    });
    expect(strip(parseIngredient("2 яйця"))).toMatchObject({
      name: "Яйця",
      qty: 2,
      unit: "шт",
    });
  });

  it("keeps notes and amounts without numbers", () => {
    expect(strip(parseIngredient("Сіль (за смаком)"))).toEqual({
      name: "Сіль",
      qty: null,
      unit: "",
      note: "за смаком",
    });
    expect(strip(parseIngredient("Перець за смаком"))).toMatchObject({
      name: "Перець",
      note: "за смаком",
    });
    expect(strip(parseIngredient("Гриби — 200 г (за бажанням)"))).toMatchObject(
      { qty: 200, unit: "г", note: "за бажанням" }
    );
    expect(parseIngredient("   ")).toBeNull();
  });

  it("reads fractions and decimals", () => {
    expect(parseQty("½")).toBe(0.5);
    expect(parseQty("1 ½")).toBe(1.5);
    expect(parseQty("3/4")).toBe(0.75);
    expect(parseQty("2,5")).toBe(2.5);
    expect(parseIngredient("Вода — 2,5 л")).toMatchObject({
      qty: 2.5,
      unit: "л",
    });
  });

  it("round-trips through the editor line", () => {
    const lines = [
      "Картопля — 1 кг",
      "Сіль (за смаком)",
      "Гриби — 200 г (за бажанням)",
    ];
    for (const line of lines) {
      const ing = parseIngredient(line);
      expect(ing && ingredientToLine(ing)).toBe(line);
    }
  });
});

describe("steps and timers", () => {
  it("finds minutes, ranges and hours", () => {
    expect(detectTimer("Варіть 10 хвилин")).toBe(10);
    expect(detectTimer("обсмажте, 5–7 хвилин")).toBe(7);
    expect(detectTimer("на малому вогні 1,5 години")).toBe(90);
    expect(detectTimer("Подавайте гарячими")).toBeNull();
  });

  it("strips numbering and skips empty lines", () => {
    const steps = parseSteps("1. Збийте яйця\n\nКрок 2: Смажте 2 хв");
    expect(steps.map((s) => s.text)).toEqual(["Збийте яйця", "Смажте 2 хв"]);
    expect(steps[1].timerMin).toBe(2);
  });
});

describe("parseRecipeText", () => {
  it("splits a pasted recipe", () => {
    const r = parseRecipeText(
      [
        "Млинці на молоці",
        "Тонкі, з мереживними краями.",
        "Порцій: 4",
        "",
        "Інгредієнти:",
        "- 500 мл молока",
        "- 2 яйця",
        "- щіпка солі",
        "",
        "Приготування:",
        "1. Збийте яйця з цукром і сіллю, влийте половину молока.",
        "2. Дайте тісту постояти 15 хвилин.",
        "",
        "https://example.com/mlyntsi",
      ].join("\n")
    );
    expect(r.title).toBe("Млинці на молоці");
    expect(r.description).toBe("Тонкі, з мереживними краями.");
    expect(r.servings).toBe(4);
    expect(r.ingredients).toHaveLength(3);
    expect(r.steps).toHaveLength(2);
    expect(r.totalMin).toBe(25);
  });

  it("reads the ChatGPT format exactly", () => {
    const r = parseRecipeText(RECIPE_FORMAT_EXAMPLE);
    expect(r.title).toBe("Сирники зі сметаною");
    expect(r.description).toBe("Ніжні всередині, з рум’яною скоринкою.");
    expect(r.servings).toBe(3);
    expect(r.totalMin).toBe(25);
    expect(r.ingredients.map(strip)).toEqual([
      { name: "Кисломолочний сир", qty: 500, unit: "г", note: "" },
      { name: "Яйце", qty: 1, unit: "шт", note: "" },
      { name: "Цукор", qty: 2, unit: "ст. л.", note: "" },
      { name: "Борошно", qty: 4, unit: "ст. л.", note: "" },
      { name: "Цибуля", qty: 1, unit: "шт", note: "дрібно нарізана" },
      { name: "Сіль", qty: null, unit: "", note: "за смаком" },
      { name: "Сметана", qty: null, unit: "", note: "для подачі" },
    ]);
    expect(r.steps.map((s) => s.timerMin)).toEqual([null, null, 3]);
    expect(r.tags).toEqual(["Сніданок", "Українська кухня", "Вегетаріанське"]);
    expect(r.category).toBe("dish");
    expect(CHATGPT_PROMPT_TEMPLATE).toContain(RECIPE_FORMAT_EXAMPLE);
  });

  it("follows headings, keeps long descriptions, skips links", () => {
    const long =
      "Дуже довгий опис страви, який легко прийняти за крок, бо в ньому більше ніж вісімдесят символів.";
    const r = parseRecipeText(
      [
        "Салат",
        long,
        "Джерело: https://example.com/salad",
        "Інгредієнти:",
        "- Помідори — 3 шт",
        "Приготування:",
        "1. Наріжте.",
        "https://example.com",
      ].join("\n")
    );
    expect(r.description).toBe(long);
    expect(r.ingredients).toHaveLength(1);
    expect(r.steps.map((s) => s.text)).toEqual(["Наріжте."]);
  });

  it("reads hours and minutes on the time line", () => {
    expect(parseRecipeText("Борщ\nЧас: 1 год 15 хв").totalMin).toBe(75);
    expect(parseRecipeText("Борщ\nЧас: 2 год").totalMin).toBe(120);
    expect(parseRecipeText("Борщ\nЧас: 1,5 години").totalMin).toBe(90);
  });

  it("round-trips a recipe copied as text, tags included", () => {
    const r = recipe({
      title: "Борщ",
      totalMin: 75,
      tags: ["Суп", "Обід"],
      ingredients: [
        { id: "a", name: "Буряк", qty: 2, unit: "шт", note: "" },
        { id: "b", name: "Сіль", qty: null, unit: "", note: "за смаком" },
      ],
      steps: [{ id: "s", text: "Варіть 10 хвилин.", timerMin: 10 }],
    });
    const back = parseRecipeText(recipeAsText(r));
    expect(back.title).toBe("Борщ");
    expect(back.totalMin).toBe(75);
    expect(back.servings).toBe(4);
    expect(back.tags).toEqual(["Суп", "Обід"]);
    expect(back.category).toBe("dish");
    expect(
      parseRecipeText(recipeAsText({ ...r, category: "baking" })).category
    ).toBe("baking");
    expect(back.ingredients.map(strip)).toEqual(r.ingredients.map(strip));
    expect(back.steps.map((s) => s.timerMin)).toEqual([10]);
  });

  it("guesses sections without headings", () => {
    const r = parseRecipeText(
      "Салат\nПомідори — 3 шт\nОгірок — 2 шт\nНаріжте овочі великими шматками, полийте олією, посоліть і подавайте одразу до столу."
    );
    expect(r.ingredients.map((i) => i.name)).toEqual(["Помідори", "Огірок"]);
    expect(r.steps).toHaveLength(1);
  });
});

describe("formatting", () => {
  it("rounds amounts the kitchen way", () => {
    expect(formatQty(453, "г")).toBe("450");
    expect(formatQty(37.4, "г")).toBe("37");
    expect(formatQty(1.25, "кг")).toBe("1,25");
    expect(formatQty(1.5, "шт")).toBe("1½");
    expect(formatQty(0.33, "склянка")).toBe("⅓");
    expect(formatQty(0.95, "шт")).toBe("1");
  });

  it("scales by servings", () => {
    const ing = { id: "a", name: "Борошно", qty: 200, unit: "г", note: "" };
    expect(formatAmount(ing, 1.5)).toBe("300 г");
    expect(formatAmount({ ...ing, qty: null, note: "за смаком" }, 2)).toBe(
      "за смаком"
    );
  });

  it("formats durations", () => {
    expect(formatMinutes(null)).toBe("—");
    expect(formatMinutes(45)).toBe("45 хв");
    expect(formatMinutes(120)).toBe("2 год");
    expect(formatMinutes(75)).toBe("1 год 15 хв");
    expect(formatCountdown(65_000)).toBe("1:05");
    expect(formatCountdown(3_725_000)).toBe("1:02:05");
  });
});

describe("tags", () => {
  it("reuses known spelling, drops duplicates, keeps new ones", () => {
    expect(
      cleanTags(
        ["сніданок", " Вегетаріанське", "СНІДАНОК", "Нова кухня", ""],
        ["Сніданок", "Суп"]
      )
    ).toEqual(["Сніданок", "Вегетаріанське", "Нова кухня"]);
    expect(
      cleanTags(Array.from({ length: 20 }, (_, i) => `Тег ${i}`))
    ).toHaveLength(12);
  });
});

describe("sections and pages", () => {
  it("guesses the section from the dish", () => {
    expect(guessCategory({ title: "Яблучний пиріг", tags: [] })).toBe("baking");
    expect(guessCategory({ title: "Тірамісу", tags: [] })).toBe("baking");
    expect(guessCategory({ title: "Шашлик", tags: ["Мангал"] })).toBe("dish");
    expect(categoryFromText(" Випічка")).toBe("baking");
    expect(categoryFromText("страви")).toBe("dish");
    expect(categoryFromText("інше")).toBeNull();
  });

  it("lists only the section's recipes", () => {
    const list = [recipe({ id: "a" }), recipe({ id: "b", category: "baking" })];
    expect(
      filterRecipes(list, { ...noFilter, category: "baking" }).map((r) => r.id)
    ).toEqual(["b"]);
  });

  it("cuts pages and keeps the page in range", () => {
    const list = Array.from({ length: 45 }, (_, i) => i);
    expect(pageOf(list, 1, 20)).toMatchObject({ page: 1, pages: 3 });
    expect(pageOf(list, 3, 20).items).toEqual([40, 41, 42, 43, 44]);
    expect(pageOf(list, 9, 20).page).toBe(3);
    expect(pageOf(list, 0, 20).page).toBe(1);
    expect(pageOf([], 2, 10)).toMatchObject({ items: [], page: 1, pages: 1 });
  });
});

describe("search and sort", () => {
  const recipes = [
    recipe({
      id: "a",
      title: "Борщ з квасолею",
      tags: ["Суп"],
      totalMin: 120,
      cookCount: 9,
      favorite: true,
    }),
    recipe({
      id: "b",
      title: "Сирники",
      tags: ["Сніданок"],
      totalMin: 25,
      cookCount: 12,
      ingredients: [
        { id: "x", name: "Кисломолочний сир", qty: 500, unit: "г", note: "" },
      ],
    }),
    recipe({ id: "c", title: "Шакшука", tags: ["Сніданок"], totalMin: null }),
  ];
  const ids = (list: IRecipe[]) => list.map((r) => r.id);

  it("matches words with other endings and ingredients", () => {
    expect(
      ids(filterRecipes(recipes, { ...noFilter, query: "борщу" }))
    ).toEqual(["a"]);
    expect(ids(filterRecipes(recipes, { ...noFilter, query: "сир" }))).toEqual([
      "b",
    ]);
  });

  it("filters by tags, time and favourites", () => {
    expect(
      ids(filterRecipes(recipes, { ...noFilter, tags: ["Сніданок"] }))
    ).toEqual(["b", "c"]);
    expect(ids(filterRecipes(recipes, { ...noFilter, maxMin: 45 }))).toEqual([
      "b",
    ]);
    expect(
      ids(filterRecipes(recipes, { ...noFilter, favoritesOnly: true }))
    ).toEqual(["a"]);
  });

  it("sorts, recipes without time last", () => {
    expect(ids(sortRecipes(recipes, "often"))).toEqual(["b", "a", "c"]);
    expect(ids(sortRecipes(recipes, "fast"))).toEqual(["b", "a", "c"]);
    expect(ids(sortRecipes(recipes, "az"))).toEqual(["a", "b", "c"]);
  });
});

describe("shopping", () => {
  const r = recipe({
    ingredients: [
      { id: "1", name: "Буряк", qty: 2, unit: "шт", note: "" },
      { id: "2", name: "Сіль", qty: null, unit: "", note: "за смаком" },
      { id: "3", name: "Сметана", qty: null, unit: "", note: "для подачі" },
      { id: "4", name: "Капуста", qty: 300, unit: "г", note: "" },
    ],
  });

  it("preselects what is missing", () => {
    expect(defaultShoppingSelection(r, [])).toEqual(["1", "4"]);
    expect(defaultShoppingSelection(r, [item({ name: "буряк" })])).toEqual([
      "4",
    ]);
    expect(
      defaultShoppingSelection(r, [item({ name: "Буряк", checked: true })])
    ).toEqual(["1", "4"]);
  });

  it("scales new items", () => {
    const [beet] = shoppingItemsFrom(r.ingredients.slice(0, 1), r, 1.5, "t");
    expect(beet).toMatchObject({ qty: 3, recipeId: "r1", recipeTitle: "Борщ" });
  });

  it("merges the same product, amounts per unit", () => {
    const groups = mergeShopping([
      item({ id: "a" }),
      item({ id: "b", qty: 1 }),
      item({ id: "c", qty: 200, unit: "г" }),
      item({ id: "d", qty: null, unit: "" }),
      item({ id: "e", name: "Кава", qty: null, unit: "" }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].ids).toEqual(["a", "b", "c", "d"]);
    expect(formatGroupAmount(groups[0])).toBe("3 шт + 200 г");
    expect(formatGroupAmount(groups[1])).toBe("");
    expect(
      shoppingRows([item({ id: "x", checked: true }), item({ id: "y" })]).map(
        (g) => g.checked
      )
    ).toEqual([false, true]);
    expect(
      shoppingAsText([item({}), item({ id: "z", name: "Кава", qty: null })])
    ).toBe("Купити:\n- Буряк, 2 шт\n- Кава");
  });
});

describe("pickForToday", () => {
  const morning = new Date("2026-11-02T08:00:00");
  const recipes = [
    recipe({ id: "soup", tags: ["Суп"] }),
    recipe({ id: "breakfast", tags: ["Сніданок"] }),
    recipe({
      id: "recent",
      tags: ["Сніданок"],
      favorite: true,
      lastCookedAt: "2026-11-01T08:00:00",
    }),
  ];

  it("prefers the meal of the hour and skips what was just cooked", () => {
    expect(pickForToday(recipes, morning)?.id).toBe("breakfast");
    expect(pickForToday(recipes, morning, 1)?.id).toBe("soup");
    expect(pickForToday([], morning)).toBeNull();
  });
});

describe("recipeSchema", () => {
  it("accepts a recipe and rejects an empty title", () => {
    expect(recipeSchema.safeParse(recipe({})).success).toBe(true);
    expect(recipeSchema.safeParse(recipe({ title: " " })).success).toBe(false);
  });
});
