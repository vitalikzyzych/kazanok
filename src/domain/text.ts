const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Random id for documents and for ingredients and steps inside a recipe. */
export const newId = (length = 12): string =>
  Array.from(
    crypto.getRandomValues(new Uint8Array(length)),
    (n) => ID_CHARS[n % ID_CHARS.length]
  ).join("");

/** Lower case, no apostrophes, single spaces: for search and matching. */
export const normalize = (s: string | null | undefined): string =>
  (s ?? "")
    .toLowerCase()
    .replace(/[’'ʼ`]/g, "")
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();

/** Stable 32-bit hash of a string (cover colours, flower shapes). */
export const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

/** First letter upper case, trailing punctuation removed. */
export const capitalize = (s: string): string => {
  const t = s.trim().replace(/[.,;:]+$/, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
};
