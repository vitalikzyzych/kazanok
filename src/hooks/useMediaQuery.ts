import { useSyncExternalStore } from "react";

export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches
  );

/** The rail and the centred dialogs start here (design breakpoints). */
export const DESKTOP_QUERY = "(min-width: 900px)";
export const WIDE_DIALOG_QUERY = "(min-width: 720px)";
