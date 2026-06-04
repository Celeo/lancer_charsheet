# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # dev server at http://localhost:5173/lancer-charsheet/
pnpm build        # tsc type-check + Vite production build → dist/
pnpm preview      # serve the production build locally
```

There is no test suite or linter config — TypeScript's strict compiler flags (`noUnusedLocals`, `noUnusedParameters`) serve as the primary code quality gate. `pnpm build` runs `tsc -b` first and will fail on type errors.

## Architecture

Single-file-per-concern SPA. No routing library — hash changes drive view switching in `app.tsx`.

```
src/
  types.ts          # All TypeScript interfaces (Character, PilotStats, MechConfig, CombatState, DerivedStats)
  game-data.ts      # Typed wrappers over lancer-data, derived stat formulas, mount/slot helpers, constants
  store.tsx         # CharacterProvider (Preact context) + useCharacter hook; persists to localStorage key "lancer-charsheet-v1"
  app.tsx           # Hash router: #combat → CombatTracker, #pilot → PilotSheet, #mech → MechSheet
  components/       # Shared UI: Nav (bottom tabs), Counter (HP/heat bar+buttons), BoxTracker (structure/stress boxes), StatRow/HASEStat
  views/            # CombatTracker, PilotSheet, MechSheet — each consumes useCharacter()
```

**Data flow:** `useCharacter()` returns `{ character, derived, updateMeta, updatePilot, updateMech, updateCombat, resetCombat }`. `derived` is re-computed from `character` on every render via `calcDerived()` in `game-data.ts` — there is no separate derived-state cache.

**Game data:** `lancer-data` (npm, deprecated but valid for core book content) is imported in `game-data.ts` with a `// @ts-ignore` because it ships no types. All consumers import from `game-data.ts`, never directly from `lancer-data`.

**Lancer rules math** lives entirely in `game-data.ts → calcDerived()`. Key formulas: GRIT = floor(LL/2); mech HP = frame HP + GRIT×2; heat cap = frame heatcap + Engineering; repair cap = frame repcap + GRIT; evasion = frame evasion + Agility; E-def = frame edef + Systems; save target = 10 + GRIT.

**Styling:** Tailwind v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`). daisyUI v5 loaded via `@plugin "daisyui"` in `index.css` with the `night` theme as the base. Lancer-specific color overrides sit in `:root` in `index.css` (higher specificity than daisyUI's `:where(:root)`). The custom `.section-label` utility class is defined in `index.css`.

**JSX:** Files containing JSX must use the `.tsx` extension. `jsxImportSource` is `preact` (set in `tsconfig.app.json`), so no explicit `import { h }` needed.

**PWA:** `vite-plugin-pwa` generates a service worker (`dist/sw.js`) and `manifest.webmanifest`. Service worker is registered via `registerSW.js` injected by the plugin.

**Deploy:** `base: '/lancer-charsheet/'` in `vite.config.ts` targets GitHub Pages at that subpath. All asset paths and the PWA `start_url` reflect this.

## Key constraints

- `lancer-data` description fields contain raw HTML (`<br>`, `<ul>`, etc.) — `dangerouslySetInnerHTML` is intentional in the mech sheet view.
- Mount slot logic (`mountSlots()`, `weaponsForMount()`) in `game-data.ts` handles the Lancer mount-type → accepted weapon sizes mapping. Flex mounts are currently treated as a single Main slot.
- State shape is versioned by the localStorage key. Changing `Character` in ways that break deserialization requires bumping `STORAGE_KEY` in `store.tsx` and providing migration or a new default.
