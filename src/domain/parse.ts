import { categoryFromText } from "./dish";
import { capitalize, newId, normalize } from "./text";
import type { IIngredient, IParsedRecipe, IStep } from "./types";

/**
 * Parsers for recipe text typed or pasted by hand: one ingredient per line
 * ("Картопля — 1 кг", "2 яйця", "Сіль (за смаком)"), one step per line, and
 * whole recipes copied from a site, a chat or a note.
 */

const UNIT_RE =
  /^(кг|г|гр|мл|л|шт\.?|ст\.?\s?л\.?|ч\.?\s?л\.?|склянк[аиу]|склянок|зубч\S*|пучк?о?к\S*|пучк\S*|щіпк\S*|банк\S*|уп\.?)(?=[\s,]|$)/i;

const QTY =
  "(\\d+(?:[.,]\\d+)?(?:\\s*[-–]\\s*\\d+(?:[.,]\\d+)?)?|\\d+\\/\\d+|\\d*\\s?[½¼¾⅓⅔])";

const FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
};

const normalizeUnit = (unit: string): string => {
  const u = unit.toLowerCase();
  if (/^ст/.test(u)) return "ст. л.";
  if (/^ч/.test(u)) return "ч. л.";
  if (/^склян/.test(u)) return "склянка";
  if (/^зубч/.test(u)) return "зубч.";
  if (/^пуч/.test(u)) return "пучок";
  if (/^щіп/.test(u)) return "щіпка";
  if (/^бан/.test(u)) return "банка";
  if (/^уп/.test(u)) return "уп.";
  if (/^шт/.test(u)) return "шт";
  if (u === "гр") return "г";
  return u;
};

/** "1,5" → 1.5, "½" → 0.5, "1 ½" → 1.5, "3/4" → 0.75, "5–7" → 5. */
export const parseQty = (raw: string): number | null => {
  const s = raw.replace(",", ".").trim();
  let m = s.match(/^(\d+)?\s*([½¼¾⅓⅔])$/);
  if (m) return Number(m[1] ?? 0) + FRACTIONS[m[2]];
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  m = s.match(/^(\d+(?:\.\d+)?)/);
  if (m) return Number(m[1]);
  return null;
};

const splitUnit = (text: string): { unit: string; rest: string } => {
  const m = text.match(UNIT_RE);
  if (!m) return { unit: "", rest: text };
  return {
    unit: normalizeUnit(m[1]),
    rest: text.slice(m[0].length).replace(/^[\s,]+/, ""),
  };
};

export const parseIngredient = (raw: string): IIngredient | null => {
  let line = raw.replace(/^\s*([-•*–·]|\d+[.)])\s+/, "").trim();
  if (!line) return null;

  let note = "";
  const paren = line.match(/\(([^)]+)\)\s*$/);
  if (paren && paren.index !== undefined) {
    note = paren[1].trim();
    line = line.slice(0, paren.index).trim();
  }

  // "2 ст. л. цукру"
  let m = line.match(new RegExp(`^${QTY}\\s*(.+)$`));
  if (m) {
    const { unit, rest } = splitUnit(m[2]);
    const qty = parseQty(m[1]);
    return {
      id: newId(8),
      name: capitalize(rest),
      qty,
      unit: unit || (qty !== null ? "шт" : ""),
      note,
    };
  }

  // "Цукор — 2 ст. л."
  m = line.match(new RegExp(`^(.+?)\\s*[—–:-]\\s*${QTY}\\s*(.*)$`));
  if (m) {
    const { unit, rest } = splitUnit(m[3]);
    const qty = parseQty(m[2]);
    return {
      id: newId(8),
      name: capitalize(m[1]),
      qty,
      unit: unit || (qty !== null ? "шт" : ""),
      note: [note, rest].filter(Boolean).join(", "),
    };
  }

  // "Сіль за смаком"
  const t = line.match(
    /^(.+?)[,\s—–-]+(за смаком|до смаку|для подачі|за бажанням)$/i
  );
  if (t)
    return {
      id: newId(8),
      name: capitalize(t[1]),
      qty: null,
      unit: "",
      note: t[2].toLowerCase(),
    };

  return { id: newId(8), name: capitalize(line), qty: null, unit: "", note };
};

export const parseIngredients = (text: string): IIngredient[] =>
  text
    .split(/\r?\n/)
    .map(parseIngredient)
    .filter((i): i is IIngredient => i !== null);

/** Minutes mentioned in a step: "10 хвилин", "5–7 хв" (the upper bound), "1,5 години". */
export const detectTimer = (text: string): number | null => {
  const m = text.match(
    /(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(хв|хвилин|год)/i
  );
  if (!m) return null;
  let n = Number.parseFloat((m[2] ?? m[1]).replace(",", "."));
  if (/^год/i.test(m[3])) n *= 60;
  return Math.round(n) || null;
};

/** Total time: "45 хв", "2 год", "1 год 15 хв", "1,5 години". */
export const parseDuration = (text: string): number | null => {
  const h = text.match(/(\d+(?:[.,]\d+)?)\s*год/i);
  const m = text.match(/(\d+)\s*хв/i);
  if (!h && !m) return detectTimer(text);
  const total =
    (h ? Number.parseFloat(h[1].replace(",", ".")) * 60 : 0) +
    (m ? Number(m[1]) : 0);
  return Math.round(total) || null;
};

export const parseSteps = (text: string): IStep[] =>
  text
    .split(/\r?\n/)
    .map((l) =>
      l.replace(/^\s*(крок\s*\d+[.:)]?|\d+[.)]|[-•*])\s*/i, "").trim()
    )
    .filter(Boolean)
    .map((t) => ({ id: newId(8), text: t, timerMin: detectTimer(t) }));

const ING_LINE_RE = new RegExp(
  `^([-•*·]\\s*)?${QTY}\\s*${UNIT_RE.source.slice(1)}`,
  "i"
);

const looksLikeIngredient = (l: string) =>
  /^[-•*·]\s/.test(l) ||
  ING_LINE_RE.test(l) ||
  (/[—–:-]\s*\d/.test(l) && l.length < 60) ||
  /(за смаком|до смаку)$/i.test(l);

const looksLikeStep = (l: string) =>
  (/^(\d+[.)]|крок\s*\d)/i.test(l) && l.length > 25) || l.length > 80;

const ING_HEADING =
  /^(інгредієнти|інгредієнт|продукти|що потрібно|вам знадобиться|склад)(?=[\s:.]|$)/;
const STEPS_HEADING =
  /^(приготування|спосіб приготування|кроки|як готувати|інструкція|як приготувати)(?=[\s:.]|$)/;

/** Split a whole pasted recipe into title, description, ingredients and steps. */
export const parseRecipeText = (text: string): IParsedRecipe => {
  const out: IParsedRecipe = {
    title: "",
    description: "",
    servings: null,
    totalMin: null,
    category: null,
    tags: [],
    ingredients: [],
    steps: [],
  };
  const desc: string[] = [];
  const ingLines: string[] = [];
  const stepLines: string[] = [];
  let mode: "head" | "ing" | "steps" = "head";
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  // With headings (the ChatGPT format), sections follow them and nothing is
  // guessed; a long description then stays a description.
  const hasHeadings = lines.some((l) => ING_HEADING.test(normalize(l)));

  for (const l of lines) {
    if (!l) continue;
    const low = normalize(l);

    // Links are not stored: skip "https://..." and "Джерело: https://...".
    if (
      /https?:\/\/\S+/.test(l) &&
      (/^https?:\/\//.test(l) || /^(джерело|посилання)/.test(low))
    )
      continue;
    if (ING_HEADING.test(low)) {
      mode = "ing";
      continue;
    }
    if (STEPS_HEADING.test(low)) {
      mode = "steps";
      continue;
    }
    const servings =
      low.match(/(\d+)\s*порц/) ?? low.match(/порц\S*\s*:?\s*(\d+)/);
    if (servings && l.length < 40) {
      out.servings = Number(servings[1]);
      continue;
    }
    // "Розділ: Випічка"
    if (/^розділ\s*:/.test(low)) {
      out.category = categoryFromText(l.slice(l.indexOf(":") + 1));
      continue;
    }
    // "Теги: Сніданок, Українська кухня"
    if (/^(теги|тег|мітки)\s*:/.test(low)) {
      out.tags = l
        .slice(l.indexOf(":") + 1)
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean);
      continue;
    }
    const time = low.match(/^(час|час приготування|готується)\s*:?\s*(.+)$/);
    if (time) {
      out.totalMin = parseDuration(time[2]);
      continue;
    }
    if (!out.title) {
      out.title = l.replace(/^#+\s*/, "");
      continue;
    }

    if (hasHeadings) {
      // Sections change only at headings.
    } else if (mode === "head") {
      if (looksLikeStep(l)) mode = "steps";
      else if (looksLikeIngredient(l)) mode = "ing";
    } else if (mode === "ing" && looksLikeStep(l) && !looksLikeIngredient(l)) {
      mode = "steps";
    }

    if (mode === "head") desc.push(l);
    else if (mode === "ing") ingLines.push(l);
    else stepLines.push(l);
  }

  out.description = desc.join(" ");
  out.ingredients = parseIngredients(ingLines.join("\n"));
  out.steps = parseSteps(stepLines.join("\n"));
  if (!out.totalMin && out.steps.length) {
    const timed = out.steps.reduce((sum, s) => sum + (s.timerMin ?? 0), 0);
    out.totalMin = timed ? timed + 10 : null;
  }
  return out;
};
