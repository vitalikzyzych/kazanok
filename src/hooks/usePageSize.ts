import { useState } from "react";

import { PAGE_SIZES } from "@/domain";

const KEY = "kazanok:pageSize";
const DEFAULT = 20;

const read = (): number => {
  try {
    const n = Number(localStorage.getItem(KEY));
    return (PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT;
  } catch {
    return DEFAULT;
  }
};

/** Recipes per page, remembered on this device (10, 20 or 50). */
export const usePageSize = (): [number, (size: number) => void] => {
  const [size, setSize] = useState(read);
  const set = (n: number) => {
    setSize(n);
    try {
      localStorage.setItem(KEY, String(n));
    } catch {
      // Private mode: the choice lasts until the tab closes.
    }
  };
  return [size, set];
};
