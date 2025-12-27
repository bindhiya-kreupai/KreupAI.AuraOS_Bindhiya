/**
 * Overtime Management E2E Tests
 * Plan D - Week 7, Day 33
 *
 * Tests overtime logging, approval workflow, calculation, and compensation
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const EMPLOYEE_EMAIL = 'employee@e2etest.com';
const EMPLOYEE_PASSWORD = 'Test@1234';
const MANAGER_EMAIL = 'manager@e2etest.com';
const MANAGER_PASSWORD = 'Test@1234';
const HR_EMAIL = 'hr@e2etest.com';
const HR_PASSWORD = 'Test@1234';

let employeeToken: string;
let managerToken: string;
let hrToken: string;
let overtimeId: number;

test.describe('Overtime Management E2E', () => {
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

    // Manager login
    const mgrResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: MANAGER_EMAIL,
        password: MANAGER_PASSWORD,
      },
    });

    const mgrData = await mgrResponse.json();
    managerToken = mgrData.data.accessToken;

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

  test.describe('Overtime Logging (Employee)', () => {
    test('should log overtime hours', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      // Click Log Overtime button
      await page.click('button:has-text("Log Overtime")');

      // Overtime form should open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Log Overtime")')).toBeVisible();

      // Fill overtime details
      await page.fill('input[name="date"]', '2024-01-15');
      await page.fill('input[name="startTime"]', '18:00');
      await page.fill('input[name="endTime"]', '21:00');

      // Total hours should auto-calculate
      await expect(page.locator('input[name="totalHours"]')).toHaveValue('3');

      // Select overtime type
      await page.selectOption('select[name="overtimeType"]', 'weekday');

      // Add reason/task
      await page.fill('textarea[name="reason"]', 'Critical production deployment - server migration');

      // Submit
      await page.click('button[type="submit"]:has-text("Submit")');

      await expect(page.locator('.toast-success')).toContainText('Overtime logged successfully');

      // Should appear in overtime list
      await expect(page.locator('table tbody tr:has-text("2024-01-15")')).toBeVisible();
    });

    test('should log weekend overtime with higher multiplier', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      await page.click('button:has-text("Log Overtime")');

      await page.fill('input[name="date"]', '2024-01-20'); // Saturday
      await page.fill('input[name="startTime"]', '10:00');
      await page.fill('input[name="endTime"]', '16:00');

      // Select weekend overtime
      await page.selectOption('select[name="overtimeType"]', 'weekend');

      // Should show higher multiplier (e.g., 2x)
      await expect(page.locator('text=/Multiplier:.*2\\.0x/')).toBeVisible();

      await page.fill('textarea[name="reason"]', 'Weekend maintenance work');

      await page.click('button[type="submit"]:has-text("Submit")');

      await expect(page.locator('.toast-success')).toContainText('Overtime logged');
    });

    test('should log holiday overtime with highest multiplier', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      await page.click('button:has-text("Log Overtime")');

      await page.fill('input[name="date"]', '2024-01-26'); // Republic Day
      await page.fill('input[name="startTime"]', '09:00');
      await page.fill('input[name="endTime"]', '17:00');

      // Select holiday overtime
      await page.selectOption('select[name="overtimeType"]', 'holiday');

      // Should show highest multiplier (e.g., 3x)
      await expect(page.locator('text=/Multiplier:.*3\\.0x/')).toBeVisible();

      await page.fill('textarea[name="reason"]', 'Emergency customer support during holiday');

      await page.click('button[type="submit"]:has-text("Submit")');

      await expect(page.locator('.toast-success')).toContainText('Overtime logged');
    });

    test('should validate overtime hours', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      await page.click('button:has-text("Log Overtime")');

      // Try to log more than maximum allowed hours (e.g., 12 hours)
      await page.fill('input[name="date"]', '2024-01-15');
      await page.fill('input[name="startTime"]', '18:00');
      await page.fill('input[name="endTime"]', '08:00'); // Next day, 14 hours

      await page.fill('textarea[name="reason"]', 'Extended work');

      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('text=/Overtime cannot exceed.*hours/')).toBeVisible();
    });

    test('should prevent overlapping overtime entries', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      await page.click('button:has-text("Log Overtime")');

      // Log first overtime
      await page.fill('input[name="date"]', '2024-01-15');
      await page.fill('input[name="startTime"]', '18:00');
      await page.fill('input[name="endTime"]', '20:00');
      await page.fill('textarea[name="reason"]', 'Task 1');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(500);

      // Try to log overlapping overtime
      await page.click('button:has-text("Log Overtime")');
      await page.fill('input[name="date"]', '2024-01-15');
      await page.fill('input[name="startTime"]', '19:00');
      await page.fill('input[name="endTime"]', '21:00');
      await page.fill('textarea[name="reason"]', 'Task 2');
      await page.click('button[type="submit"]');

      // Should show overlap error
      await expect(page.locator('text=/Overlapping overtime entry/')).toBeVisible();
    });

    test('should view overtime history', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      // Should show overtime entries table
      await expect(page.locator('table thead th:has-text("Date")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Hours")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Type")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Status")')).toBeVisible();

      // Should show entries
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should filter overtime by status', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      // Apply pending filter
      await page.selectOption('select[name="status"]', 'pending');

      await page.waitForTimeout(500);

      // All visible entries should be pending
      const rows = page.locator('table tbody tr');
      const count = await rows.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i)).toContainText('Pending');
      }
    });

    test('should filter overtime by date range', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      // Set date range filter
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');

      await page.click('button:has-text("Apply")');

      await page.waitForTimeout(500);

      // Should show filtered results
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should edit pending overtime entry', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      // Find a pending entry
      const pendingRow = page.locator('table tbody tr:has-text("Pending"):first-child');
      await pendingRow.locator('button[aria-label="Edit"]').click();

      // Edit form should open
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Update hours
      await page.fill('input[name="endTime"]', '22:00');

      await page.click('button:has-text("Save Changes")');

      await expect(page.locator('.toast-success')).toContainText('Overtime updated');
    });

    test('should delete pending overtime entry', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      const pendingRow = page.locator('table tbody tr:has-text("Pending"):first-child');
      await pendingRow.locator('button[aria-label="Delete"]').click();

      // Confirmation dialog
      await expect(page.locator('[role="alertdialog"]')).toBeVisible();
      await page.click('button:has-text("Delete")');

      await expect(page.locator('.toast-success')).toContainText('Overtime deleted');
    });

    test('should not edit approved overtime', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      // Find an approved entry
      const approvedRow = page.locator('table tbody tr:has-text("Approved"):first-child');

      // Edit button should be disabled or not visible
      const editButton = approvedRow.locator('button[aria-label="Edit"]');
      await expect(editButton).toBeDisabled();
    });

    test('should view overtime summary card', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      // Summary cards should be visible
      await expect(page.locator('[data-testid="overtime-summary"]')).toBeVisible();

      // Should show total hours
      await expect(page.locator('text=Total Overtime Hours')).toBeVisible();

      // Should show pending hours
      await expect(page.locator('text=Pending Approval')).toBeVisible();

      // Should show approved hours
      await expect(page.locator('text=Approved Hours')).toBeVisible();
    });
  });

  test.describe('Overtime Approval (Manager)', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);
    });

    test('should view team overtime requests', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/overtime-approvals`);

      // Should see pending requests
      await expect(page.locator('h1:has-text("Overtime Approvals")')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      // Should show request details
      await expect(page.locator('table thead th:has-text("Employee")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Date")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Hours")')).toBeVisible();
    });

    test('should approve overtime request', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/overtime-approvals`);

      // Click approve on first pending request
      const firstRequest = page.locator('table tbody tr:has-text("Pending"):first-child');
      await firstRequest.locator('button:has-text("Approve")').click();

      // Confirmation dialog
      await expect(page.locator('[role="alertdialog"]')).toBeVisible();

      // Optionally add comments
      await page.fill('textarea[name="comments"]', 'Approved - valid business requirement');

      await page.click('button:has-text("Approve")');

      await expect(page.locator('.toast-success')).toContainText('Overtime approved');
    });

    test('should reject overtime request', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/overtime-approvals`);

      const firstRequest = page.locator('table tbody tr:has-text("Pending"):first-child');
      await firstRequest.locator('button:has-text("Reject")').click();

      // Rejection reason required
      await expect(page.locator('textarea[name="rejectionReason"]')).toBeVisible();

      await page.fill('textarea[name="rejectionReason"]', 'Not pre-approved. Please get approval before working overtime.');

      await page.click('button:has-text("Reject")');

      await expect(page.locator('.toast-success')).toContainText('Overtime rejected');
    });

    test('should bulk approve overtime requests', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/overtime-approvals`);

      // Select multiple requests
      await page.check('table tbody tr:nth-child(1) input[type="checkbox"]');
      await page.check('table tbody tr:nth-child(2) input[type="checkbox"]');

      // Bulk approve button should be enabled
      await page.click('button:has-text("Approve Selected")');

      await page.fill('textarea[name="comments"]', 'Bulk approval for month-end activities');

      await page.click('button:has-text("Approve")');

      await expect(page.locator('.toast-success')).toContainText(/approved.*requests/);
    });

    test('should view overtime request details', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/overtime-approvals`);

      // Click on a request to view details
      await page.click('table tbody tr:first-child button:has-text("View")');

      // Details modal should open
      await expect(page.locator('[data-testid="overtime-details"]')).toBeVisible();

      // Should show all details
      await expect(page.locator('text=Employee Information')).toBeVisible();
      await expect(page.locator('text=Overtime Details')).toBeVisible();
      await expect(page.locator('text=Reason/Task')).toBeVisible();
      await expect(page.locator('text=Calculation')).toBeVisible();
    });

    test('should filter overtime requests by employee', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/overtime-approvals`);

      // Search for specific employee
      await page.fill('input[placeholder*="Search employee"]', 'John');

      await page.waitForTimeout(500);

      // All visible rows should contain "John"
      const firstRow = page.locator('table tbody tr:first-child');
      await expect(firstRow).toContainText('John');
    });

    test('should view team overtime analytics', async ({ page }) => {
      await page.goto(`${BASE_URL}/team/overtime-analytics`);

      // Analytics dashboard
      await expect(page.locator('[data-testid="overtime-analytics"]')).toBeVisible();

      // Should show charts
      await expect(page.locator('text=Overtime Trends')).toBeVisible();
      await expect(page.locator('text=Employee-wise Breakdown')).toBeVisible();

      // Should show metrics
      await expect(page.locator('text=Total Team Overtime')).toBeVisible();
      await expect(page.locator('text=Average Hours per Employee')).toBeVisible();
    });
  });

  test.describe('Overtime Calculation & Compensation (HR)', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should configure overtime policy', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings/overtime-policy`);

      // Overtime policy settings
      await expect(page.locator('h1:has-text("Overtime Policy")')).toBeVisible();

      // Multipliers for different overtime types
      await page.fill('input[name="weekdayMultiplier"]', '1.5');
      await page.fill('input[name="weekendMultiplier"]', '2.0');
      await page.fill('input[name="holidayMultiplier"]', '3.0');

      // Maximum hours per day
      await page.fill('input[name="maxOvertimePerDay"]', '4');

      // Maximum hours per month
      await page.fill('input[name="maxOvertimePerMonth"]', '40');

      // Compensation type
      await page.check('input[value="monetary"]');

      // Save policy
      await page.click('button:has-text("Save Policy")');

      await expect(page.locator('.toast-success')).toContainText('Policy updated');
    });

    test('should calculate overtime pay', async ({ page }) => {
      await page.goto(`${BASE_URL}/payroll/overtime-calculation`);

      // Select month for calculation
      await page.selectOption('select[name="month"]', '01');
      await page.selectOption('select[name="year"]', '2024');

      // Calculate button
      await page.click('button:has-text("Calculate Overtime Pay")');

      // Should show calculation results
      await expect(page.locator('[data-testid="overtime-calculations"]')).toBeVisible();

      // Should show employee-wise breakdown
      await expect(page.locator('table tbody tr').first()).toBeVisible();

      // Columns
      await expect(page.locator('table thead th:has-text("Employee")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Total Hours")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Overtime Pay")')).toBeVisible();
    });

    test('should verify overtime calculation formula', async ({ page }) => {
      await page.goto(`${BASE_URL}/payroll/overtime-calculation`);

      await page.selectOption('select[name="month"]', '01');
      await page.selectOption('select[name="year"]', '2024');
      await page.click('button:has-text("Calculate Overtime Pay")');

      // Click on first employee to see calculation breakdown
      await page.click('table tbody tr:first-child button:has-text("View Details")');

      // Should show formula breakdown
      await expect(page.locator('text=Calculation Formula')).toBeVisible();
      await expect(page.locator('text=Base Hourly Rate')).toBeVisible();
      await expect(page.locator('text=Weekday Hours × 1.5')).toBeVisible();
      await expect(page.locator('text=Weekend Hours × 2.0')).toBeVisible();
      await expect(page.locator('text=Holiday Hours × 3.0')).toBeVisible();
      await expect(page.locator('text=Total Overtime Pay')).toBeVisible();
    });

    test('should generate overtime compensation report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/payroll/overtime`);

      // Select report period
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');

      // Generate report
      await page.click('button:has-text("Generate Report")');

      // Report should load
      await expect(page.locator('[data-testid="overtime-report"]')).toBeVisible();

      // Should show summary statistics
      await expect(page.locator('text=Total Overtime Hours')).toBeVisible();
      await expect(page.locator('text=Total Overtime Cost')).toBeVisible();
      await expect(page.locator('text=Department-wise Breakdown')).toBeVisible();
    });

    test('should export overtime data to Excel', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/payroll/overtime`);

      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');
      await page.click('button:has-text("Generate Report")');

      await page.waitForTimeout(1000);

      // Export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export to Excel")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('overtime');
      expect(download.suggestedFilename()).toContain('.xlsx');
    });

    test('should configure comp-off policy as alternative', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings/overtime-policy`);

      // Select comp-off as compensation
      await page.check('input[value="comp_off"]');

      // Comp-off accrual ratio
      await page.fill('input[name="compOffRatio"]', '1.0'); // 1 hour OT = 1 hour comp-off

      // Validity period
      await page.fill('input[name="compOffValidityDays"]', '90');

      await page.click('button:has-text("Save Policy")');

      await expect(page.locator('.toast-success')).toContainText('Policy updated');
    });

    test('should process comp-off accrual', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/comp-off-accrual`);

      // Select month to process
      await page.selectOption('select[name="month"]', '01');
      await page.selectOption('select[name="year"]', '2024');

      // Process accrual
      await page.click('button:has-text("Process Accrual")');

      // Should show progress
      await expect(page.locator('text=Processing comp-off accrual...')).toBeVisible();

      await page.waitForSelector('text=Accrual processed successfully', { timeout: 30000 });

      await expect(page.locator('.toast-success')).toContainText('processed');
    });

    test('should view overtime budget vs actual', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/overtime/budget-analysis`);

      // Select department
      await page.selectOption('select[name="departmentId"]', { label: 'Engineering' });

      // Select period
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');

      await page.click('button:has-text("Generate Analysis")');

      // Should show budget comparison
      await expect(page.locator('text=Budgeted Hours')).toBeVisible();
      await expect(page.locator('text=Actual Hours')).toBeVisible();
      await expect(page.locator('text=Variance')).toBeVisible();

      // Should show chart
      await expect(page.locator('[data-testid="budget-chart"]')).toBeVisible();
    });

    test('should send overtime alert for exceeding limits', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings/overtime-alerts`);

      // Configure alert threshold
      await page.fill('input[name="monthlyThreshold"]', '30');

      // Alert recipients
      await page.fill('input[name="alertEmails"]', 'hr@company.com,manager@company.com');

      await page.click('button:has-text("Save Alert Settings")');

      await expect(page.locator('.toast-success')).toContainText('Alert settings saved');
    });
  });

  test.describe('Overtime Reports & Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, hrToken);
    });

    test('should generate monthly overtime summary', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/attendance/overtime-summary`);

      await page.selectOption('select[name="month"]', '01');
      await page.selectOption('select[name="year"]', '2024');

      await page.click('button:has-text("Generate Report")');

      // Summary cards
      await expect(page.locator('text=Total Employees with Overtime')).toBeVisible();
      await expect(page.locator('text=Total Overtime Hours')).toBeVisible();
      await expect(page.locator('text=Average Hours per Employee')).toBeVisible();
    });

    test('should view department-wise overtime breakdown', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/attendance/overtime-summary`);

      await page.selectOption('select[name="month"]', '01');
      await page.selectOption('select[name="year"]', '2024');
      await page.click('button:has-text("Generate Report")');

      // Department breakdown should be visible
      await expect(page.locator('[data-testid="department-breakdown"]')).toBeVisible();

      // Should show chart
      await expect(page.locator('[data-testid="department-chart"]')).toBeVisible();
    });

    test('should view overtime trends over time', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/attendance/overtime-trends`);

      // Select time range
      await page.selectOption('select[name="period"]', 'last_6_months');

      await page.click('button:has-text("View Trends")');

      // Trend chart should load
      await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();

      // Should show month-over-month data
      await expect(page.locator('text=Month-over-Month Comparison')).toBeVisible();
    });

    test('should identify employees with excessive overtime', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/attendance/overtime-alerts`);

      await page.selectOption('select[name="month"]', '01');
      await page.selectOption('select[name="year"]', '2024');

      // Set threshold
      await page.fill('input[name="hoursThreshold"]', '30');

      await page.click('button:has-text("Find Employees")');

      // Should show list of employees exceeding threshold
      await expect(page.locator('[data-testid="high-overtime-employees"]')).toBeVisible();

      // Should show employee details
      await expect(page.locator('table thead th:has-text("Employee")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Total Hours")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Alert Level")')).toBeVisible();
    });

    test('should schedule automated overtime reports', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings/scheduled-reports`);

      // Create new scheduled report
      await page.click('button:has-text("Add Scheduled Report")');

      // Select overtime report
      await page.selectOption('select[name="reportType"]', 'overtime_summary');

      // Frequency
      await page.selectOption('select[name="frequency"]', 'monthly');

      // Recipients
      await page.fill('textarea[name="recipients"]', 'hr@company.com\nmanager@company.com');

      await page.click('button:has-text("Schedule Report")');

      await expect(page.locator('.toast-success')).toContainText('Report scheduled');
    });
  });

  test.describe('Employee Overtime Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);
    });

    test('should view personal overtime dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime/dashboard`);

      // Dashboard should show overview
      await expect(page.locator('[data-testid="overtime-dashboard"]')).toBeVisible();

      // Summary cards
      await expect(page.locator('text=This Month')).toBeVisible();
      await expect(page.locator('text=Pending Approval')).toBeVisible();
      await expect(page.locator('text=Year to Date')).toBeVisible();
    });

    test('should view monthly overtime breakdown', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime/dashboard`);

      // Select month
      await page.selectOption('select[name="month"]', '01');

      // Breakdown should update
      await expect(page.locator('[data-testid="monthly-breakdown"]')).toBeVisible();

      // Should show weekday/weekend/holiday split
      await expect(page.locator('text=Weekday OT')).toBeVisible();
      await expect(page.locator('text=Weekend OT')).toBeVisible();
      await expect(page.locator('text=Holiday OT')).toBeVisible();
    });

    test('should download personal overtime report', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/overtime`);

      // Export personal overtime data
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Download Report")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('overtime');
      expect(download.suggestedFilename()).toMatch(/\.(pdf|xlsx)$/);
    });
  });
});
