/**
 * @file critical-path-leave-cycle.spec.ts
 * @description Critical-path E2E journey: leave request → manager approval →
 *              balance update → calendar render.
 *              Covers the v1.0 leave-engine gate (#83).
 *
 * Tag: @critical-path
 *
 * Variations:
 *   - Bilingual: rerun with TEST_LOCALE=ar to verify RTL form + balance card
 *   - Per-jurisdiction policy (FMLA / UAE Federal Decree-Law 33 / India Factories Act)
 *     is driven by tenant config; this suite asserts the workflow, not the policy math.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

test.describe('@critical-path Leave request → approval → balance', () => {
  test.use({ storageState: '.auth/employee.json' });

  let initialBalance: number;
  let requestId: string;

  test('@critical-path step 1: Employee captures the starting leave balance', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/leave`);
    await page.waitForLoadState('networkidle');

    const balanceText = await page
      .locator('[data-testid="leave-balance"], [aria-label="leave balance"]')
      .first()
      .textContent();
    initialBalance = Number((balanceText ?? '0').replace(/[^\d.-]/g, ''));
    expect(initialBalance).toBeGreaterThan(0);
  });

  test('@critical-path step 2: Employee submits a single-day annual leave request', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/leave/request`);
    await page.waitForLoadState('networkidle');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isoDay = tomorrow.toISOString().slice(0, 10);

    await page.selectOption('select[name="leaveType"]', { label: /annual/i });
    await page.fill('input[name="startDate"]', isoDay);
    await page.fill('input[name="endDate"]', isoDay);
    await page.fill('textarea[name="reason"], input[name="reason"]', 'critical-path E2E');

    await page.click('button[type="submit"]');
    await expect(page.locator('text=/submitted|pending/i')).toBeVisible({ timeout: 10_000 });

    requestId = (
      (await page.locator('[data-testid="request-id"]').textContent()) ?? ''
    ).trim();
  });

  test('@critical-path step 3: Manager approves the request', async ({ browser }) => {
    const managerContext = await browser.newContext({ storageState: '.auth/manager.json' });
    const page = await managerContext.newPage();
    await page.goto(`${BASE_URL}/manager/approvals`);
    await page.waitForLoadState('networkidle');

    const row = requestId
      ? page.locator(`tr:has-text("${requestId}"), [data-request-id="${requestId}"]`)
      : page.locator('table tr', { hasText: 'critical-path E2E' }).first();
    await row.locator('button:has-text("Approve")').click();

    await expect(row.locator('text=/approved/i')).toBeVisible({ timeout: 10_000 });
    await managerContext.close();
  });

  test('@critical-path step 4: Employee sees reduced balance + calendar entry', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/leave`);
    await page.waitForLoadState('networkidle');

    const balanceText = await page
      .locator('[data-testid="leave-balance"], [aria-label="leave balance"]')
      .first()
      .textContent();
    const newBalance = Number((balanceText ?? '0').replace(/[^\d.-]/g, ''));
    expect(newBalance).toBe(initialBalance - 1);

    await page.goto(`${BASE_URL}/leave/calendar`);
    await expect(
      page.locator('[data-testid="leave-entry"], .leave-entry, text=/critical-path E2E/i')
    ).toBeVisible({ timeout: 10_000 });
  });
});
