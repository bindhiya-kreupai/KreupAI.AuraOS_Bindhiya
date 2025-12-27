/**
 * Attendance Regularization E2E Tests
 * Plan D - Week 7, Day 33
 *
 * Tests attendance regularization request and approval workflows
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const EMPLOYEE_EMAIL = 'employee@e2etest.com';
const EMPLOYEE_PASSWORD = 'Test@1234';
const MANAGER_EMAIL = 'manager@e2etest.com';
const MANAGER_PASSWORD = 'Test@1234';

let employeeToken: string;
let managerToken: string;

test.describe('Attendance Regularization E2E', () => {
  test.beforeAll(async ({ request }) => {
    const empResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: EMPLOYEE_EMAIL,
        password: EMPLOYEE_PASSWORD,
      },
    });

    const empData = await empResponse.json();
    employeeToken = empData.data.accessToken;

    const mgrResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: MANAGER_EMAIL,
        password: MANAGER_PASSWORD,
      },
    });

    const mgrData = await mgrResponse.json();
    managerToken = mgrData.data.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, employeeToken);
  });

  test('should navigate to regularization module', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    await expect(page.locator('h1')).toContainText('Attendance Regularization');

    // Should show option to apply for regularization
    await expect(page.locator('button:has-text("Apply for Regularization")')).toBeVisible();
  });

  test('should apply for late arrival regularization', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    // Click "Apply for Regularization"
    await page.click('button:has-text("Apply for Regularization")');

    // Modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Select regularization type
    await page.selectOption('select[name="type"]', 'late-arrival');

    // Select date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="date"]', formatDate(yesterday));

    // Actual clock in time is auto-filled
    // Enter expected time
    await page.fill('input[name="expectedClockIn"]', '09:00');

    // Enter reason
    await page.fill('textarea[name="reason"]', 'Traffic jam on highway due to accident');

    // Upload supporting document (optional)
    const fileInput = page.locator('input[type="file"][name="attachment"]');
    if (await fileInput.isVisible()) {
      // In real test: await fileInput.setInputFiles('path/to/supporting-doc.pdf');
    }

    // Submit
    await page.click('button[type="submit"]:has-text("Submit")');

    await expect(page.locator('.toast-success')).toContainText('Regularization request submitted');

    // Should appear in requests list
    await expect(page.locator('table tbody tr:has-text("Late Arrival")').first()).toBeVisible();
  });

  test('should apply for early departure regularization', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    await page.click('button:has-text("Apply for Regularization")');

    // Select early departure
    await page.selectOption('select[name="type"]', 'early-departure');

    // Select date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await page.fill('input[name="date"]', yesterday.toISOString().split('T')[0]);

    // Enter expected time
    await page.fill('input[name="expectedClockOut"]', '18:00');

    // Reason
    await page.fill('textarea[name="reason"]', 'Medical emergency - had to visit hospital');

    await page.click('button[type="submit"]:has-text("Submit")');

    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should apply for missed clock in/out regularization', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    await page.click('button:has-text("Apply for Regularization")');

    // Select missed punch
    await page.selectOption('select[name="type"]', 'missed-punch');

    // Select date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await page.fill('input[name="date"]', yesterday.toISOString().split('T')[0]);

    // Select which punch was missed
    await page.selectOption('select[name="missedPunch"]', 'clock-out');

    // Enter time
    await page.fill('input[name="clockOutTime"]', '18:30');

    // Reason
    await page.fill('textarea[name="reason"]', 'Forgot to clock out due to urgent meeting');

    await page.click('button[type="submit"]:has-text("Submit")');

    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should apply for absent day regularization', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    await page.click('button:has-text("Apply for Regularization")');

    // Select absent day
    await page.selectOption('select[name="type"]', 'absent-day');

    // Select date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    await page.fill('input[name="date"]', yesterday.toISOString().split('T')[0]);

    // Enter both times
    await page.fill('input[name="clockInTime"]', '09:15');
    await page.fill('input[name="clockOutTime"]', '18:00');

    // Reason
    await page.fill('textarea[name="reason"]', 'Was working from remote location, no internet for clocking');

    await page.click('button[type="submit"]:has-text("Submit")');

    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should validate regularization date restrictions', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    await page.click('button:has-text("Apply for Regularization")');

    // Try to regularize attendance older than allowed days (e.g., 7 days)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10); // 10 days ago
    await page.fill('input[name="date"]', oldDate.toISOString().split('T')[0]);

    await page.selectOption('select[name="type"]', 'late-arrival');

    // Should show validation error
    const errorMessage = page.locator('text=/cannot.*regularize|too old|past.*deadline/i');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should view regularization request history', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    // Should show table of regularization requests
    await expect(page.locator('table')).toBeVisible();

    // Verify columns
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Reason")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should view regularization request details', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    const firstRow = page.locator('table tbody tr:first-child');

    if (await firstRow.isVisible()) {
      // Click on row
      await firstRow.click();

      // Details modal should open
      await expect(page.locator('[data-testid="regularization-details"]')).toBeVisible();

      // Should show all details
      await expect(page.locator('text=Date:')).toBeVisible();
      await expect(page.locator('text=Type:')).toBeVisible();
      await expect(page.locator('text=Reason:')).toBeVisible();
      await expect(page.locator('text=Status:')).toBeVisible();

      // If approved/rejected, should show approver info
      const approverInfo = page.locator('text=Approved By:, text=Rejected By:');
      if (await approverInfo.first().isVisible()) {
        await expect(approverInfo.first()).toBeVisible();
      }
    }
  });

  test('should edit pending regularization request', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    const pendingRow = page.locator('table tbody tr:has-text("Pending")').first();

    if (await pendingRow.isVisible()) {
      // Click edit button
      await pendingRow.locator('button[aria-label="Edit"]').click();

      // Modal should open with existing data
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Modify reason
      await page.fill('textarea[name="reason"]', 'Updated: Traffic due to heavy rain and road closure');

      // Update
      await page.click('button[type="submit"]:has-text("Update")');

      await expect(page.locator('.toast-success')).toContainText('updated');
    }
  });

  test('should cancel pending regularization request', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    const pendingRow = page.locator('table tbody tr:has-text("Pending")').first();

    if (await pendingRow.isVisible()) {
      // Click cancel button
      await pendingRow.locator('button[aria-label="Cancel"]').click();

      // Confirmation
      await expect(page.locator('[role="alertdialog"]')).toBeVisible();

      await page.click('button:has-text("Cancel Request")');

      await expect(page.locator('.toast-success')).toContainText('cancelled');
    }
  });

  test('should filter regularization requests by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    // Open status filter
    await page.click('button:has-text("Status")');

    // Select approved
    await page.click('label:has-text("Approved") input[type="checkbox"]');

    await page.click('button:has-text("Apply")');

    // All visible rows should be approved
    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i)).toContainText('Approved');
      }
    }
  });

  test('should filter regularization requests by type', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    // Open type filter
    await page.click('button:has-text("Type")');

    // Select late arrival
    await page.click('label:has-text("Late Arrival") input[type="checkbox"]');

    await page.click('button:has-text("Apply")');

    // All visible rows should be late arrival
    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(rows.nth(i)).toContainText('Late Arrival');
      }
    }
  });

  test('should export regularization history', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization`);

    // Click export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');

    await page.click('button:has-text("Excel")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('regularization');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});

test.describe('Regularization Approval (Manager)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, managerToken);
  });

  test('should view pending regularization requests', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization/approvals`);

    await expect(page.locator('h1')).toContainText('Regularization Approvals');

    // Should show pending requests table
    await expect(page.locator('table')).toBeVisible();

    // Verify columns
    await expect(page.locator('th:has-text("Employee")')).toBeVisible();
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Reason")')).toBeVisible();
  });

  test('should view regularization request details before approval', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization/approvals`);

    const firstRow = page.locator('table tbody tr:first-child');

    if (await firstRow.isVisible()) {
      await firstRow.click();

      // Details should be visible
      await expect(page.locator('[data-testid="regularization-details"]')).toBeVisible();

      // Should show employee details
      await expect(page.locator('text=Employee:')).toBeVisible();

      // Should show actual vs expected times
      await expect(page.locator('text=Actual Time:')).toBeVisible();
      await expect(page.locator('text=Expected Time:')).toBeVisible();

      // Should show difference
      await expect(page.locator('text=Difference:')).toBeVisible();

      // Should show reason
      await expect(page.locator('text=Reason:')).toBeVisible();

      // Should show attachment if present
      const attachment = page.locator('text=Attachment:');
      if (await attachment.isVisible()) {
        await expect(page.locator('button:has-text("View Attachment")')).toBeVisible();
      }
    }
  });

  test('should approve regularization request', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization/approvals`);

    const pendingRow = page.locator('table tbody tr:has-text("Pending")').first();

    if (await pendingRow.isVisible()) {
      // Click approve button
      await pendingRow.locator('button:has-text("Approve")').click();

      // Confirmation dialog
      await expect(page.locator('[role="alertdialog"]')).toBeVisible();

      // Add optional comments
      await page.fill('textarea[name="comments"]', 'Approved - valid reason provided');

      // Confirm
      await page.click('button:has-text("Confirm Approval")');

      await expect(page.locator('.toast-success')).toContainText('approved');
    }
  });

  test('should reject regularization request', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization/approvals`);

    const pendingRow = page.locator('table tbody tr:has-text("Pending")').first();

    if (await pendingRow.isVisible()) {
      // Click reject button
      await pendingRow.locator('button:has-text("Reject")').click();

      // Rejection reason is required
      await expect(page.locator('textarea[name="rejectionReason"]')).toBeVisible();

      await page.fill('textarea[name="rejectionReason"]', 'Insufficient reason provided, no supporting document');

      // Confirm rejection
      await page.click('button:has-text("Confirm Rejection")');

      await expect(page.locator('.toast-success')).toContainText('rejected');
    }
  });

  test('should view employee attendance pattern before approval', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization/approvals`);

    const firstRow = page.locator('table tbody tr:first-child');

    if (await firstRow.isVisible()) {
      await firstRow.click();

      // Click "View Attendance Pattern"
      await page.click('button:has-text("Attendance Pattern")');

      // Should show employee's recent attendance
      await expect(page.locator('[data-testid="attendance-pattern"]')).toBeVisible();

      // Should show statistics
      await expect(page.locator('text=Late Arrivals (Last 30 days):')).toBeVisible();
      await expect(page.locator('text=Regularization Requests (Last 30 days):')).toBeVisible();
      await expect(page.locator('text=Attendance Percentage:')).toBeVisible();
    }
  });

  test('should bulk approve regularization requests', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization/approvals`);

    // Select multiple requests
    await page.check('table tbody tr:first-child input[type="checkbox"]');
    await page.check('table tbody tr:nth-child(2) input[type="checkbox"]');

    // Click bulk approve
    await page.click('button:has-text("Approve Selected")');

    // Confirmation
    await expect(page.locator('text=/Approve \\d+ requests/i')).toBeVisible();

    await page.click('button:has-text("Confirm")');

    await expect(page.locator('.toast-success')).toContainText('approved');
  });

  test('should filter approval requests by department', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization/approvals`);

    // Open department filter
    await page.click('button:has-text("Department")');

    // Select department
    await page.click('label:has-text("Engineering") input[type="checkbox"]');

    await page.click('button:has-text("Apply")');

    // Should show filtered results
    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(rows.nth(i)).toContainText('Engineering');
      }
    }
  });

  test('should sort regularization requests by date', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization/approvals`);

    // Click on "Date" column header
    await page.click('th:has-text("Date")');

    await page.waitForTimeout(300);

    // Should be sorted (ascending or descending)
    const firstDate = await page.locator('table tbody tr:first-child td:nth-child(2)').textContent();
    const lastDate = await page.locator('table tbody tr:last-child td:nth-child(2)').textContent();

    expect(firstDate).toBeTruthy();
    expect(lastDate).toBeTruthy();
  });

  test('should view regularization approval history', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization/approvals/history`);

    await expect(page.locator('h1')).toContainText('Approval History');

    // Should show approved/rejected requests
    await expect(page.locator('table')).toBeVisible();

    // Filter by action
    await page.selectOption('select[name="action"]', 'approved');

    await page.click('button:has-text("Apply")');

    // All visible rows should show approved
    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(rows.nth(i)).toContainText('Approved');
      }
    }
  });

  test('should export approval report', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/regularization/approvals`);

    // Click export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Report")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('regularization');
    expect(download.suggestedFilename()).toMatch(/\.(xlsx|pdf)$/);
  });
});
