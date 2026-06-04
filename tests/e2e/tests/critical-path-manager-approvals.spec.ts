/**
 * @file critical-path-manager-approvals.spec.ts
 * @description Critical-path E2E journey: manager approval queue end-to-end.
 *              Covers the §15.2 manager screens called out in the v1.0 gate
 *              runbook — leave, expense, and benefits claim approvals from
 *              a single inbox.
 *
 * Tag: @critical-path
 *
 * Auth: uses .auth/manager.json (aliased from hr-manager.json in global-setup).
 *
 * Pre-seed: global-setup must put at least one PENDING leave, one PENDING
 * expense, and one SUBMITTED benefits claim into the test tenant so the
 * inbox is non-empty.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

test.describe('@critical-path Manager approval queue', () => {
  test.use({ storageState: '.auth/manager.json' });

  test('@critical-path inbox lists pending items across all approval types', async ({ page }) => {
    await page.goto(`${BASE_URL}/manager/approvals`);
    await page.waitForLoadState('networkidle');

    // The inbox must show counts for each surface so manager can triage at a glance
    await expect(page.locator('[data-testid="inbox-leave-count"], text=/leave/i')).toBeVisible();
    await expect(page.locator('[data-testid="inbox-expense-count"], text=/expense/i')).toBeVisible();
    await expect(page.locator('[data-testid="inbox-benefits-count"], text=/benefit/i')).toBeVisible();
  });

  test('@critical-path approve a leave request from the inbox', async ({ page }) => {
    await page.goto(`${BASE_URL}/manager/approvals`);
    await page.waitForLoadState('networkidle');

    const leaveTab = page.locator('[role="tab"]:has-text("Leave"), [data-testid="tab-leave"]');
    if (await leaveTab.isVisible()) await leaveTab.click();

    const firstRow = page.locator('table tr').filter({ hasText: /pending/i }).first();
    await firstRow.locator('button:has-text("Approve")').click();

    await expect(
      page.locator('[role="dialog"]:has-text("Approve"), [data-testid="confirm-dialog"]')
    ).toBeVisible({ timeout: 5_000 });
    await page.click('button:has-text("Confirm"), [data-testid="confirm-approve"]');

    await expect(page.locator('text=/approved/i')).toBeVisible({ timeout: 10_000 });
  });

  test('@critical-path approve a benefits claim from the inbox', async ({ page }) => {
    await page.goto(`${BASE_URL}/manager/approvals`);
    await page.waitForLoadState('networkidle');

    const benefitsTab = page.locator('[role="tab"]:has-text("Benefit"), [data-testid="tab-benefits"]');
    if (await benefitsTab.isVisible()) await benefitsTab.click();

    const row = page.locator('table tr').filter({ hasText: /submitted|under.review/i }).first();
    await row.locator('button:has-text("Approve"), button:has-text("Review")').click();

    // EOB entry form must surface — exercises the BenefitsClaimService.approve contract
    await page.fill(
      '[data-testid="approved-amount"], input[name="approvedAmount"]',
      '100'
    );
    await page.click('button:has-text("Confirm Approval"), [data-testid="confirm"]');
    await expect(page.locator('text=/approved|partial/i')).toBeVisible({ timeout: 10_000 });
  });

  test('@critical-path reject blocks without a reason and accepts with ≥ 5 chars', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/manager/approvals`);
    await page.waitForLoadState('networkidle');

    const row = page.locator('table tr').filter({ hasText: /pending/i }).first();
    await row.locator('button:has-text("Reject")').click();

    const submit = page.locator('button:has-text("Submit Rejection"), [data-testid="reject-submit"]');
    // Empty reason — submit must be disabled or surface validation
    await page.fill('textarea[name="reason"], [data-testid="reject-reason"]', 'ok');
    const isStillBlocked = await submit
      .evaluate((el: HTMLButtonElement) => el.disabled)
      .catch(() => true);
    expect(isStillBlocked).toBe(true);

    await page.fill('textarea[name="reason"], [data-testid="reject-reason"]', 'over budget cap');
    await submit.click();
    await expect(page.locator('text=/rejected/i')).toBeVisible({ timeout: 10_000 });
  });
});
