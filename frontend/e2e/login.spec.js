import { test, expect } from '@playwright/test';

// Smoke test: the login page renders and rejects bad credentials.
// A full login test requires the seeded admin account and a running database.
test('shows the login form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByPlaceholder('admin@agencyflow.local')).toBeVisible();
  await expect(page.getByRole('button', { name: /se connecter|sign in/i })).toBeVisible();
});

test('rejects invalid credentials with an error', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('admin@agencyflow.local').fill('nobody@example.com');
  await page.getByPlaceholder('••••••••').fill('wrongpassword');
  await page.getByRole('button', { name: /se connecter|sign in/i }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});
