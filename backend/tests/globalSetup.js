import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const backendDir = resolve(here, '..');

// Runs once in the main Vitest process (not inside a worker) to provision the
// isolated `agencyflow_test` database before any integration test connects.
export default function globalSetup() {
  const testUrl = process.env.DATABASE_URL;

  // Hard guard: never touch anything but the dedicated test database.
  if (!testUrl || !testUrl.includes('agencyflow_test')) {
    throw new Error(
      'Integration tests require DATABASE_URL to point at "agencyflow_test". Aborting to protect data.'
    );
  }

  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    cwd: backendDir,
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: 'pipe'
  });
}
