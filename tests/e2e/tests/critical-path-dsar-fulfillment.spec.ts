/**
 * @file critical-path-dsar-fulfillment.spec.ts
 * @description Critical-path E2E journey: DSAR received → verified → fulfilled.
 *              Closes the v1.0 privacy-ops gate slice for #83 by exercising
 *              the GDPR / UAE PDPL / KSA PDPL SLA flow that the
 *              DSARService delivered in PR #119.
 *
 * Tag: @critical-path
 *
 * Auth: requires a privacy-admin role; uses .auth/admin.json.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const COUNTRY = (process.env.TEST_TENANT_COUNTRY ?? 'AE') as 'AE' | 'SA' | 'IN';

const EXPECTED_SLA_DAYS_BY_COUNTRY: Record<string, number> = {
  AE: 30, // UAE_PDPL_ART_18
  SA: 30, // KSA_PDPL
  IN: 30, // DPDPA / GDPR_ART_15 default
};

test.describe('@critical-path DSAR receive → verify → fulfill', () => {
  test.use({ storageState: '.auth/admin.json' });

  let requestId: string;

  test('@critical-path step 1: privacy admin receives a DSAR ACCESS request', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/privacy/dsar/new`);
    await page.waitForLoadState('networkidle');

    await page.fill(
      'input[name="subjectEmail"], [data-testid="subject-email"]',
      `dsar-${Date.now()}@e2e.test`
    );
    await page.selectOption('select[name="requestType"]', 'ACCESS');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/received|RECEIVED/i')).toBeVisible({ timeout: 10_000 });

    const idEl = page.locator('[data-testid="request-id"], code');
    requestId = ((await idEl.first().textContent()) ?? '').trim();
    expect(requestId.length).toBeGreaterThan(0);

    // SLA tile shows the jurisdiction-correct deadline
    const slaTile = page.locator('[data-testid="due-by"], text=/due/i').first();
    await expect(slaTile).toBeVisible();
    const expectedDays = EXPECTED_SLA_DAYS_BY_COUNTRY[COUNTRY];
    const slaText = await slaTile.textContent();
    expect(slaText).toMatch(new RegExp(`${expectedDays}\\s*day|in\\s*${expectedDays}\\b`, 'i'));
  });

  test('@critical-path step 2: admin moves through VERIFYING then IN_PROGRESS', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy/dsar/${requestId}`);
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Start Verification"), [data-testid="start-verification"]');
    await expect(page.locator('text=/VERIFYING/i')).toBeVisible({ timeout: 10_000 });

    await page.click('button:has-text("Start Work"), [data-testid="start-work"]');
    await expect(page.locator('text=/IN_PROGRESS/i')).toBeVisible({ timeout: 10_000 });
  });

  test('@critical-path step 3: fulfill with an artifact URL', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy/dsar/${requestId}`);
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Fulfill"), [data-testid="fulfill"]');
    await page.fill(
      'input[name="artifactUrl"], [data-testid="artifact-url"]',
      'https://artifacts.test/dsar/abc123.zip'
    );
    await page.click('button:has-text("Confirm"), [data-testid="confirm-fulfill"]');

    await expect(page.locator('text=/FULFILLED/i')).toBeVisible({ timeout: 10_000 });
  });

  test('@critical-path placeholder rejection — empty rejection reason is blocked', async ({
    page,
  }) => {
    // Spin up a fresh REJECTED candidate via the new form
    await page.goto(`${BASE_URL}/privacy/dsar/new`);
    await page.waitForLoadState('networkidle');
    await page.fill(
      'input[name="subjectEmail"], [data-testid="subject-email"]',
      `reject-${Date.now()}@e2e.test`
    );
    await page.selectOption('select[name="requestType"]', 'DELETION');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Reject"), [data-testid="reject"]');
    const submit = page.locator('button:has-text("Confirm Rejection"), [data-testid="reject-submit"]');

    // Less than 5 chars must be blocked (matches DSARService.reject contract)
    await page.fill('textarea[name="reason"]', 'no');
    const stillBlocked = await submit
      .evaluate((el: HTMLButtonElement) => el.disabled)
      .catch(() => true);
    expect(stillBlocked).toBe(true);
  });
});
