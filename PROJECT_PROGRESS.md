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
- **Phase 10 — Tests & docs:**
  - Backend unit: `tests/utils.test.js` (password + JWT round-trip), `tests/api.test.js` (health, 401 guard, 404).
  - Backend integration: `tests/integration/api.integration.test.js` (17 tests) run against an **isolated `agencyflow_test` database** provisioned by `backend/tests/globalSetup.js` + `backend/vitest.config.js` (derived from root `DATABASE_URL`; hard guard aborts unless the URL contains `agencyflow_test`). Covers auth, no-password-hash leakage, ADMIN vs EMPLOYEE authorization (employees blocked from `/api/employees` and client creation, task scoping + status-only updates), client CRUD + validation, and DB-backed stats.
  - Frontend: `src/__tests__/login.test.jsx` (render, submit, language switch), `src/__tests__/translations.test.js` (FR/EN key parity).
  - e2e: `frontend/e2e/login.spec.js` + `playwright.config.js` (Playwright browsers not installed — not executed).
  - Docs: `README.md` (English), `README.fr.md` (French), this file.
- **Phase 11 — Professional upgrade (design/UX, security, features):**
  - Backend: `statsController` adds `overdueTasks` total + `recentTasks`; `taskController` adds `overdue=true` filter and keeps employee status-only update + task scoping; `errorHandler` maps Prisma P2003→400 and normalizes generic statuses; `app.js` disables `x-powered-by`.
  - Frontend: new **toast notification system** (`context/ToastContext.jsx`) wired into `main.jsx` and all CRUD pages; enhanced UI primitives (`Skeleton`, icon `EmptyState`, accented `StatCard`); refined buttons/focus rings/toast animation in `index.css`; Dashboard gains an overdue stat card, a recent-tasks activity panel, and skeleton loading; Tasks page gains an "overdue only" filter + overdue badge; assignment selects are disabled for non-admins.
  - i18n: added FR/EN keys (`common.created/updated/deleted/statusUpdated/overdue`, `dashboard.recentTasks/overdueTasks/recentActivity`, `tasks.overdueOnly`) with strict key parity.

## Important files

- Backend entry: `backend/src/server.js`, app: `backend/src/app.js`, routes: `backend/src/routes/index.js`.
- Prisma schema: `backend/prisma/schema.prisma`; seed: `backend/prisma/seed.js`.
- Frontend entry: `frontend/src/main.jsx`, router: `frontend/src/App.jsx`.
- i18n: `frontend/src/i18n/translations.js`; contexts: `frontend/src/context/`.

## Commands used

```bash
npm install
npm run prisma:generate          # from repo root; loads root .env via --schema
npm run prisma:migrate           # creates the DB if missing + applies migrations
npm run prisma:seed              # creates/updates the admin account (upsert)
npm run dev            # backend :5000 + frontend :5173
npm test               # vitest across workspaces
npm run build          # frontend production build
```

> Prisma scripts run from the **repository root** and pass `--schema backend/prisma/schema.prisma`
> so Prisma loads the single root `.env`. (Running Prisma from `backend/` cannot see the root `.env`.)

## Verification status

Re-run on 2026-11-16 (Node 24, npm 11) after the professional upgrade:

- `npm run test --workspace=backend` — **22/22 passed** (`utils.test.js` 2, `api.test.js` 3, `integration/api.integration.test.js` 17). Integration tests provision and use the isolated `agencyflow_test` DB; the real `agencyflow` DB is never touched.
- `npm run test --workspace=frontend` — **5/5 passed** (`login.test.jsx`, `translations.test.js` incl. FR/EN key parity after the new keys).
- `npm run build` (frontend) — **succeeded**, 2258 modules transformed, `frontend/dist` produced (only the pre-existing >500 kB chunk-size advisory).
- Playwright e2e not executed (browsers not installed; requires `npx playwright install` + a running stack).

Note: a benign React `act()` warning appears from `AuthProvider`'s async session check in the login test; it does not affect results.

## Known problems / notes

- **Local database setup completed (2026-11-16, PostgreSQL 18):** the `agencyflow` database was created via `prisma migrate dev`; initial migration `20261116194258_init` applied (tables `users`, `clients`, `campaigns`, `tasks`, `_prisma_migrations`); admin `admin@agencyflow.local` (ADMIN) seeded with a bcrypt hash. Live API verified end-to-end: `/api/health` ok, admin login → 200 + HTTP-only cookie, `/api/stats` (authed) → 200 with real totals, `/api/stats` (no cookie) → 401, wrong-password login → 401.
- The earlier blocker (Prisma not finding the root `.env` when run from `backend/`) is **fixed**: the root `prisma:*` scripts now run from the repo root with `--schema backend/prisma/schema.prisma`.
- Backend API tests only need the generated Prisma client (no live DB) — run `prisma:generate` first.
- Playwright browsers must be downloaded (`npx playwright install`) before `npm run test:e2e`.

## Remaining work

- Add real screenshots to the READMEs once the app runs against a database.
- Optional: pagination on list endpoints, richer employee task filtering, historical analytics.

## Exact next steps

1. Run `npm run dev`, open http://localhost:5173, sign in with the seeded admin, and click through each page.
2. Capture screenshots and replace the README placeholders.
3. Commit the setup changes (migration files, `package.json`, docs) — **push only after approval**.
4. Optional: `npx playwright install` then `npm run test:e2e` for end-to-end coverage.
