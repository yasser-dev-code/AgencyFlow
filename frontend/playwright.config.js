import { defineConfig } from '@playwright/test';

// End-to-end tests. Requires a running stack:
//   1. PostgreSQL reachable via DATABASE_URL
//   2. `npm run dev` (starts the API on :5000 and the web app on :5173)
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  }
});
