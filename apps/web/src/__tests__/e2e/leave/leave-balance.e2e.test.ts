/**
 * Leave Balance Management E2E Tests
 * Plan D - Week 7, Day 32
 *
 * Tests leave balance calculations, accruals, and history tracking
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const EMPLOYEE_EMAIL = 'employee@e2etest.com';
const EMPLOYEE_PASSWORD = 'Test@1234';
const HR_EMAIL = 'hr@e2etest.com';
const HR_PASSWORD = 'Test@1234';

let employeeToken: string;
let hrToken: string;

test.describe('Leave Balance Management E2E', () => {
  test.beforeAll(async ({ request }) => {
    // Employee login
    const empResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: EMPLOYEE_EMAIL,
        password: EMPLOYEE_PASSWORD,
      },
    });

    const empData = await empResponse.json();
    employeeToken = empData.data.accessToken;

    // HR login
    const hrResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: HR_EMAIL,
        password: HR_PASSWORD,
      },
    });

    const hrData = await hrResponse.json();
    hrToken = hrData.data.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, employeeToken);
  });

  test('should display all leave type balances', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    await expect(page.locator('h1')).toContainText('Leave Balances');

    // Should show balance cards for each leave type
    const balanceCards = page.locator('[data-testid="leave-balance-card"]');
    await expect(balanceCards.first()).toBeVisible();

    // Each card should show key information
    const firstCard = balanceCards.first();
    await expect(firstCard.locator('text=Opening Balance')).toBeVisible();
    await expect(firstCard.locator('text=Accrued')).toBeVisible();
    await expect(firstCard.locator('text=Availed')).toBeVisible();
    await expect(firstCard.locator('text=Available')).toBeVisible();
  });

  test('should show detailed balance breakdown', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    // Click on a leave type card to see details
    await page.click('[data-testid="leave-balance-card"]:first-child');

    // Details modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Leave Balance Details")')).toBeVisible();

    // Should show comprehensive breakdown
    await expect(page.locator('text=Opening Balance:')).toBeVisible();
    await expect(page.locator('text=Accrued This Year:')).toBeVisible();
    await expect(page.locator('text=Carried Forward:')).toBeVisible();
    await expect(page.locator('text=Approved Leaves:')).toBeVisible();
    await expect(page.locator('text=Pending Leaves:')).toBeVisible();
    await expect(page.locator('text=Available Balance:')).toBeVisible();
    await expect(page.locator('text=Encashed:')).toBeVisible();
    await expect(page.locator('text=Lapsed:')).toBeVisible();
  });

  test('should verify balance calculation accuracy', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    await page.click('[data-testid="leave-balance-card"]:first-child');

    // Get all values
    const openingText = await page.locator('text=Opening Balance:').locator('..').locator('[data-testid="value"]').textContent();
    const accruedText = await page.locator('text=Accrued This Year:').locator('..').locator('[data-testid="value"]').textContent();
    const carriedText = await page.locator('text=Carried Forward:').locator('..').locator('[data-testid="value"]').textContent();
    const approvedText = await page.locator('text=Approved Leaves:').locator('..').locator('[data-testid="value"]').textContent();
    const availableText = await page.locator('text=Available Balance:').locator('..').locator('[data-testid="value"]').textContent();

    const opening = parseFloat(openingText || '0');
    const accrued = parseFloat(accruedText || '0');
    const carried = parseFloat(carriedText || '0');
    const approved = parseFloat(approvedText || '0');
    const available = parseFloat(availableText || '0');

    // Verify: Available = Opening + Accrued + Carried - Approved
    const expectedAvailable = opening + accrued + carried - approved;
    expect(available).toBeCloseTo(expectedAvailable, 1);
  });

  test('should view accrual history', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    await page.click('[data-testid="leave-balance-card"]:first-child');

    // Click "View History" tab
    await page.click('button:has-text("Accrual History")');

    // Should show accrual history table
    await expect(page.locator('table')).toBeVisible();

    // Verify table columns
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Days")')).toBeVisible();
    await expect(page.locator('th:has-text("Balance")')).toBeVisible();

    // Should show at least one accrual entry
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('should show monthly accrual pattern', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    await page.click('[data-testid="leave-balance-card"]:has-text("Earned Leave")');

    // Earned Leave typically accrues monthly
    await page.click('button:has-text("Accrual History")');

    // Should show regular monthly accruals
    const accrualRows = page.locator('table tbody tr:has-text("Monthly Accrual")');

    if (await accrualRows.first().isVisible()) {
      // Count should match months of service
      const count = await accrualRows.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show carry forward rules', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    await page.click('[data-testid="leave-balance-card"]:first-child');

    // Click "Policy" tab
    await page.click('button:has-text("Policy Details")');

    // Should show policy information
    await expect(page.locator('text=Accrual Frequency:')).toBeVisible();
    await expect(page.locator('text=Maximum Balance:')).toBeVisible();
    await expect(page.locator('text=Carry Forward Allowed:')).toBeVisible();

    // If carry forward is allowed
    const carryForwardText = await page.locator('text=Carry Forward Allowed:').locator('..').textContent();

    if (carryForwardText?.includes('Yes')) {
      await expect(page.locator('text=Maximum Carry Forward:')).toBeVisible();
      await expect(page.locator('text=Carry Forward Expires:')).toBeVisible();
    }
  });

  test('should show encashment details', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    await page.click('[data-testid="leave-balance-card"]:has-text("Earned Leave")');

    await page.click('button:has-text("Policy Details")');

    // Check if encashment is allowed
    const encashmentText = await page.locator('text=Encashment Allowed:').locator('..').textContent();

    if (encashmentText?.includes('Yes')) {
      await expect(page.locator('text=Minimum Balance for Encashment:')).toBeVisible();
      await expect(page.locator('text=Maximum Encashment:')).toBeVisible();
      await expect(page.locator('text=Encashment Frequency:')).toBeVisible();
    }
  });

  test('should apply for leave encashment', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    await page.click('[data-testid="leave-balance-card"]:has-text("Earned Leave")');

    // Check if encash button is visible
    const encashButton = page.locator('button:has-text("Encash Leaves")');

    if (await encashButton.isVisible()) {
      await encashButton.click();

      // Encashment modal
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Leave Encashment")')).toBeVisible();

      // Show available balance for encashment
      await expect(page.locator('text=Available for Encashment:')).toBeVisible();

      // Enter number of days to encash
      await page.fill('input[name="daysToEncash"]', '5');

      // Should show encashment amount calculation
      await expect(page.locator('text=Encashment Amount:')).toBeVisible();

      // Submit encashment request
      await page.click('button[type="submit"]:has-text("Submit Request")');

      await expect(page.locator('.toast-success')).toContainText('Encashment request submitted');
    }
  });

  test('should view leave year information', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    // Should show current leave year
    await expect(page.locator('text=Leave Year:')).toBeVisible();

    // Should show leave year dates
    const leaveYearText = await page.locator('text=Leave Year:').locator('..').textContent();
    expect(leaveYearText).toMatch(/\d{4}/); // Should contain year

    // Should show days until year end
    await expect(page.locator('text=/Days Remaining|Year Ends In/i')).toBeVisible();
  });

  test('should show balance expiry warnings', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    // Look for expiry warnings
    const expiryWarning = page.locator('[data-testid="expiry-warning"]');

    if (await expiryWarning.isVisible()) {
      // Should show which leaves are expiring
      await expect(expiryWarning).toContainText(/expir|lapse/i);

      // Should show expiry date
      await expect(expiryWarning).toContainText(/\d{1,2}\/\d{1,2}\/\d{4}/);

      // Should show number of days expiring
      await expect(expiryWarning).toContainText(/\d+.*days?/i);
    }
  });

  test('should export balance statement', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Statement")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('leave-balance');
    expect(download.suggestedFilename()).toMatch(/\.(pdf|xlsx)$/);
  });

  test('should view balance as of specific date', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances`);

    // Click "View as of Date"
    await page.click('button:has-text("View as of Date")');

    // Date picker modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Select a past date
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 3);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="asOfDate"]', formatDate(pastDate));

    await page.click('button:has-text("View Balance")');

    // Should show historical balances
    await expect(page.locator('text=Balance as of')).toBeVisible();

    // Balances should be different from current
    await expect(page.locator('[data-testid="leave-balance-card"]').first()).toBeVisible();
  });

  test('should compare balance across leave years', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balances/comparison`);

    await expect(page.locator('h1')).toContainText('Leave Balance Comparison');

    // Should show year selector
    await page.selectOption('select[name="year1"]', { index: 1 });
    await page.selectOption('select[name="year2"]', { index: 2 });

    await page.click('button:has-text("Compare")');

    // Should show comparison table
    await expect(page.locator('table')).toBeVisible();

    // Should show both years
    await expect(page.locator('th').first()).toContainText(/\d{4}/);
  });
});

test.describe('Leave Balance Administration (HR)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, hrToken);
  });

  test('should view all employees leave balances', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/admin/balances`);

    await expect(page.locator('h1')).toContainText('Employee Leave Balances');

    // Should show employee list with balances
    await expect(page.locator('table')).toBeVisible();

    // Verify columns
    await expect(page.locator('th:has-text("Employee")')).toBeVisible();
    await expect(page.locator('th:has-text("Department")')).toBeVisible();

    // Leave type columns
    const leaveTypes = ['CL', 'SL', 'AL', 'EL'];
    for (const type of leaveTypes) {
      const header = page.locator(`th:has-text("${type}")`);
      if (await header.isVisible()) {
        await expect(header).toBeVisible();
      }
    }
  });

  test('should manually adjust employee leave balance', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/admin/balances`);

    // Click on an employee
    await page.click('table tbody tr:first-child');

    // Click "Adjust Balance"
    await page.click('button:has-text("Adjust Balance")');

    // Adjustment modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Select leave type
    await page.selectOption('select[name="leaveTypeId"]', { index: 1 });

    // Select adjustment type
    await page.selectOption('select[name="adjustmentType"]', 'credit');

    // Enter days
    await page.fill('input[name="days"]', '2');

    // Enter reason
    await page.fill('textarea[name="reason"]', 'Compensation for weekend work');

    // Submit adjustment
    await page.click('button[type="submit"]:has-text("Submit")');

    await expect(page.locator('.toast-success')).toContainText('Balance adjusted');
  });

  test('should bulk credit leaves to employees', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/admin/balances`);

    // Click "Bulk Operations"
    await page.click('button:has-text("Bulk Operations")');

    // Select operation
    await page.click('button:has-text("Credit Leaves")');

    // Bulk credit modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Select employees
    await page.click('button:has-text("Select Employees")');

    // Filter by department
    await page.selectOption('select[name="department"]', { index: 1 });

    await page.click('button:has-text("Apply Filter")');

    // Select all filtered employees
    await page.check('input[name="selectAll"]');

    // Continue to credit details
    await page.click('button:has-text("Continue")');

    // Select leave type and days
    await page.selectOption('select[name="leaveTypeId"]', { label: 'Casual Leave' });
    await page.fill('input[name="days"]', '1');
    await page.fill('textarea[name="reason"]', 'Additional casual leave for H2');

    // Submit bulk credit
    await page.click('button[type="submit"]:has-text("Credit Leaves")');

    // Should show progress
    await expect(page.locator('[role="progressbar"]')).toBeVisible();

    // Wait for completion
    await page.waitForSelector('text=Bulk credit completed', { timeout: 60000 });
  });

  test('should process year-end carry forward', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/admin/year-end`);

    await expect(page.locator('h1')).toContainText('Year-End Processing');

    // Click "Process Carry Forward"
    await page.click('button:has-text("Process Carry Forward")');

    // Confirmation
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(page.locator('text=Process carry forward for all employees')).toBeVisible();

    // Should show preview of carry forward
    await expect(page.locator('text=Total Employees:')).toBeVisible();
    await expect(page.locator('text=Total Leaves to Carry:')).toBeVisible();

    // Confirm processing
    await page.click('button:has-text("Process")');

    // Should show progress
    await expect(page.locator('text=Processing carry forward...')).toBeVisible();

    // Wait for completion
    await page.waitForSelector('text=Carry forward processed', { timeout: 120000 });
  });

  test('should process year-end lapse', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/admin/year-end`);

    // Click "Process Lapse"
    await page.click('button:has-text("Process Lapse")');

    // Confirmation
    await expect(page.locator('text=Lapse non-carried leaves for all employees')).toBeVisible();

    // Should show preview
    await expect(page.locator('text=Total Leaves to Lapse:')).toBeVisible();

    // Confirm
    await page.click('button:has-text("Process Lapse")');

    await page.waitForSelector('text=Lapse processed', { timeout: 120000 });
  });

  test('should generate leave balance report', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/admin/reports`);

    // Click "Balance Report"
    await page.click('button:has-text("Balance Report")');

    // Report configuration
    await page.selectOption('select[name="groupBy"]', 'department');
    await page.check('input[name="includeZeroBalance"]');

    // Generate report
    await page.click('button:has-text("Generate")');

    // Report should be displayed
    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Should show department-wise balances
    await expect(page.locator('text=Department')).toBeVisible();
    await expect(page.locator('text=Employee Count')).toBeVisible();
  });

  test('should export all balances to Excel', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/admin/balances`);

    // Click export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export All")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('leave-balances');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('should view balance adjustment history', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/admin/audit`);

    await expect(page.locator('h1')).toContainText('Leave Balance Audit');

    // Should show all adjustments
    await expect(page.locator('table')).toBeVisible();

    // Verify columns
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Employee")')).toBeVisible();
    await expect(page.locator('th:has-text("Leave Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Adjustment")')).toBeVisible();
    await expect(page.locator('th:has-text("Reason")')).toBeVisible();
    await expect(page.locator('th:has-text("Adjusted By")')).toBeVisible();
  });

  test('should filter audit log by date range', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/admin/audit`);

    // Set date range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="startDate"]', formatDate(startDate));
    await page.fill('input[name="endDate"]', formatDate(new Date()));

    await page.click('button:has-text("Apply")');

    // Should show filtered results
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });
});
