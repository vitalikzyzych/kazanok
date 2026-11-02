import { describe, expect, it } from "vitest";

import { buildSampleData } from "../source/sampleRecipes";

import { dishKind } from "./dish";

describe("dishKind", () => {
  it("reads the sample recipes", () => {
    const kinds = Object.fromEntries(
      buildSampleData().recipes.map((r) => [r.id, dishKind(r)])
    );
    expect(kinds).toEqual({
      borshch: "soup",
      varenyky: "vegetable",
      deruny: "vegetable",
      syrnyky: "breakfast",
      holubtsi: "meat",
      banosh: "breakfast",
      carbonara: "meat",
      shakshuka: "breakfast",
      curry: "meat",
      greek: "salad",
      pancakes: "breakfast",
      "chicken-soup": "soup",
      sharlotka: "baking",
      bulochky: "baking",
    });
  });

  it("uses the title, then tags, then meat or fish in ingredients", () => {
    expect(dishKind({ title: "Тірамісу", tags: [] })).toBe("dessert");
    expect(dishKind({ title: "Щось нове", tags: ["Випічка"] })).toBe("baking");
    expect(
      dishKind({
        title: "Паста",
        tags: [],
        ingredients: [
          { id: "a", name: "Лосось", qty: 1, unit: "шт", note: "" },
        ],
      })
    ).toBe("fish");
    expect(
      dishKind({
        title: "Паста",
        tags: [],
        ingredients: [{ id: "a", name: "Яйце", qty: 1, unit: "шт", note: "" }],
      })
    ).toBe("other");
  });
});
