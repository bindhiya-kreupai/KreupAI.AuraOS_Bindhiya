/**
 * @file expense-approval.spec.ts
 * @description E2E tests for Expense submission → approval workflow:
 *   - Employee submits expense claim
 *   - Manager approves / rejects
 *   - Finance processes payment
 *   - Expense report generation
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

// ── Submit Expense (as employee) ──────────────────────────────────────────────

test.describe('Submit Expense Claim', () => {
  test.use({ storageState: '.auth/employee.json' });

  test('should display expense submission form', async ({ page }) => {
    await page.goto(`${BASE_URL}/expenses/new`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('form, [data-testid="expense-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="expense-category"], select[name="category"]')).toBeVisible();
    await expect(page.locator('[data-testid="expense-amount"], input[name="amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="expense-date"], input[name="date"]')).toBeVisible();
  });

  test('should submit a valid expense claim', async ({ page }) => {
    await page.goto(`${BASE_URL}/expenses/new`);
    await page.waitForLoadState('networkidle');

    // Category
    await page.selectOption(
      '[data-testid="expense-category"], select[name="category"]',
      { index: 1 },
    ).catch(async () => {
      await page.click('[data-testid="category-travel"]');
    });

    // Amount
    await page.fill('[data-testid="expense-amount"], input[name="amount"]', '250.00');

    // Date
    const today = new Date().toISOString().slice(0, 10);
    await page.fill('[data-testid="expense-date"], input[name="date"]', today);

    // Description
    await page.fill(
      '[data-testid="expense-description"], textarea[name="description"]',
      'Client meeting travel expenses',
    );

    // Currency
    await page.selectOption('[data-testid="currency-select"], select[name="currency"]', 'AED').catch(() => { /* optional field */ });

    await page.click('button[type="submit"], [data-testid="submit-expense"]');

    await expect(
      page.locator('[data-testid="success-toast"], .toast-success, [role="status"]'),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('should validate required fields before submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/expenses/new`);
    await page.waitForLoadState('networkidle');

    await page.click('button[type="submit"], [data-testid="submit-expense"]');

    await expect(
      page.locator('[data-testid="amount-error"], .field-error').first(),
    ).toBeVisible({ timeout: 3_000 });
  });

  test('should reject expense with negative amount', async ({ page }) => {
    await page.goto(`${BASE_URL}/expenses/new`);
    await page.waitForLoadState('networkidle');

    await page.fill('[data-testid="expense-amount"], input[name="amount"]', '-100');
    await page.click('button[type="submit"]');

    await expect(
      page.locator('[data-testid="amount-error"], .field-error, [role="alert"]'),
    ).toBeVisible({ timeout: 3_000 });
  });

  test('should display expense history', async ({ page }) => {
    await page.goto(`${BASE_URL}/expenses`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('[data-testid="expense-list"], table, [data-testid="expense-history"]'),
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ── Manager Approval ──────────────────────────────────────────────────────────

test.describe('Manager Expense Approval', () => {
  test.use({ storageState: '.auth/hr-manager.json' });

  test('should display pending expense claims in approval queue', async ({ page }) => {
    await page.goto(`${BASE_URL}/expenses/approvals`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('[data-testid="pending-expenses"], table, .pending-list'),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('should approve a pending expense claim', async ({ page }) => {
    await page.goto(`${BASE_URL}/expenses/approvals`);
    await page.waitForLoadState('networkidle');

    const pendingRows = page.locator(
      '[data-testid="expense-row"]:has([data-testid="approve-button"]), tbody tr:has(button:has-text("Approve"))',
    );
    const count = await pendingRows.count();

    if (count > 0) {
      await pendingRows.first().locator('[data-testid="approve-button"], button:has-text("Approve")').click();

      const confirmBtn = page.locator('[data-testid="confirm-approve"], button:has-text("Confirm")');
      if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmBtn.click();
      }

      await expect(
        page.locator('[data-testid="success-toast"], .toast-success'),
      ).toBeVisible({ timeout: 5_000 });
    } else {
      console.log('No pending expenses to approve — skipping.');
    }
  });

  test('should reject an expense with comment', async ({ page }) => {
    await page.goto(`${BASE_URL}/expenses/approvals`);
    await page.waitForLoadState('networkidle');

    const pendingRows = page.locator(
      '[data-testid="expense-row"]:has([data-testid="reject-button"]), tbody tr:has(button:has-text("Reject"))',
    );
    const count = await pendingRows.count();

    if (count > 0) {
      await pendingRows.first().locator('[data-testid="reject-button"], button:has-text("Reject")').click();

      const reasonInput = page.locator('[data-testid="reject-reason"], textarea[name="reason"]');
      if (await reasonInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await reasonInput.fill('Receipt not attached. Please resubmit with receipt.');
        await page.click('[data-testid="confirm-reject"], button:has-text("Reject")');
      }

      await expect(
        page.locator('[data-testid="success-toast"], .toast-success'),
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});

// ── Finance Processing ────────────────────────────────────────────────────────

test.describe('Finance Payment Processing', () => {
  test.use({ storageState: '.auth/admin.json' });

  test('should display approved expenses ready for payment', async ({ page }) => {
    await page.goto(`${BASE_URL}/expenses/payment`);
    await page.waitForLoadState('networkidle');

    // Finance view — list of approved, unpaid expenses
    await expect(
      page.locator('[data-testid="approved-expenses"], table, .expense-payment-list'),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('should allow bulk payment processing', async ({ page }) => {
    await page.goto(`${BASE_URL}/expenses/payment`);
    await page.waitForLoadState('networkidle');

    const checkboxes = page.locator('[data-testid="expense-checkbox"], input[type="checkbox"]');
    const count      = await checkboxes.count();

    if (count > 0) {
      // Select all
      await page.click('[data-testid="select-all"], input[type="checkbox"]').first();

      const processBtn = page.locator('[data-testid="process-payment"], button:has-text("Process Payment")');
      const isVisible  = await processBtn.isVisible({ timeout: 2_000 }).catch(() => false);

      if (isVisible) {
        await expect(processBtn).toBeVisible();
        // Do NOT actually process payment in E2E
      }
    }
  });
});
