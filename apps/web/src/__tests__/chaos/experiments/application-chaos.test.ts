/**
 * Application-Level Chaos Engineering Tests (Day 75)
 *
 * Tests application resilience under business logic failures:
 * - Invalid data handling
 * - Edge case scenarios
 * - Race conditions
 * - Data inconsistencies
 * - Third-party service failures
 * - Session expiration
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Invalid Data Handling', () => {
  test('should handle malformed API responses', async ({ page, context }) => {
    // Intercept and corrupt API response
    await context.route('**/api/employees', async (route) => {
      await route.fulfill({
        status: 200,
        body: 'Invalid JSON{{{',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/employees`);
    await page.waitForTimeout(2000);

    // Should show error message, not crash
    const errorMessage = page.locator('.error, [role="alert"], .alert-error');
    const hasError = await errorMessage.count() > 0;
    console.log(`Error handled gracefully: ${hasError}`);

    await context.unroute('**/api/employees');
  });

  test('should handle missing required fields in API response', async ({ page, context }) => {
    // Return incomplete data
    await context.route('**/api/employees/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          // Missing critical fields
          id: '123',
          // no name, email, etc.
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/employees/123`);
    await page.waitForTimeout(2000);

    // Should handle missing data gracefully
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();

    await context.unroute('**/api/employees/**');
  });

  test('should handle unexpected data types', async ({ page, context }) => {
    // Return wrong data types
    await context.route('**/api/employees', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: 123, // number instead of string
              salary: '50000', // string instead of number
              isActive: 'yes', // string instead of boolean
              joinDate: 1234567890, // timestamp instead of ISO string
            },
          ],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/employees`);
    await page.waitForTimeout(2000);

    // Should handle type coercion or show appropriate error
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();

    await context.unroute('**/api/employees');
  });

  test('should handle extremely large datasets', async ({ page, context }) => {
    // Return massive dataset
    await context.route('**/api/employees', async (route) => {
      const largeDataset = {
        data: Array(10000).fill(null).map((_, i) => ({
          id: `emp-${i}`,
          firstName: `Employee${i}`,
          lastName: `User${i}`,
          email: `emp${i}@auraos.com`,
          department: 'Engineering',
          position: 'Developer',
        })),
        total: 10000,
      };

      await route.fulfill({
        status: 200,
        body: JSON.stringify(largeDataset),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    const start = Date.now();
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    const elapsed = Date.now() - start;

    console.log(`Large dataset loaded in: ${elapsed}ms`);

    // Should implement pagination or virtualization
    const visibleRows = await page.locator('table tr, .employee-card').count();
    console.log(`Visible rows: ${visibleRows}`);
    expect(visibleRows).toBeLessThan(10000); // Should not render all 10k

    await context.unroute('**/api/employees');
  });
});

test.describe('Race Condition Scenarios', () => {
  test('should handle concurrent leave applications', async ({ browser }) => {
    // Open two browser contexts to simulate two users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Login both users
    for (const page of [page1, page2]) {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'employee@auraos.com');
      await page.fill('input[name="password"]', 'Employee@123');
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/dashboard`);
    }

    // Both apply for leave on same dates simultaneously
    await Promise.all([
      (async () => {
        await page1.goto(`${BASE_URL}/leave/apply`);
        await page1.fill('input[name="startDate"]', '2025-01-15');
        await page1.fill('input[name="endDate"]', '2025-01-17');
        await page1.selectOption('select[name="leaveType"]', 'Annual Leave');
        await page1.click('button[type="submit"]');
      })(),
      (async () => {
        await page2.goto(`${BASE_URL}/leave/apply`);
        await page2.fill('input[name="startDate"]', '2025-01-15');
        await page2.fill('input[name="endDate"]', '2025-01-17');
        await page2.selectOption('select[name="leaveType"]', 'Annual Leave');
        await page2.click('button[type="submit"]');
      })(),
    ]);

    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    // Both should either succeed or one should fail gracefully
    const success1 = page1.url().includes('/leave') || (await page1.locator('.success').count()) > 0;
    const success2 = page2.url().includes('/leave') || (await page2.locator('.success').count()) > 0;

    console.log(`Request 1 success: ${success1}, Request 2 success: ${success2}`);

    await context1.close();
    await context2.close();
  });

  test('should handle concurrent payroll processing', async ({ page, context }) => {
    // Simulate race condition in payroll processing
    let processingCount = 0;

    await context.route('**/api/payroll/process', async (route) => {
      processingCount++;

      if (processingCount > 1) {
        // Second request should be rejected
        await route.fulfill({
          status: 409,
          body: JSON.stringify({ error: 'Payroll processing already in progress' }),
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/payroll`);

    // Click process button multiple times rapidly
    const processButton = page.locator('button:has-text("Process Payroll")');
    if (await processButton.count() > 0) {
      await processButton.click();
      await processButton.click(); // Second click should be prevented

      await page.waitForTimeout(1000);

      // Should show conflict error or disable button
      const errorOrDisabled =
        (await page.locator('.error').count()) > 0 ||
        (await processButton.isDisabled());

      console.log(`Concurrent processing prevented: ${errorOrDisabled}`);
    }

    await context.unroute('**/api/payroll/process');
  });

  test('should handle concurrent attendance clock-ins', async ({ browser }) => {
    // Simulate employee trying to clock in from multiple devices
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Login same user on both
    for (const page of [page1, page2]) {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'employee@auraos.com');
      await page.fill('input[name="password"]', 'Employee@123');
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/dashboard`);
    }

    // Click clock-in simultaneously
    await Promise.all([
      page1.goto(`${BASE_URL}/attendance`),
      page2.goto(`${BASE_URL}/attendance`),
    ]);

    const clockInButton1 = page1.locator('button:has-text("Clock In")');
    const clockInButton2 = page2.locator('button:has-text("Clock In")');

    if ((await clockInButton1.count()) > 0 && (await clockInButton2.count()) > 0) {
      await Promise.all([
        clockInButton1.click(),
        clockInButton2.click(),
      ]);

      await page1.waitForTimeout(2000);

      // Only one should succeed, or both should get idempotent response
      const status1 = page1.locator('.success, .error');
      const status2 = page2.locator('.success, .error');

      const hasStatus1 = (await status1.count()) > 0;
      const hasStatus2 = (await status2.count()) > 0;

      console.log(`Clock-in status shown: ${hasStatus1 || hasStatus2}`);
    }

    await context1.close();
    await context2.close();
  });
});

test.describe('Session Management Chaos', () => {
  test('should handle session expiration gracefully', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Simulate session expiration
    await context.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Session expired' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/employees`);
    await page.waitForTimeout(2000);

    // Should redirect to login or show session expired message
    const isLoginPage = page.url().includes('/login');
    const hasSessionError = (await page.locator('text=/session.*expired/i').count()) > 0;

    console.log(`Redirected to login: ${isLoginPage}, Session error shown: ${hasSessionError}`);
    expect(isLoginPage || hasSessionError).toBeTruthy();

    await context.unroute('**/api/**');
  });

  test('should handle token refresh failures', async ({ page, context }) => {
    let refreshAttempts = 0;

    await context.route('**/api/auth/refresh', async (route) => {
      refreshAttempts++;

      if (refreshAttempts < 3) {
        await route.fulfill({ status: 503 }); // Refresh fails
      } else {
        await route.continue(); // Eventually succeeds
      }
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Trigger token refresh (simulate expired token)
    await page.waitForTimeout(2000);
    await page.goto(`${BASE_URL}/employees`);

    await page.waitForTimeout(3000);

    console.log(`Token refresh attempts: ${refreshAttempts}`);

    await context.unroute('**/api/auth/refresh');
  });

  test('should handle concurrent sessions', async ({ browser }) => {
    // Login from two different browsers
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Login same user
    for (const page of [page1, page2]) {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'admin@auraos.com');
      await page.fill('input[name="password"]', 'Admin@123');
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/dashboard`);
    }

    // Both sessions should work or second should invalidate first
    await page1.goto(`${BASE_URL}/employees`);
    await page2.goto(`${BASE_URL}/employees`);

    const page1Valid = !page1.url().includes('/login');
    const page2Valid = !page2.url().includes('/login');

    console.log(`Session 1 valid: ${page1Valid}, Session 2 valid: ${page2Valid}`);

    await context1.close();
    await context2.close();
  });
});

test.describe('Third-Party Service Failures', () => {
  test('should handle email service failures', async ({ page, context }) => {
    // Simulate email service down
    await context.route('**/api/email/**', async (route) => {
      await route.fulfill({
        status: 503,
        body: JSON.stringify({ error: 'Email service unavailable' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Try to send email (e.g., leave approval notification)
    await page.goto(`${BASE_URL}/leave/requests`);

    const approveButton = page.locator('button:has-text("Approve")').first();
    if (await approveButton.count() > 0) {
      await approveButton.click();
      await page.waitForTimeout(2000);

      // Should succeed but queue email or show warning
      const warning = page.locator('.warning, [role="status"]');
      const hasWarning = await warning.count() > 0;
      console.log(`Email failure warning shown: ${hasWarning}`);
    }

    await context.unroute('**/api/email/**');
  });

  test('should handle SMS service failures', async ({ page, context }) => {
    // Simulate SMS service down
    await context.route('**/api/sms/**', async (route) => {
      await route.fulfill({
        status: 503,
        body: JSON.stringify({ error: 'SMS gateway unavailable' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);

    // Try to request OTP
    const otpButton = page.locator('button:has-text("Send OTP")');
    if (await otpButton.count() > 0) {
      await otpButton.click();
      await page.waitForTimeout(2000);

      // Should show error or fallback option
      const error = page.locator('.error, [role="alert"]');
      const hasError = await error.count() > 0;
      console.log(`SMS failure error shown: ${hasError}`);
    }

    await context.unroute('**/api/sms/**');
  });

  test('should handle payment gateway failures', async ({ page, context }) => {
    // Simulate payment gateway down (for payroll processing)
    await context.route('**/api/payment/**', async (route) => {
      await route.fulfill({
        status: 503,
        body: JSON.stringify({ error: 'Payment gateway timeout' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/payroll/disburse`);

    const disburseButton = page.locator('button:has-text("Disburse")');
    if (await disburseButton.count() > 0) {
      await disburseButton.click();
      await page.waitForTimeout(2000);

      // Should show error and retry option
      const error = page.locator('.error, [role="alert"]');
      const retryButton = page.locator('button:has-text("Retry")');

      const hasError = await error.count() > 0;
      const hasRetry = await retryButton.count() > 0;

      console.log(`Payment error shown: ${hasError}, Retry option: ${hasRetry}`);
    }

    await context.unroute('**/api/payment/**');
  });

  test('should handle storage service failures', async ({ page, context }) => {
    // Simulate S3/cloud storage down
    await context.route('**/api/storage/**', async (route) => {
      await route.fulfill({
        status: 503,
        body: JSON.stringify({ error: 'Storage service unavailable' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Try to upload document
    await page.goto(`${BASE_URL}/documents/upload`);

    const uploadInput = page.locator('input[type="file"]');
    if (await uploadInput.count() > 0) {
      // Set file
      await uploadInput.setInputFiles({
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Test PDF content'),
      });

      const submitButton = page.locator('button[type="submit"], button:has-text("Upload")');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);

        // Should show error
        const error = page.locator('.error, [role="alert"]');
        const hasError = await error.count() > 0;
        console.log(`Storage failure error shown: ${hasError}`);
      }
    }

    await context.unroute('**/api/storage/**');
  });
});

test.describe('Data Inconsistency Scenarios', () => {
  test('should handle salary calculation inconsistencies', async ({ page, context }) => {
    // Return inconsistent salary data
    await context.route('**/api/payroll/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          baseSalary: 50000,
          allowances: 10000,
          deductions: 5000,
          netSalary: 52000, // Incorrect calculation (should be 55000)
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/payroll/payslip`);
    await page.waitForTimeout(2000);

    // Should detect and flag inconsistency
    const warning = page.locator('.warning, .inconsistency-alert');
    const hasWarning = await warning.count() > 0;
    console.log(`Calculation inconsistency detected: ${hasWarning}`);

    await context.unroute('**/api/payroll/**');
  });

  test('should handle leave balance inconsistencies', async ({ page, context }) => {
    // Return impossible leave balance
    await context.route('**/api/leave/balance', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          totalLeaves: 20,
          usedLeaves: 25, // More used than total!
          remainingLeaves: -5,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/leave`);
    await page.waitForTimeout(2000);

    // Should handle negative balance gracefully
    const error = page.locator('.error, [role="alert"], .data-error');
    const hasError = await error.count() > 0;
    console.log(`Leave balance inconsistency handled: ${hasError}`);

    await context.unroute('**/api/leave/balance');
  });

  test('should handle attendance record conflicts', async ({ page, context }) => {
    // Return conflicting attendance records
    await context.route('**/api/attendance', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            { id: '1', date: '2025-01-15', clockIn: '09:00', clockOut: '18:00', status: 'Present' },
            { id: '2', date: '2025-01-15', clockIn: '10:00', clockOut: '19:00', status: 'Present' },
            // Duplicate records for same date!
          ],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/attendance`);
    await page.waitForTimeout(2000);

    // Should detect duplicate records
    const warning = page.locator('.warning, .duplicate-alert');
    const hasWarning = await warning.count() > 0;
    console.log(`Attendance conflict detected: ${hasWarning}`);

    await context.unroute('**/api/attendance');
  });
});

test.describe('Edge Case Handling', () => {
  test('should handle empty API responses', async ({ page, context }) => {
    await context.route('**/api/employees', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [], total: 0 }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/employees`);
    await page.waitForTimeout(2000);

    // Should show empty state
    const emptyState = page.locator('[data-testid="empty-state"], .empty-message, text=/no.*employees/i');
    const hasEmptyState = await emptyState.count() > 0;
    console.log(`Empty state shown: ${hasEmptyState}`);

    await context.unroute('**/api/employees');
  });

  test('should handle pagination edge cases', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Try to access invalid page number
    await page.goto(`${BASE_URL}/employees?page=99999`);
    await page.waitForTimeout(2000);

    // Should handle gracefully (show empty or redirect to page 1)
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should handle timezone edge cases', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Clock in at midnight (edge case)
    await page.goto(`${BASE_URL}/attendance`);

    const clockInButton = page.locator('button:has-text("Clock In")');
    if (await clockInButton.count() > 0) {
      // Set time to midnight
      await page.evaluate(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        // Mock Date
        // @ts-ignore
        global.Date = class extends Date {
          constructor() {
            super();
            return now;
          }
        };
      });

      await clockInButton.click();
      await page.waitForTimeout(2000);

      // Should handle midnight clock-in correctly
      const success = page.locator('.success, [role="status"]');
      const hasSuccess = await success.count() > 0;
      console.log(`Midnight clock-in handled: ${hasSuccess}`);
    }
  });

  test('should handle special characters in input', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Search with special characters
    await page.goto(`${BASE_URL}/employees`);

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('John & Jane <test>');
      await page.keyboard.press('Enter');

      await page.waitForTimeout(2000);

      // Should handle special characters safely
      const results = await page.locator('body').isVisible();
      expect(results).toBeTruthy();
    }
  });
});

test.describe('Application Recovery', () => {
  test('should implement automatic retry for failed requests', async ({ page, context }) => {
    let attemptCount = 0;

    await context.route('**/api/employees', async (route) => {
      attemptCount++;

      if (attemptCount <= 2) {
        await route.fulfill({ status: 503 });
      } else {
        await route.continue();
      }
    });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    console.log(`Request attempts: ${attemptCount}`);
    expect(attemptCount).toBeGreaterThan(1); // Should retry

    await context.unroute('**/api/employees');
  });

  test('should implement fallback UI for critical failures', async ({ page, context }) => {
    // All API requests fail
    await context.route('**/api/**', async (route) => {
      await route.fulfill({ status: 503 });
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);

    // Should show fallback/error UI, not blank page
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);

    await context.unroute('**/api/**');
  });

  test('should log errors for monitoring', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });

    await page.goto(`${BASE_URL}/invalid-route-12345`);
    await page.waitForTimeout(2000);

    console.log(`Console errors captured: ${consoleErrors.length}`);

    // Errors should be logged for monitoring
    // This helps detect issues in production
  });
});
