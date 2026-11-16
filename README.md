**Language:** [English](README.md) | [Français](README.fr.md)

# AgencyFlow

AgencyFlow is a bilingual (French / English) web application that helps a digital marketing agency manage its **clients**, **campaigns**, **employees**, and **tasks** from a single modern dashboard.

It is built as a practical full-stack portfolio project: a React + Vite frontend, an Express REST API, and a PostgreSQL database accessed through Prisma.

---

## Features

- **Authentication** — login/logout with JWT stored in an HTTP-only cookie, bcryptjs password hashing, protected frontend routes, and backend auth middleware.
- **Roles** — `ADMIN` (full management) and `EMPLOYEE` (view data, manage assigned task status). Permissions are enforced on the backend, not only in the UI.
- **Dashboard** — real statistics from PostgreSQL (clients, active campaigns, completed/pending tasks, employees) with Recharts bar and pie charts. No hardcoded numbers.
- **Clients** — full CRUD with search and status filtering.
- **Campaigns** — full CRUD, linked to clients, with budget, dates, and status.
- **Tasks** — full CRUD, assignment to employees, optional campaign link, priority, due dates, and inline status updates.
- **Employees** — admin-managed team members with roles. Password hashes are never exposed.
- **Settings** — profile update, password change, and language selection.
- **Privacy policy** page.
- **Bilingual UI** — French (default) and English, with a persistent language switcher.
- **Responsive design** — desktop, tablet, and mobile layouts.

## Screenshots

> Placeholders — replace with real screenshots once the app is running.

| Dashboard | Clients | Tasks |
| --- | --- | --- |
| _coming soon_ | _coming soon_ | _coming soon_ |

## Technology stack

**Frontend:** React 18, JavaScript, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React.

**Backend:** Node.js, Express, PostgreSQL, Prisma ORM (5.22.0), JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, Zod validation.

**Testing:** Vitest, Supertest (API), React Testing Library (UI), Playwright (e2e).

## Project structure

```
AgencyFlow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Data models
│   │   └── seed.js             # Admin seeding (reads env vars)
│   ├── src/
│   │   ├── config/             # env, prisma client
│   │   ├── controllers/        # auth, clients, campaigns, tasks, employees, stats
│   │   ├── middleware/         # authenticate, authorize, validate, errors, rate limit
│   │   ├── routes/             # REST route definitions
│   │   ├── utils/              # jwt, password, http helpers
│   │   ├── validators/         # Zod schemas
│   │   ├── app.js              # Express app
│   │   └── server.js           # HTTP server bootstrap
│   └── tests/                  # Vitest + Supertest
├── frontend/
│   ├── e2e/                    # Playwright specs
│   ├── public/                 # favicon + logo (SVG)
│   └── src/
│       ├── api/                # axios client + endpoint wrappers
│       ├── components/         # layout + reusable UI
│       ├── context/            # Auth + Language providers
│       ├── i18n/               # FR/EN translations
│       ├── pages/              # Login, Dashboard, Clients, Campaigns, Tasks, Employees, Settings, Privacy
│       ├── App.jsx             # Router
│       └── main.jsx            # Entry point
├── .env.example
├── .gitignore
├── README.md                   # (this file)
├── README.fr.md
└── PROJECT_PROGRESS.md
```

## Prerequisites

- **Node.js** 18+ (developed with Node 20/24)
- **npm** 9+
- **PostgreSQL** 13+ running locally or reachable over the network

## Installation

From the repository root:

```bash
# 1. Install all workspace dependencies (backend + frontend)
npm install

# 2. Create your environment file
cp .env.example .env
#    Then edit .env and set DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD.

# 3. Generate the Prisma client
npm run prisma:generate --workspace=backend

# 4. Create the database schema
npm run prisma:migrate --workspace=backend

# 5. Seed the administrator account
npm run prisma:seed --workspace=backend
```

### PostgreSQL setup

```bash
# Example using psql
psql -U postgres
CREATE USER agencyflow_user WITH PASSWORD 'change_me';
CREATE DATABASE agencyflow OWNER agencyflow_user;
\q
```

Set the matching connection string in `.env`:

```
DATABASE_URL="postgresql://agencyflow_user:change_me@localhost:5432/agencyflow?schema=public"
```

## Environment variables

All variables live in a single root `.env` file (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `PORT` | Backend port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin for CORS (default `http://localhost:5173`) |
| `JWT_SECRET` | Secret used to sign session tokens — use a long random value |
| `JWT_EXPIRES_IN` | Token lifetime (default `8h`) |
| `COOKIE_NAME` | Name of the HTTP-only session cookie |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Values for the seeded administrator |

Never commit real secrets. `.env` is ignored by Git.

## Running the app

```bash
# Start backend (:5000) and frontend (:5173) together
npm run dev

# Or separately
npm run dev:backend
npm run dev:frontend
```

Open http://localhost:5173 and sign in with the seeded administrator credentials.

## Testing

```bash
# All workspace unit/integration tests (Vitest + Supertest + RTL)
npm test

# Backend only
npm run test --workspace=backend

# Frontend only
npm run test --workspace=frontend

# End-to-end (requires a running stack and Playwright browsers)
npx playwright install        # one-time browser download
npm run test:e2e
```

> Backend tests require the Prisma client to be generated (`npm run prisma:generate --workspace=backend`). The included API tests do not need a live database connection.

## Production build

```bash
npm run build          # builds the frontend into frontend/dist
npm run start --workspace=backend   # runs the API with Node
```

## Basic deployment guidance

- **Backend:** deploy the Express API to a Node host (Render, Railway, Fly.io, a VPS). Set all environment variables, then run `prisma migrate deploy` on release.
- **Frontend:** build with Vite and host the static `dist/` output (Netlify, Vercel, Cloudflare Pages). Configure the frontend to call the API origin, and set `CLIENT_URL` on the backend to the deployed frontend URL so CORS and cookies work.
- **Database:** use a managed PostgreSQL provider. Keep `DATABASE_URL` secret.
- In production the session cookie is `Secure` and `SameSite=None`; serve both apps over HTTPS.

## Security considerations

- Passwords hashed with bcryptjs; hashes are never returned by the API.
- JWT stored in an HTTP-only cookie (not accessible to JavaScript) to reduce XSS token theft.
- `helmet` sets security headers; `cors` is restricted to the frontend origin.
- Rate limiting on authentication routes.
- Zod validation on all write endpoints.
- Role-based authorization enforced server-side.

## Current limitations

- Single administrator role granularity (no custom permissions).
- No password-reset or email verification flow.
- Task assignment does not send notifications.
- Charts reflect current totals; there is no historical time-series analytics.
- End-to-end tests require a seeded database and a running stack to fully pass.

## License

MIT — free to use for learning and portfolio purposes.
