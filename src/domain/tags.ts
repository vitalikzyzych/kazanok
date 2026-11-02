import { LIMITS } from "./schema";
import { capitalize, normalize } from "./text";

/**
 * Tags as stored: first letter capital, trimmed to the length limit, no
 * duplicates (ignoring case), at most LIMITS.tags. A tag that matches a known
 * one takes the known spelling, so "сніданок" becomes "Сніданок" when another
 * recipe already uses it.
 */
export const cleanTags = (raw: string[], known: string[] = []): string[] => {
  const byKey = new Map(known.map((t) => [normalize(t), t]));
  const out: string[] = [];
  const seen = new Set<string>();
  for (const r of raw) {
    const t = capitalize(r).slice(0, LIMITS.tag).trim();
    const key = normalize(t);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(byKey.get(key) ?? t);
  }
  return out.slice(0, LIMITS.tags);
};

/** Tags no saved recipe uses yet: marked "нова" in the editor. */
export const isNewTag = (tag: string, known: string[]): boolean =>
  !known.some((k) => normalize(k) === normalize(tag));
