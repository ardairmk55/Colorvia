# Colorvia architecture

## Product boundary
Static client app only: no API, server, account, login, or remote database. The browser stores palette records in IndexedDB and preferences in localStorage.

## Runtime flow
`src/main.tsx` mounts React and registers the Vite PWA service worker. Updates are requested by the service worker but applied only after the user chooses Update. `src/App.tsx` composes the studio, library, guide, and dialogs. Turkish/English strings live in `src/i18n/copy.ts`. Color calculations live in `src/services/color-engine`; persistence, backup validation, restore planning, and palette limits live in `src/services/storage`.

## Backup behavior
Backup files use `{format: "colorvia-backup", version: 1, exportedAt, palettes}`. The parser checks the 2 MB byte limit, exact format/version, the 500-palette limit, palette names, color counts, and HEX values before writing. Single-palette imports share the same byte limit and field validation. Restore planning is a pure storage helper with merge/update, skip-duplicates, and replace-all strategies. Palette-count checks and writes run inside IndexedDB read/write transactions so concurrent imports cannot exceed the 500-item cap. Replace-all is confirmed in an accessible in-app dialog before the transaction begins. A backup is user-managed; there is no cloud copy or cross-device sync.

## Offline and PWA
Vite PWA precaches the static shell and bundled assets. Initial load requires connectivity. Applying an available service-worker update is user initiated so unsaved edits are not silently interrupted. Install icons are shipped as SVG and PNG, with an Apple touch icon.

## Styling
Tailwind CSS 4 is loaded from `src/index.css`. The old `src/App.css` and `src/styles.css` files remain in the repository but are not imported; they are legacy cleanup candidates. The app is still composed in one main component, so extracting page sections into feature components is a future maintainability task.

## Validation
`npm run lint`, `npm test`, `npm run typecheck`, and `npm run build` are local quality checks. Tests cover pure color functions, contrast calculations, palette validation, palette-capacity rules, backup constraints, and restore planning. Browser-level IndexedDB transactions, PWA lifecycle, accessibility, and responsive visual checks remain separate QA work. The main React composition is still in `src/App.tsx`; splitting the studio and library presentation into feature components remains a maintainability follow-up.
