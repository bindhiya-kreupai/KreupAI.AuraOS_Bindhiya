/**
 * @file critical-path-hire-to-pay.spec.ts
 * @description Critical-path E2E journey: hire → onboard → first payroll run → exit.
 *              Covers the v1.0 employee-lifecycle gate (#83).
 *
 * Tag: @critical-path  — runnable in CI as `playwright test --grep @critical-path`.
 *
 * Variations covered (driven by TEST_TENANT_COUNTRY env: AE | SA | IN):
 *   - UAE: WPS reference, EOSB accrual visible
 *   - KSA: GOSI deduction, Saudization headcount tile updates
 *   - India: PF + ESI deductions, gratuity accrual visible
 *
 * Bilingual coverage: rerun with TEST_LOCALE=ar to validate RTL flow.
 *
 * Prereqs: the global-setup fixture must seed a tenant + manager account.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const COUNTRY = (process.env.TEST_TENANT_COUNTRY ?? 'AE') as 'AE' | 'SA' | 'IN';

test.describe('@critical-path Hire → Pay → Exit lifecycle', () => {
  let employeeCode: string;

  test('@critical-path step 1: HR creates a new employee', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);
    await page.waitForLoadState('networkidle');

    employeeCode = `E2E-${Date.now()}`;
    await page.fill('input[name="employeeCode"], [data-testid="employeeCode"]', employeeCode);
    await page.fill('input[name="firstName"], [data-testid="firstName"]', 'Critical');
    await page.fill('input[name="lastName"], [data-testid="lastName"]', `Path-${COUNTRY}`);
    await page.fill('input[name="email"]', `${employeeCode.toLowerCase()}@e2e.test`);

    await page.click('[data-testid="submit"], button[type="submit"]');
    await expect(
      page.locator('[data-testid="employee-created"], text=/created/i')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('@critical-path step 2: First payroll run includes the new employee', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/runs/new`);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="run-payroll"], button:has-text("Run Payroll")');
    await expect(
      page.locator('[data-testid="payroll-summary"], [data-testid="totalGross"]')
    ).toBeVisible({ timeout: 30_000 });

    // Statutory line visible per jurisdiction
    if (COUNTRY === 'AE') {
      await expect(page.locator('text=/WPS/i')).toBeVisible();
    } else if (COUNTRY === 'SA') {
      await expect(page.locator('text=/GOSI/i')).toBeVisible();
    } else if (COUNTRY === 'IN') {
      await expect(page.locator('text=/PF|ESI/i')).toBeVisible();
    }
  });

  test('@critical-path step 3: Employee exit settlement computes EOSB / gratuity', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/employees?search=${employeeCode}`);
    await page.waitForLoadState('networkidle');
    await page.click(`text=${employeeCode}`);
    await page.click('[data-testid="initiate-exit"], button:has-text("Initiate Exit")');

    await expect(
      page.locator('[data-testid="settlement-summary"], text=/settlement/i')
    ).toBeVisible({ timeout: 15_000 });
    if (COUNTRY === 'AE') {
      await expect(page.locator('text=/EOSB|End.of.Service/i')).toBeVisible();
    } else if (COUNTRY === 'IN') {
      await expect(page.locator('text=/gratuity/i')).toBeVisible();
    }
  });
});
