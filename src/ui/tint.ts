import { hashString, normalize } from "@/domain";

/**
 * Six soft tints (t0 to t5 in main.css) give tags and covers without a photo
 * a stable colour picked from their text.
 */
export const tintClass = (seed: string): string =>
  `t${hashString(normalize(seed)) % 6}`;
