# CLAUDE.md

Guidance for agents working in this repository.

## What this is

Рецепти: a small web app for saving recipes and cooking from them. About three people use it (one household), mostly on phones in the kitchen, sometimes on a laptop. The UI is in **Ukrainian**; code, comments and docs are in English.

It is a sibling of `../fc-tournament` (EA FC tournaments app) and reuses its stack and conventions, with its own Firebase project (see "Firebase" below). Copy what is needed from `../fc-tournament`, never import from it, and do not modify it.

## Status

- 2026-11-02: project created; design prototype in `design/Казанок.html` (no handoff notes).
- 2026-11-02: first build of every prototype screen.
- 2026-11-02: connected to its own Firebase project `kazanok-f7ab7` (decided with the user: separate from fc-tournament). Rules and emulator tests are written; **the rules are not deployed yet**, so the real database refuses everything until `firebase deploy --only firestore`.

## Current state

```bash
npm run dev            # http://localhost:3200 against the REAL database (.env.local)
npm run emulator       # Firestore emulator on 127.0.0.1:8180 (needs Java 21, see below)
npm run dev:emulator   # the app against the emulator; an empty emulator gets the 12 sample recipes
npm run build          # tsc -b + vite build
npm run lint           # ESLint + Prettier (fix: npx eslint --fix .)
npm test               # domain unit tests
npm run test:rules     # firestore.rules tests, emulator must be running
npm run deploy         # build + firebase deploy (hosting and firestore rules)
```

Emulator: `JAVA_HOME=/opt/homebrew/opt/openjdk@21 PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH" npm run emulator`. Browser tests against it: open a fresh tab after a few page loads. The emulator speaks HTTP/1.1, the tab ends up holding the browser's 6 connections to it with Listen channels, and new writes queue forever without an error (real Firestore uses HTTP/2, so the live app is not affected).

- Screens: recipe feed with search, time and tag filters, sort and "що приготуємо?" (`/`), favourites (`/favorites`), recipe page with servings scaling, steps marked done, step timers, "Приготовано", menu with copy as text and delete with undo (`/recipes/:id`), add with paste parsing and edit (`/add`, `/recipes/:id/edit`), shopping list (`/shopping`): one list, the same product from several recipes is one row with amounts summed per unit, tap to tick, "Прибрати куплене" clears ticked items (no per-recipe view, by the user's choice on 2026-11-02). "До покупок" sheet from the feed and the recipe page. Timer dock for timers of recipes not on screen. Theme: system, light, dark.
- Data: `src/source/RecipeSource.ts` is the only module that reads or writes Firestore: `recipes/{id}`, `recipePhotos/{id}` (`{ dataUrl }`), `shoppingItems/{id}`, each without its id field. `firestore.rules`, `RecipeSource.ts` and `domain/schema.ts` (LIMITS) describe the same shapes: change them together and run `npm run test:rules`. Firestore with a persistent local cache (`core/firebase.ts`, copied from fc-tournament), so the app opens instantly and works offline.
- Screens do not wait for writes: Firestore updates the local snapshot at once and the promise settles when the server answers (much later offline). Errors show a toast and the snapshot rolls back. A recipe and its photo change are one batch (`saveRecipe(recipe, { add, removeId })`).
- The real database started empty (2026-11-02). Sample data (`sampleRecipes.ts`, `samplePhotos.ts`) is used only by `seedEmulator.ts` and the rules tests. Recipes typed during the localStorage phase were not migrated.
- Recipe photos are separate documents (`photoId`), loaded by `usePhoto` only when shown; the editor shrinks photos to 1200 px WebP (`utils/image.ts`). Photos are stored in Firestore (user's choice by default, 2026-11-02), rules cap a photo at 900 000 characters.
- App Check is not set up yet (optional; steps in fc-tournament's README, section 6).
- Cooking state on this device (servings chosen, steps done, timers) lives in `CookingProvider`, in memory only.
- Styling: Lara light is loaded for component structure only; `styles/main.css` defines the prototype's colour tokens (light and dark) and recolours the PrimeReact components used. Buttons with custom looks (chips, timers, step numbers) are `Button unstyled`.
- Filters live in the URL (`?q=&tag=&time=&sort=`).
- **No source link** (user's decision, 2026-11-02): recipes have no `sourceUrl`; the editor, recipe page, data, rules and parser have none. Link lines in pasted text are skipped.
- **Adding from a photo** (2026-11-02): "Запит для ChatGPT" on the add screen copies `CHATGPT_PROMPT` (`domain/chatgptPrompt.ts`). The user sends it to ChatGPT with a photo of the recipe and pastes the answer. `RECIPE_FORMAT_EXAMPLE` in that file is the format (also "Вставити приклад" and the placeholder); a unit test parses it, so change the example, the request and `parseRecipeText` together. `docs/chatgpt-recipe-prompt.md` explains the workflow and repeats the request word for word (`chatgptPrompt.test.ts` fails when they differ). When the text has the "Інгредієнти:" heading, the parser follows headings and guesses nothing.
- Prototype features not carried over: the "Повернути приклади" reset (prototype only).

## Plan

1. Read the prototype in `design/`, and its handoff notes if they are there (screens, components, data shape, assumptions). List the screens and features you found, plus anything that is unclear, and confirm them with the user before writing code.
2. Scaffold the project with the same setup as `../fc-tournament`: Vite, React, TypeScript strict, ESLint and Prettier config, `@/` alias, folder layout (`domain/`, `source/`, `providers/`, `ui/`, `components/`, `screens/`, `routes/`, `styles/`). Copy the files that apply: `core/firebase.ts`, `constants/env.ts`, `ToastProvider`, `FluentIcon`, `EmptyState`, `SectionCard`, `CodeConfirmDialog`, the base of `styles/main.css`, the lint config. Drop everything tournament-specific.
3. Domain and data: recipe types, zod schema, pure functions (search, filters, servings scaling, shopping list, whatever the design has) with vitest tests.
4. Firestore: `source/RecipeSource.ts` for every read and write, one live subscription in a data provider (as `TournamentDataProvider` does), rules plus emulator tests.
5. Screens, in this order: recipe list and recipe page, add and edit, cooking mode, then the extras from the design.
6. Icons, manifest and link preview (same approach as `../fc-tournament/public` and its `index.html`), then deploy after the user confirms.

Build the screens step by step and show each one to the user. Check every screen in headless Chrome against the emulator at 390 px and 1440 px: no console errors, no sideways scroll on phones.

## Stack (same as fc-tournament)

React 19, TypeScript strict, Vite 7, PrimeReact 10 (Lara theme), PrimeFlex 3.3, React Router 7, Firebase JS SDK 13 (Firestore and App Check only), zod 4, Fluent UI icons (`@fluentui/react-icons`, named-import registry), vitest. No Redux, no axios, no backend. Take exact versions from `../fc-tournament/package.json`.

## Decisions already made

- **No sign-in**, like fc-tournament. Anyone with the link uses the app. Protection is the Firestore rules (exact shapes, size limits) plus optional App Check.
- **Mobile first**: works at 390 px with no sideways scroll, bottom navigation on phones, large tap targets, comfortable on desktop.
- **All recipes load at once** with one live subscription. Search and filters run in the browser. That is fine for a few hundred recipes.
- **Photos without paid Firebase Storage** (built this way on 2026-11-02; the user did not ask for Cloudinary):
  - The browser shrinks a photo to about 1200 px wide and encodes it as WebP (canvas), about 100 to 200 KB, then stores it as a data URL in its **own Firestore document** (for example `recipePhotos/{photoId}`), never inside the recipe document, so the list does not download every photo. A photo loads only when it is shown; the persistent cache keeps it afterwards.
  - Firestore's limit is 1 MB per document; the rules cap the photo field size. The free plan's 1 GB is enough for hundreds of photos.
  - Alternative if photos must be bigger or more numerous: Cloudinary free plan with an unsigned upload preset (direct upload from the browser, no server, only the URL goes to Firestore). Check the current free limits first.
  - Not suitable: Firebase Storage (needs the paid Blaze plan), Supabase Storage (free projects pause after a week of no use), Cloudflare R2 (card plus a signing server), Imgur, Google Drive.
- Conventions: copy them from `../fc-tournament/CLAUDE.md` (Conventions section): `I`-prefixed interfaces, PrimeReact components instead of bare elements, PrimeFlex classes, theme CSS variables instead of colour literals, dialogs with `showHeader={false}`, `confirmDialog` for confirmations, Prettier at 80 columns. Text written for other people follows the user's global rules.
- After making code changes, end with a suggested commit message. Do not commit unless the user asks.

## Firebase

- Own project `kazanok-f7ab7` (decided with the user on 2026-11-02, replacing the earlier plan to share fc-tournament's project): `(default)` Firestore database in Native mode, hosting site https://kazanok-f7ab7.web.app. `.firebaserc` points at it and this repo owns its `firestore.rules`; never touch fc-tournament's project or rules.
- Web app config is in `.env.local` (git-ignored; `.env.example` lists the keys). Without it the app shows `FirebaseSetupNotice`.
- The Firebase CLI on this machine is logged in with the account that owns both projects.
- **Testing in a browser:** `npm run dev` talks to the REAL database. Use the emulator (`npm run emulator` + `npm run dev:emulator`, or a test server on a free port with `--strictPort` and `VITE_USE_EMULATOR=true`). The emulator uses the `demo-kazanok` project id, which never reaches real Firebase.

## Design prompt (given to Claude chat)

Kept for reference. The answer to it is the prototype in `design/`.

```
I want to design a recipes web app and need a working prototype to react to. Design it on your own first; after that I will adjust it with you.

Who uses it: a household of about three people. Mostly on phones in the kitchen, sometimes on a laptop when planning what to cook. They save recipes they like, find one quickly, and cook from it with busy or dirty hands.

What I want from you: one interactive prototype as a React artifact, with realistic sample data (10 to 12 recipes, a mix of Ukrainian and international dishes, some with photos and some without). Navigation and the main actions must work on the sample data. No backend.

Make the product decisions yourself. Choose the screens and features that make the app easy and pleasant to use, and leave out anything that adds friction. Ideas to consider, not a checklist: browsing and search, filters by tag or cooking time, a recipe page with ingredients and steps, a cooking mode (large text, one step at a time, timers, ingredients checked off), changing the number of servings, adding a recipe fast (for example by pasting text or a link), favourites, a shopping list built from recipes, "what can I cook with what I have".

Constraints, so the design can be built in the real app:
- The real app uses React with PrimeReact 10 components (Button, InputText, Dialog, TabView, Chips, Dropdown, Checkbox, and so on) and PrimeFlex utility classes. In the prototype plain elements are fine, but keep to UI that PrimeReact can produce.
- Icons in the outline style of Fluent UI System Icons.
- Colours defined once as CSS variables, not written into each component. Propose the look: a dark theme, a light one, or both.
- Mobile first: it must work at 390 px wide with no sideways scroll, with bottom navigation on phones and a comfortable layout on a 1440 px desktop. Large tap targets.
- All UI text in Ukrainian.
- Data will be stored in Firestore: think in documents (one recipe holds its ingredients and steps). All recipes are loaded into the app at once, so search and filters run in the browser.
- No sign-in. Anyone with the link uses the app.
- A recipe without a photo must still look good.

Start with the prototype directly, without asking me questions first. After the prototype, write a short handoff:
1. The screens and what each one does.
2. The components used on each screen, with the PrimeReact name where one exists.
3. The data shape of a recipe (and of anything else stored) as TypeScript interfaces.
4. The assumptions you made and the open questions.
```

## Open questions for the user

- Deploying the rules and the site (`npm run deploy`): ask before the first deploy.
- Theme: the prototype's monochrome look, light and dark, kept so far.
