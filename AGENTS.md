# AGENTS.md

## Cursor Cloud specific instructions

RIG — Kitchen Audit Systems is a single, frontend-only React 19 + TypeScript SPA built with Vite 8. There is no backend, database, or external service; all app data persists in the browser (`localStorage`) and the auth session in `sessionStorage`.

Standard commands live in `package.json` (`dev`, `build`, `lint`, `preview`) and README.md — use those; they are not duplicated here.

Non-obvious notes:
- The Vite dev server sets `base: '/3d-Checklist/'` (see `vite.config.ts`), so the app is served at `http://localhost:5173/3d-Checklist/`, NOT at `http://localhost:5173/`. Navigating to the root path will 404.
- Demo login is hardcoded client-side: user `admin`, passcode `1234` (`src/hooks/useAuth.ts`). There is no real auth service.
- `npm run lint` uses oxlint (config in `.oxlintrc.json`); `npm run build` runs `tsc -b` then `vite build`.
