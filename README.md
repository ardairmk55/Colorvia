# Colorvia

Colorvia is an offline-capable, local-first color palette studio built with React, TypeScript, Vite, Tailwind CSS 4, and IndexedDB. It has no backend, account, or sync service.

## Development

Requirements: Node.js 22.6 or newer and npm.

```sh
npm install
npm run dev
npm run lint
npm test
npm run typecheck
npm run build
```

`npm run dev` starts the local development server. Use `npm ci` for reproducible installs in clean environments and CI.

## Features

- Five-color harmony generation, editable HEX values, locking, and reorder controls
- HEX, RGB, HSL, and contrast information
- Local palette save/search/sort and per-palette JSON export
- Whole-library JSON backup with merge/update, skip-duplicates, or replace-all restore
- Dark/light theme, Turkish/English interface, keyboard shortcuts, and a first-use guide
- Installable PWA with offline app shell; an available update waits for the user to apply it

## Local data and backups

Palettes are stored in this browser profile's IndexedDB. Small preferences use localStorage. Browser quota reporting is origin-wide, not a measurement of Colorvia alone. Data can be cleared by browser settings or storage eviction. Export backups regularly; restoring on another browser is manual and does not synchronize devices. Individual palette imports and library backups are limited to 2 MB; a library backup must use the supported `colorvia-backup` format version 1 and contain no more than 500 palettes. Palette names (1–60 characters), color counts, and HEX values are validated before writing. The 500-item limit is enforced within the IndexedDB write transaction, including single-palette imports.

## Offline and installation

The first visit and service-worker install need a network connection. Once cached, the app shell and bundled color engine work offline. Browser storage and update timing vary. On iOS Safari, use Share → Add to Home Screen. PNG app icons and an Apple touch icon are included. Android browsers can offer PWA installation when served from HTTPS or localhost.

## GitHub repository

The repository ignores installed dependencies, build output, local environment files, editor state, and test artifacts. A GitHub Actions workflow runs install, lint, tests, and the production build on pushes and pull requests to `main`.

To publish this local repository to a new GitHub repository, create an empty repository on GitHub, then add its URL and push the `main` branch:

```sh
git remote add origin https://github.com/<username>/<repository>.git
git commit -m "Initial Colorvia release"
git push -u origin main
```

The workflow validates source changes; it does not deploy the site. For PWA installation on a phone, deploy the built site to an HTTPS host first. GitHub Pages project sites use a subpath, so their Vite base path and PWA asset paths need deployment-specific configuration before enabling Pages.

## Source layout

- `src/App.tsx` — app composition and current studio interactions
- `src/services/color-engine` — HEX normalization, harmony generation, and color metrics
- `src/services/storage` — IndexedDB, preferences, and backup validation
- `src/i18n/copy.ts` — Turkish and English interface strings
- `src/index.css` — active Tailwind theme tokens, base rules, and button utilities
- `src/App.css` and `src/styles.css` — retained legacy styles; not imported by the app
- `public` — icons and PWA assets

## Quality checks

`npm test` covers color normalization, harmony generation, contrast metrics, palette-file validation, backup size/version validation, and restore planning. IndexedDB integration, browser storage quota, PWA update flows, and visual device checks still require browser-level QA.
