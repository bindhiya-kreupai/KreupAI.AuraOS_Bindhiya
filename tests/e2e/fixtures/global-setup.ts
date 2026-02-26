/**
 * @file global-setup.ts
 * @description Playwright global setup: creates authentication state files
 *              for admin, HR manager, and employee roles before all tests run.
 */

import { chromium, request } from '@playwright/test';
import path from 'path';
import fs   from 'fs';

const AUTH_DIR    = path.join(__dirname, '..', '.auth');
const BASE_URL    = process.env.BASE_URL    ?? 'http://localhost:3000';
const API_URL     = process.env.API_URL     ?? 'http://localhost:4000';

async function globalSetup() {
  // Ensure .auth directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const browser = await chromium.launch();

  const credentials = [
    {
      email:    process.env.ADMIN_EMAIL    ?? 'admin@auraos.test',
      password: process.env.ADMIN_PASSWORD ?? 'Admin@123456',
      file:     path.join(AUTH_DIR, 'admin.json'),
    },
    {
      email:    process.env.HR_EMAIL    ?? 'hr-manager@auraos.test',
      password: process.env.HR_PASSWORD ?? 'HrManager@123456',
      file:     path.join(AUTH_DIR, 'hr-manager.json'),
    },
    {
      email:    process.env.EMP_EMAIL    ?? 'employee@auraos.test',
      password: process.env.EMP_PASSWORD ?? 'Employee@123456',
      file:     path.join(AUTH_DIR, 'employee.json'),
    },
  ];

  for (const cred of credentials) {
    const context = await browser.newContext();
    const page    = await context.newPage();

    try {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      // Fill login form
      await page.fill(
        '[data-testid="email-input"], input[type="email"], input[name="email"]',
        cred.email,
      );
      await page.fill(
        '[data-testid="password-input"], input[type="password"], input[name="password"]',
        cred.password,
      );
      await page.click('[data-testid="login-button"], button[type="submit"]');

      // Wait for successful login redirect
      await page.waitForURL(/\/(dashboard|home|app)/, { timeout: 15_000 });

      // Save storage state (cookies + localStorage)
      await context.storageState({ path: cred.file });
      console.log(`[global-setup] Saved auth state for ${cred.email} → ${cred.file}`);
    } catch (err) {
      console.warn(`[global-setup] Could not login as ${cred.email}: ${err}. Using empty state.`);
      // Write empty state so tests can still run without a live server
      fs.writeFileSync(cred.file, JSON.stringify({ cookies: [], origins: [] }));
    } finally {
      await context.close();
    }
  }

  await browser.close();
}

export default globalSetup;
