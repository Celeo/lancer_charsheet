# LANCER // CHARSHEET

> A lightweight mobile-first PWA for tracking your pilot and mech during a session of the [Lancer TTRPG](https://massif-press.itch.io/lancer-core-book).

[![Built with Preact](https://img.shields.io/badge/Preact-10-673ab8?logo=preact&logoColor=white)](https://preactjs.com)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![daisyUI](https://img.shields.io/badge/daisyUI-5-1ad1a5?logo=daisyui&logoColor=white)](https://daisyui.com)
[![PWA](https://img.shields.io/badge/PWA-enabled-5a0fc8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

---

## Features

- **Combat tracker** — mech HP, heat, structure, reactor stress, repair charges, burn, core system toggle, pilot HP, and status conditions, all on one screen
- **Pilot sheet** — License Level / GRIT, H.A.S.E. stats with live derived-stat recalculation, searchable skill triggers and talents
- **Mech sheet** — frame picker with full stat block, frame traits and core system description, weapon mount loadout, and installed systems with SP tracking
- **Offline-first PWA** — installable to your home screen; works without a network connection after the first load
- **Persistent state** — everything is saved automatically to `localStorage`; no account or server required

## Getting Started

```bash
pnpm install
pnpm dev        # http://localhost:5173/lancer-charsheet/
```

### Production build

```bash
pnpm build      # output → dist/
pnpm preview    # serve dist/ locally to verify before deploy
```

### Deploy to GitHub Pages

The `base` in `vite.config.ts` is set to `/lancer-charsheet/`. If your repository is named differently, update that value before building. Push the contents of `dist/` to your `gh-pages` branch (or configure GitHub Pages to deploy from `dist/` on `main`).

## Data Attribution

All Lancer game content — including frame statistics, weapon profiles, system descriptions, talent text, and skill triggers — is the intellectual property of **Massif Press** and the creators of the Lancer TTRPG, Tom Parkinson-Morgan and Miguel Lopez.

This project uses the [`lancer-data`](https://github.com/massif-press/lancer-data) package, which is published by Massif Press under the **GNU General Public License v3.0 or later**. No game content has been modified; it is used here strictly for personal, non-commercial reference.

If you enjoy Lancer, please support the creators:

- [Lancer Core Book (itch.io)](https://massif-press.itch.io/lancer-core-book)
- [Massif Press](https://massif-press.itch.io)

## License

The source code of this project is released under the [MIT License](LICENSE.md).

Lancer game content and data are © Massif Press, licensed separately under GPL-3.0-or-later. See [lancer-data](https://github.com/massif-press/lancer-data) for details.
