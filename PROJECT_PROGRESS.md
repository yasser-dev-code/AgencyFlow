# AgencyFlow — Project Progress

This file tracks what has been built so future sessions can continue without repeating work.

**Repository:** https://github.com/yasser-dev-code/AgencyFlow
**Branch:** `main`
**Stack:** React + Vite + Tailwind (frontend), Express + Prisma 5.22.0 + PostgreSQL (backend), JavaScript only.

---

## Completed phases

- **Phase 1 — Structure & config:** Monorepo with npm workspaces (`backend/`, `frontend/`). Root `.gitignore`, `.env.example`, `package.json` with dev/build/test/prisma scripts.
- **Phase 2 — Database & seed:** `backend/prisma/schema.prisma` with `User`, `Client`, `Campaign`, `Task` models, enums (`Role`, `ClientStatus`, `CampaignStatus`, `TaskStatus`, `TaskPriority`) and relations. Env-based admin seed (`backend/prisma/seed.js`).
- **Phase 3 — Auth & roles:** JWT in HTTP-only cookie, bcryptjs hashing, `authenticate` + `authorize` middleware, login/logout/me/profile/change-password endpoints, protected frontend routes (`ProtectedRoute`).
- **Backend API — CRUD + stats:** Controllers, routes, and Zod validators for `/api/auth`, `/api/clients`, `/api/campaigns`, `/api/tasks`, `/api/employees`, `/api/stats`. Centralized error handler, 404 handler, helmet, CORS, rate limiting. Stats are computed with real Prisma queries (counts + groupBy).
- **Phases 4–9 — Frontend app:** Vite + React + Tailwind. Responsive sidebar layout, topbar with language switcher and logout. Bilingual FR (default) / EN via `LanguageContext` + `i18n/translations.js` (persisted in localStorage). Pages: Login, Dashboard (Recharts), Clients, Campaigns, Tasks (inline status update), Employees, Settings, Privacy. Reusable UI primitives, modal forms, confirm dialogs, loading/empty/error states. AgencyFlow SVG logo + favicon.
- **Phase 10 — Tests & docs (in progress):**
  - Backend: `tests/utils.test.js` (password + JWT round-trip), `tests/api.test.js` (health, 401 guard, 404).
  - Frontend: `src/__tests__/login.test.jsx` (render, submit, language switch), `src/__tests__/translations.test.js` (FR/EN key parity).
  - e2e: `frontend/e2e/login.spec.js` + `playwright.config.js`.
  - Docs: `README.md` (English), `README.fr.md` (French), this file.

## Important files

- Backend entry: `backend/src/server.js`, app: `backend/src/app.js`, routes: `backend/src/routes/index.js`.
- Prisma schema: `backend/prisma/schema.prisma`; seed: `backend/prisma/seed.js`.
- Frontend entry: `frontend/src/main.jsx`, router: `frontend/src/App.jsx`.
- i18n: `frontend/src/i18n/translations.js`; contexts: `frontend/src/context/`.

## Commands used

```bash
npm install
npm run prisma:generate --workspace=backend
npm run prisma:migrate --workspace=backend
npm run prisma:seed --workspace=backend
npm run dev            # backend :5000 + frontend :5173
npm test               # vitest across workspaces
npm run build          # frontend production build
```

## Verification status

Run on 2026-11-16 (Node 24, npm 11):

- `npm install` — succeeded (409 packages).
- `npm run prisma:generate --workspace=backend` — succeeded (Prisma Client 5.22.0).
- `npm run build` (frontend) — succeeded, 2257 modules, `frontend/dist` produced (only a chunk-size advisory).
- `npm run test --workspace=backend` — 5/5 passed (`utils.test.js`, `api.test.js`).
- `npm run test --workspace=frontend` — 5/5 passed (`login.test.jsx`, `translations.test.js`).
- Playwright e2e not executed (requires browsers + a running stack with database).

Note: a benign React `act()` warning appears from `AuthProvider`'s async session check in the login test; it does not affect results.

## Known problems / notes

- PostgreSQL is **not installed** in the authoring environment, so live database migrations, seeding, and full e2e runs were not executed here. The Prisma schema, seed, and API are written to work against a real PostgreSQL instance; run the migrate + seed commands after installing PostgreSQL.
- Backend API tests only need the generated Prisma client (no live DB) — run `prisma:generate` first.
- Playwright browsers must be downloaded (`npx playwright install`) before `npm run test:e2e`.

## Remaining work

- Add real screenshots to the READMEs once the app runs against a database.
- Optional: pagination on list endpoints, richer employee task filtering, historical analytics.

## Exact next steps

1. Install PostgreSQL and set `DATABASE_URL` in `.env`.
2. Run `npm run prisma:generate`, `prisma:migrate`, then `prisma:seed`.
3. `npm run dev`, sign in with the seeded admin, and manually verify each page.
4. Capture screenshots and replace the README placeholders.
5. Commit and push each verified phase.
