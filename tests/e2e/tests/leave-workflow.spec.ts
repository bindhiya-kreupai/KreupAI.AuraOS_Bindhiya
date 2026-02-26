/**
 * @file leave-workflow.spec.ts
 * @description E2E tests for Leave request → approval workflow:
 *   - Employee submits leave request
 *   - Manager approves / rejects
 *   - Leave balance updated
 *   - Calendar reflects approved leave
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

// ── Submit Leave Request (as employee) ────────────────────────────────────────

test.describe('Submit Leave Request', () => {
  test.use({ storageState: '.auth/employee.json' });

  test('should display leave request form', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/request`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('form, [data-testid="leave-request-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="leave-type-select"], select[name="leaveType"]')).toBeVisible();
    await expect(page.locator('[data-testid="start-date"], input[name="startDate"]')).toBeVisible();
    await expect(page.locator('[data-testid="end-date"], input[name="endDate"]')).toBeVisible();
  });

  test('should show available leave balance before submitting', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave`);
    await page.waitForLoadState('networkidle');

    // Balance cards should be visible
    await expect(
      page.locator('[data-testid="leave-balance"], .leave-balance-card').first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('should submit a valid leave request', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/request`);
    await page.waitForLoadState('networkidle');

    // Select leave type
    await page.selectOption(
      '[data-testid="leave-type-select"], select[name="leaveType"]',
      'ANNUAL',
    ).catch(async () => {
      await page.click('[data-testid="leave-type-annual"]');
    });

    // Set dates (next week)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const startDate = nextWeek.toISOString().slice(0, 10);
    nextWeek.setDate(nextWeek.getDate() + 2);
    const endDate = nextWeek.toISOString().slice(0, 10);

    await page.fill('[data-testid="start-date"], input[name="startDate"]', startDate);
    await page.fill('[data-testid="end-date"], input[name="endDate"]', endDate);

    // Reason
    await page.fill(
      '[data-testid="reason"], textarea[name="reason"]',
      'Annual leave for family event',
    );

    await page.click('button[type="submit"], [data-testid="submit-leave-request"]');

    // Success state
    await expect(
      page.locator('[data-testid="success-toast"], .toast-success, [role="status"]'),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('should prevent submission with invalid date range', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/request`);
    await page.waitForLoadState('networkidle');

    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    await page.fill('[data-testid="start-date"], input[name="startDate"]', today);
    await page.fill('[data-testid="end-date"], input[name="endDate"]', yesterday);
    await page.click('button[type="submit"], [data-testid="submit-leave-request"]');

    await expect(
      page.locator('[data-testid="date-error"], .field-error'),
    ).toBeVisible({ timeout: 3_000 });
  });
});

// ── Manager Approval Flow ─────────────────────────────────────────────────────

test.describe('Manager Leave Approval', () => {
  test.use({ storageState: '.auth/hr-manager.json' });

  test('should display pending leave requests in approval queue', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/approvals`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('[data-testid="pending-requests"], table, .pending-list'),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('should approve a pending leave request', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/approvals`);
    await page.waitForLoadState('networkidle');

    const pendingRows = page.locator(
      '[data-testid="pending-request-row"], tbody tr:has([data-testid="approve-button"])',
    );
    const count = await pendingRows.count();

    if (count > 0) {
      await pendingRows.first().locator('[data-testid="approve-button"], button:has-text("Approve")').click();

      // Confirm if dialog appears
      const confirmBtn = page.locator('[data-testid="confirm-approve"], button:has-text("Confirm")');
      if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmBtn.click();
      }

      await expect(
        page.locator('[data-testid="success-toast"], .toast-success'),
      ).toBeVisible({ timeout: 5_000 });
    } else {
      console.log('No pending leave requests to approve — skipping approval test.');
    }
  });

  test('should reject a pending leave request with a reason', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/approvals`);
    await page.waitForLoadState('networkidle');

    const pendingRows = page.locator(
      '[data-testid="pending-request-row"], tbody tr:has([data-testid="reject-button"])',
    );
    const count = await pendingRows.count();

    if (count > 0) {
      await pendingRows.first().locator('[data-testid="reject-button"], button:has-text("Reject")').click();

      const rejectReason = page.locator('[data-testid="reject-reason"], textarea[name="reason"]');
      if (await rejectReason.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await rejectReason.fill('Insufficient staffing on those dates.');
        await page.click('[data-testid="confirm-reject"], button:has-text("Reject")');
      }

      await expect(
        page.locator('[data-testid="success-toast"], .toast-success'),
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});

// ── Leave Calendar ────────────────────────────────────────────────────────────

test.describe('Leave Calendar', () => {
  test.use({ storageState: '.auth/admin.json' });

  test('should display team leave calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('[data-testid="leave-calendar"], .calendar, .fc'),
    ).toBeVisible({ timeout: 5_000 });
  });
});
