import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(here, '../.env') });

// Integration tests run against a dedicated `agencyflow_test` database so the
// real `agencyflow` data is never touched. The URL is derived at runtime from
// the root `.env` (no secrets are hardcoded in source).
function testDatabaseUrl() {
  const base = process.env.DATABASE_URL;
  if (!base) return '';
  try {
    const url = new URL(base);
    url.pathname = '/agencyflow_test';
    return url.toString();
  } catch {
    return '';
  }
}

const derived = testDatabaseUrl();

// Expose the derived test URL to the main process too (globalSetup runs there
// and does not receive `test.env`).
if (derived) {
  process.env.DATABASE_URL = derived;
}
process.env.JWT_SECRET = 'integration-test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.COOKIE_NAME = 'agencyflow_session';
process.env.NODE_ENV = 'test';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    globalSetup: ['tests/globalSetup.js'],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 120000,
    env: {
      ...(derived ? { DATABASE_URL: derived } : {}),
      JWT_SECRET: 'integration-test-secret',
      JWT_EXPIRES_IN: '1h',
      COOKIE_NAME: 'agencyflow_session',
      NODE_ENV: 'test'
    }
  }
});
