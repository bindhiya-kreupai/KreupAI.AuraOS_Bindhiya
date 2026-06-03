/**
 * @file critical-path-recruit-to-hire.spec.ts
 * @description Critical-path E2E journey: requisition open → candidate apply →
 *              interview pass → offer accept → onboard.
 *              Covers the v1.0 recruitment-to-employee gate (#83).
 *
 * Tag: @critical-path
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

test.describe('@critical-path Recruitment requisition → offer → hire', () => {
  let reqCode: string;
  let candidateId: string;

  test('@critical-path step 1: Recruiter opens a requisition', async ({ page }) => {
    await page.goto(`${BASE_URL}/recruitment/requisitions/new`);
    await page.waitForLoadState('networkidle');

    reqCode = `REQ-${Date.now()}`;
    await page.fill('input[name="title"]', `E2E Critical Path Role ${reqCode}`);
    await page.fill('input[name="positions"]', '1');
    await page.selectOption('select[name="department"]', { index: 1 });
    await page.click('button:has-text("Open"), button:has-text("Publish")');

    await expect(page.locator(`text=${reqCode}`)).toBeVisible({ timeout: 10_000 });
  });

  test('@critical-path step 2: Candidate applies via the career portal', async ({
    browser,
  }) => {
    const anon = await browser.newContext();
    const page = await anon.newPage();
    await page.goto(`${BASE_URL}/careers`);
    await page.waitForLoadState('networkidle');

    await page.click(`text=${reqCode}`);
    await page.fill('input[name="firstName"]', 'Critical');
    await page.fill('input[name="lastName"]', 'Candidate');
    await page.fill('input[name="email"]', `cand-${Date.now()}@e2e.test`);
    await page.click('button:has-text("Apply"), button[type="submit"]');

    await expect(page.locator('text=/thank you|received/i')).toBeVisible({ timeout: 10_000 });
    candidateId = (
      (await page.locator('[data-testid="candidate-id"]').textContent()) ?? ''
    ).trim();
    await anon.close();
  });

  test('@critical-path step 3: Recruiter advances candidate through interviews', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/recruitment/candidates`);
    await page.waitForLoadState('networkidle');

    const row = candidateId
      ? page.locator(`[data-candidate-id="${candidateId}"]`)
      : page.locator('table tr', { hasText: 'Critical Candidate' }).first();
    await row.click();

    await page.click('button:has-text("Advance"), button:has-text("Move to Interview")');
    await page.click('button:has-text("Pass"), button:has-text("Recommend Hire")');

    await expect(page.locator('text=/recommend|approved/i')).toBeVisible({ timeout: 10_000 });
  });

  test('@critical-path step 4: Offer letter generated + accepted + employee record created', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/recruitment/offers`);
    await page.waitForLoadState('networkidle');

    const row = page.locator('table tr', { hasText: 'Critical Candidate' }).first();
    await row.locator('button:has-text("Generate Offer")').click();
    await expect(page.locator('text=/offer.*generated|sent/i')).toBeVisible({ timeout: 10_000 });

    // Simulate candidate acceptance via internal action (production has a public token route)
    await row.locator('button:has-text("Mark Accepted"), [data-testid="mark-accepted"]').click();
    await expect(page.locator('text=/accepted|hired/i')).toBeVisible({ timeout: 10_000 });

    // Employee record auto-created in workforce
    await page.goto(`${BASE_URL}/employees?search=Critical+Candidate`);
    await expect(
      page.locator('table tr', { hasText: 'Critical Candidate' }).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
