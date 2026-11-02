import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { addLocale, locale, PrimeReactProvider } from "primereact/api";

import { USE_EMULATOR } from "./constants/env";
import { applyTheme } from "./hooks/useTheme";
import App from "./App";

// Lara gives the components their structure; styles/main.css recolours them
// with the design's tokens, so the light and dark themes both work.
import "primereact/resources/themes/lara-light-teal/theme.css";
import "primereact/resources/primereact.min.css";
import "primeflex/primeflex.css";
import "./styles/main.css";

addLocale("uk", {
  accept: "Так",
  reject: "Ні",
  choose: "Обрати",
  upload: "Завантажити",
  cancel: "Скасувати",
  clear: "Очистити",
  emptyMessage: "Немає варіантів",
  emptyFilterMessage: "Нічого не знайдено",
});
locale("uk");

applyTheme();

if (USE_EMULATOR)
  void import("./source/seedEmulator").then(({ seedEmulator }) =>
    seedEmulator().catch((e: unknown) => console.error("Seeding failed", e))
  );

// A tab opened before a deploy still references the old hashed chunks, which
// the deploy removed, so opening a lazy screen fails. Reload once to pick up
// the new index.html; the timestamp guard stops a reload loop.
const CHUNK_RELOAD_KEY = "chunk_reload_at";
window.addEventListener("vite:preloadError", (event) => {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <PrimeReactProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PrimeReactProvider>
  </StrictMode>
);
