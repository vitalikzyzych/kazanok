import { useSyncExternalStore } from "react";

export type ThemeMode = "system" | "light" | "dark";

const KEY = "kazanok:theme";
const NEXT: Record<ThemeMode, ThemeMode> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const readMode = (): ThemeMode => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
};

let mode = readMode();
const listeners = new Set<() => void>();

/** "system" follows the phone; light and dark are set on <html data-theme>. */
export const applyTheme = () => {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
};

const cycle = () => {
  mode = NEXT[mode];
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // Private mode: the choice lasts until the tab closes.
  }
  applyTheme();
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const THEME_LABELS: Record<ThemeMode, string> = {
  system: "Тема: як у системі",
  light: "Тема: світла",
  dark: "Тема: темна",
};

export const useTheme = (): [ThemeMode, () => void] => [
  useSyncExternalStore(subscribe, () => mode),
  cycle,
];
