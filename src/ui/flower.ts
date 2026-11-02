import { hashString, normalize } from "@/domain";

/**
 * Six flower palettes (f0 to f5 in main.css) give recipes without a photo,
 * tags and avatars a stable colour picked from their text.
 */
export const flowerClass = (seed: string): string =>
  `f${hashString(normalize(seed)) % 6}`;
