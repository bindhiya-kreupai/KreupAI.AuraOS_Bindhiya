/**
 * @file auth.fixture.ts
 * @description Playwright fixture for authenticated pages.
 *              Extends base test with `authedPage` — a Page that is already
 *              logged in (via saved storage state from global-setup).
 *              Also provides `adminPage` and `hrManagerPage`.
 */

import {
  test as base,
  type Page,
  type BrowserContext,
} from '@playwright/test';
import path from 'path';

// ── Auth storage state paths ─────────────────────────────────────────────────

export const AUTH_DIR       = path.join(__dirname, '..', '.auth');
export const ADMIN_STATE    = path.join(AUTH_DIR, 'admin.json');
export const HR_STATE       = path.join(AUTH_DIR, 'hr-manager.json');
export const EMPLOYEE_STATE = path.join(AUTH_DIR, 'employee.json');

// ── Fixture types ─────────────────────────────────────────────────────────────

export interface AuthFixtures {
  /** Page authenticated as system administrator */
  adminPage: Page;
  /** Page authenticated as HR manager */
  hrManagerPage: Page;
  /** Page authenticated as a regular employee */
  employeePage: Page;
  /** The default authenticated page (admin) */
  authedPage: Page;
}

// ── Extended test ─────────────────────────────────────────────────────────────

export const test = base.extend<AuthFixtures>({
  /**
   * Admin-authenticated page. Uses saved storage state from global-setup.
   */
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE });
    const page    = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * HR Manager authenticated page.
   */
  hrManagerPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: HR_STATE });
    const page    = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Regular employee authenticated page.
   */
  employeePage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: EMPLOYEE_STATE });
    const page    = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Default authedPage fixture (admin role).
   * Alias for adminPage for convenience.
   */
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: ADMIN_STATE });
    const page    = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';

// ── Helper: programmatic login ────────────────────────────────────────────────

/**
 * Perform a UI login and return the resulting context.
 * Used in global-setup to create auth state files.
 */
export async function performLogin(
  context: BrowserContext,
  credentials: { email: string; password: string },
  baseURL: string,
): Promise<void> {
  const page = await context.newPage();

  await page.goto(`${baseURL}/login`);
  await page.waitForLoadState('networkidle');

  await page.fill('[data-testid="email-input"], input[type="email"], input[name="email"]', credentials.email);
  await page.fill('[data-testid="password-input"], input[type="password"], input[name="password"]', credentials.password);
  await page.click('[data-testid="login-button"], button[type="submit"]');

  // Wait for redirect to dashboard (successful login)
  await page.waitForURL(/\/(dashboard|home|app)/, { timeout: 10_000 });

  await page.close();
}
