/**
 * Shift Management E2E Tests
 * Plan D - Week 7, Day 33
 *
 * Tests shift schedule creation, assignment, roster generation, and management
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const HR_EMAIL = 'hr@e2etest.com';
const HR_PASSWORD = 'Test@1234';
const EMPLOYEE_EMAIL = 'employee@e2etest.com';
const EMPLOYEE_PASSWORD = 'Test@1234';
const MANAGER_EMAIL = 'manager@e2etest.com';
const MANAGER_PASSWORD = 'Test@1234';

let hrToken: string;
let employeeToken: string;
let managerToken: string;
let shiftId: number;
let rosterId: number;

test.describe('Shift Management E2E', () => {
  test.beforeAll(async ({ request }) => {
    // HR login
    const hrResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: HR_EMAIL,
        password: HR_PASSWORD,
      },
    });

    const hrData = await hrResponse.json();
    hrToken = hrData.data.accessToken;

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
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, hrToken);
  });

  test.describe('Shift Schedule Creation (HR)', () => {
    test('should create new shift schedule', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      // Click Create Shift button
      await page.click('button:has-text("Create Shift")');

      // Shift creation form should open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Create Shift Schedule")')).toBeVisible();

      // Fill shift details
      await page.fill('input[name="shiftName"]', 'General Shift');
      await page.fill('input[name="shiftCode"]', 'GEN-SHIFT-001');

      // Set timing
      await page.fill('input[name="startTime"]', '09:00');
      await page.fill('input[name="endTime"]', '18:00');

      // Set grace period
      await page.fill('input[name="graceTimeIn"]', '15');
      await page.fill('input[name="graceTimeOut"]', '15');

      // Set break time
      await page.fill('input[name="breakDuration"]', '60');

      // Working days
      await page.check('input[value="monday"]');
      await page.check('input[value="tuesday"]');
      await page.check('input[value="wednesday"]');
      await page.check('input[value="thursday"]');
      await page.check('input[value="friday"]');

      // Submit
      await page.click('button[type="submit"]:has-text("Create")');

      await expect(page.locator('.toast-success')).toContainText('Shift created successfully');

      // Verify shift appears in list
      await expect(page.locator('table tbody tr:has-text("General Shift")')).toBeVisible();
    });

    test('should create night shift with next-day end time', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      await page.click('button:has-text("Create Shift")');

      await page.fill('input[name="shiftName"]', 'Night Shift');
      await page.fill('input[name="shiftCode"]', 'NIGHT-001');
      await page.fill('input[name="startTime"]', '22:00');
      await page.fill('input[name="endTime"]', '06:00');

      // Check "Ends next day"
      await page.check('input[name="endsNextDay"]');

      await page.fill('input[name="graceTimeIn"]', '30');
      await page.fill('input[name="graceTimeOut"]', '30');

      await page.click('button[type="submit"]:has-text("Create")');

      await expect(page.locator('.toast-success')).toContainText('Shift created');
    });

    test('should create flexible shift', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      await page.click('button:has-text("Create Shift")');

      await page.fill('input[name="shiftName"]', 'Flexible Shift');
      await page.fill('input[name="shiftCode"]', 'FLEX-001');

      // Select flexible shift type
      await page.check('input[name="isFlexible"]');

      // Core hours
      await page.fill('input[name="coreHoursStart"]', '10:00');
      await page.fill('input[name="coreHoursEnd"]', '16:00');

      // Required hours per day
      await page.fill('input[name="requiredHours"]', '8');

      await page.click('button[type="submit"]:has-text("Create")');

      await expect(page.locator('.toast-success')).toContainText('Shift created');
    });

    test('should validate shift timing conflicts', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      await page.click('button:has-text("Create Shift")');

      await page.fill('input[name="shiftName"]', 'Invalid Shift');
      await page.fill('input[name="startTime"]', '18:00');
      await page.fill('input[name="endTime"]', '09:00');

      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('text=/End time must be after start time/')).toBeVisible();
    });

    test('should view shift schedule details', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      // Click on first shift to view details
      await page.click('table tbody tr:first-child button:has-text("View")');

      // Details panel/modal should open
      await expect(page.locator('[data-testid="shift-details"]')).toBeVisible();

      // Verify details sections
      await expect(page.locator('text=Shift Information')).toBeVisible();
      await expect(page.locator('text=Timing')).toBeVisible();
      await expect(page.locator('text=Working Days')).toBeVisible();
      await expect(page.locator('text=Assigned Employees')).toBeVisible();
    });

    test('should edit shift schedule', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      // Click edit on first shift
      await page.click('table tbody tr:first-child button[aria-label="Edit"]');

      // Update shift name
      await page.fill('input[name="shiftName"]', 'General Shift - Updated');

      // Update timing
      await page.fill('input[name="startTime"]', '09:30');

      await page.click('button:has-text("Save Changes")');

      await expect(page.locator('.toast-success')).toContainText('Shift updated');

      // Verify updated values
      await expect(page.locator('text=General Shift - Updated')).toBeVisible();
    });

    test('should delete shift schedule', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      // Create a shift to delete
      await page.click('button:has-text("Create Shift")');
      await page.fill('input[name="shiftName"]', 'To Delete Shift');
      await page.fill('input[name="shiftCode"]', 'DEL-001');
      await page.fill('input[name="startTime"]', '10:00');
      await page.fill('input[name="endTime"]', '19:00');
      await page.click('button[type="submit"]:has-text("Create")');

      await page.waitForTimeout(500);

      // Find and delete the shift
      const row = page.locator('table tbody tr:has-text("To Delete Shift")');
      await row.locator('button[aria-label="Delete"]').click();

      // Confirmation dialog
      await expect(page.locator('[role="alertdialog"]')).toBeVisible();
      await expect(page.locator('text=Delete shift schedule')).toBeVisible();

      await page.click('button:has-text("Delete")');

      await expect(page.locator('.toast-success')).toContainText('Shift deleted');

      // Verify shift is removed from list
      await expect(page.locator('table tbody tr:has-text("To Delete Shift")')).not.toBeVisible();
    });

    test('should prevent deleting shift with active assignments', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      // Try to delete shift with assignments
      const firstRow = page.locator('table tbody tr:first-child');
      await firstRow.locator('button[aria-label="Delete"]').click();

      await page.click('button:has-text("Delete")');

      // Should show error
      await expect(page.locator('.toast-error')).toContainText(/Cannot delete shift with active assignments/);
    });
  });

  test.describe('Shift Assignment (HR)', () => {
    test('should assign shift to employee', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      // Click on first shift
      await page.click('table tbody tr:first-child');

      // Go to assignment tab
      await page.click('button:has-text("Assign Employees")');

      // Click assign button
      await page.click('button:has-text("Assign Shift")');

      // Employee selection dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Search and select employee
      await page.fill('input[placeholder*="Search employees"]', 'John');
      await page.waitForTimeout(500);

      await page.check('table tbody tr:first-child input[type="checkbox"]');

      // Set effective date
      await page.fill('input[name="effectiveFrom"]', '2024-01-01');

      // Submit assignment
      await page.click('button:has-text("Assign")');

      await expect(page.locator('.toast-success')).toContainText('Shift assigned successfully');
    });

    test('should assign shift to department', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      await page.click('table tbody tr:first-child');
      await page.click('button:has-text("Assign Employees")');
      await page.click('button:has-text("Assign Shift")');

      // Switch to department tab
      await page.click('button:has-text("By Department")');

      // Select department
      await page.click('label:has-text("Engineering") input[type="checkbox"]');

      await page.fill('input[name="effectiveFrom"]', '2024-01-01');

      await page.click('button:has-text("Assign")');

      await expect(page.locator('.toast-success')).toContainText(/assigned to.*employees/);
    });

    test('should view shift assignments', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      await page.click('table tbody tr:first-child');

      // Should see assigned employees list
      await expect(page.locator('[data-testid="assigned-employees"]')).toBeVisible();

      // Should show employee details
      await expect(page.locator('table thead th:has-text("Employee Name")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Department")')).toBeVisible();
      await expect(page.locator('table thead th:has-text("Effective From")')).toBeVisible();
    });

    test('should remove shift assignment', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      await page.click('table tbody tr:first-child');

      // Find assigned employee and remove
      const assignmentRow = page.locator('[data-testid="assigned-employees"] table tbody tr:first-child');
      await assignmentRow.locator('button:has-text("Remove")').click();

      // Confirmation
      await page.click('button:has-text("Confirm")');

      await expect(page.locator('.toast-success')).toContainText('Assignment removed');
    });

    test('should bulk assign shift to multiple employees', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/shifts`);

      await page.click('table tbody tr:first-child');
      await page.click('button:has-text("Assign Employees")');
      await page.click('button:has-text("Assign Shift")');

      // Select multiple employees
      await page.check('table thead input[type="checkbox"]'); // Select all

      await page.fill('input[name="effectiveFrom"]', '2024-02-01');

      await page.click('button:has-text("Assign")');

      await expect(page.locator('.toast-success')).toContainText(/assigned to.*employees/);
    });
  });

  test.describe('Roster Generation (HR)', () => {
    test('should generate monthly roster', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/roster`);

      // Click Generate Roster
      await page.click('button:has-text("Generate Roster")');

      // Roster generation form
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Select month and year
      await page.selectOption('select[name="month"]', '01');
      await page.selectOption('select[name="year"]', '2024');

      // Select department
      await page.selectOption('select[name="departmentId"]', { label: 'Engineering' });

      // Submit
      await page.click('button:has-text("Generate")');

      // Should show progress
      await expect(page.locator('text=Generating roster...')).toBeVisible();

      // Wait for completion
      await page.waitForSelector('text=Roster generated successfully', { timeout: 30000 });

      await expect(page.locator('.toast-success')).toContainText('Roster generated');
    });

    test('should view roster calendar view', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/roster`);

      // Calendar should be visible
      await expect(page.locator('[data-testid="roster-calendar"]')).toBeVisible();

      // Should show month/year selector
      await expect(page.locator('select[name="month"]')).toBeVisible();
      await expect(page.locator('select[name="year"]')).toBeVisible();

      // Should show calendar grid
      await expect(page.locator('.calendar-grid')).toBeVisible();

      // Should show employee names
      await expect(page.locator('table thead th').first()).toContainText('Employee');
    });

    test('should filter roster by department', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/roster`);

      // Apply department filter
      await page.selectOption('select[name="department"]', { label: 'Engineering' });

      await page.waitForTimeout(500);

      // All rows should be from Engineering
      const rows = page.locator('table tbody tr');
      const count = await rows.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const rowData = await rows.nth(i).getAttribute('data-department');
        expect(rowData).toBe('Engineering');
      }
    });

    test('should manually edit roster entry', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/roster`);

      // Click on a roster cell
      await page.click('.roster-cell:first-of-type');

      // Edit dialog should open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Edit Roster Entry")')).toBeVisible();

      // Change shift
      await page.selectOption('select[name="shiftId"]', { index: 1 });

      // Save changes
      await page.click('button:has-text("Save")');

      await expect(page.locator('.toast-success')).toContainText('Roster updated');
    });

    test('should mark roster entry as weekly off', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/roster`);

      await page.click('.roster-cell:first-of-type');

      // Mark as weekly off
      await page.check('input[name="isWeeklyOff"]');

      await page.click('button:has-text("Save")');

      await expect(page.locator('.toast-success')).toContainText('Roster updated');

      // Cell should show WO indicator
      await expect(page.locator('.roster-cell:first-of-type')).toContainText('WO');
    });

    test('should copy roster from previous month', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/roster`);

      await page.click('button:has-text("Copy from Previous Month")');

      // Confirmation dialog
      await expect(page.locator('text=Copy roster from previous month')).toBeVisible();

      await page.click('button:has-text("Copy")');

      await expect(page.locator('.toast-success')).toContainText('Roster copied');
    });

    test('should export roster to Excel', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/roster`);

      // Click export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export to Excel")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('roster');
      expect(download.suggestedFilename()).toContain('.xlsx');
    });

    test('should publish roster to employees', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/roster`);

      // Generate roster first if needed
      const hasRoster = await page.locator('.roster-cell').count();

      if (hasRoster > 0) {
        await page.click('button:has-text("Publish Roster")');

        // Confirmation
        await expect(page.locator('text=Publish roster to employees')).toBeVisible();
        await expect(page.locator('text=/will be notified via email/')).toBeVisible();

        await page.click('button:has-text("Publish")');

        await expect(page.locator('.toast-success')).toContainText('Roster published');
      }
    });
  });

  test.describe('Shift Swap Requests (Employee)', () => {
    test('should request shift swap', async ({ page }) => {
      // Login as employee
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);

      await page.goto(`${BASE_URL}/attendance/my-shifts`);

      // Click on a shift date
      await page.click('[data-testid="shift-calendar"] .shift-day:first-of-type');

      // Request swap button
      await page.click('button:has-text("Request Swap")');

      // Swap request form
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Request Shift Swap")')).toBeVisible();

      // Select date to swap with
      await page.fill('input[name="swapDate"]', '2024-01-15');

      // Select colleague
      await page.fill('input[placeholder*="Search colleague"]', 'Jane');
      await page.waitForTimeout(500);
      await page.click('li:has-text("Jane Doe")');

      // Add reason
      await page.fill('textarea[name="reason"]', 'Personal emergency - family function');

      // Submit request
      await page.click('button:has-text("Submit Request")');

      await expect(page.locator('.toast-success')).toContainText('Swap request sent');
    });

    test('should view pending swap requests', async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);

      await page.goto(`${BASE_URL}/attendance/shift-swaps`);

      // Should show requests tabs
      await expect(page.locator('button:has-text("My Requests")')).toBeVisible();
      await expect(page.locator('button:has-text("Requests to Me")')).toBeVisible();

      // My Requests tab
      await page.click('button:has-text("My Requests")');

      // Should show list of swap requests
      await expect(page.locator('table tbody')).toBeVisible();
    });

    test('should approve incoming swap request', async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);

      await page.goto(`${BASE_URL}/attendance/shift-swaps`);

      // Go to "Requests to Me" tab
      await page.click('button:has-text("Requests to Me")');

      // Find first pending request
      const firstRequest = page.locator('table tbody tr:first-child');
      await firstRequest.locator('button:has-text("Approve")').click();

      // Confirmation
      await page.click('button:has-text("Confirm")');

      await expect(page.locator('.toast-success')).toContainText('Swap request approved');
    });

    test('should reject incoming swap request', async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);

      await page.goto(`${BASE_URL}/attendance/shift-swaps`);

      await page.click('button:has-text("Requests to Me")');

      const firstRequest = page.locator('table tbody tr:first-child');
      await firstRequest.locator('button:has-text("Reject")').click();

      // Add rejection reason
      await page.fill('textarea[name="rejectionReason"]', 'Already have commitments on that day');

      await page.click('button:has-text("Reject")');

      await expect(page.locator('.toast-success')).toContainText('Swap request rejected');
    });

    test('should cancel own swap request', async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);

      await page.goto(`${BASE_URL}/attendance/shift-swaps`);

      // My Requests
      await page.click('button:has-text("My Requests")');

      const pendingRequest = page.locator('table tbody tr:has-text("Pending"):first-child');
      await pendingRequest.locator('button:has-text("Cancel")').click();

      await page.click('button:has-text("Confirm")');

      await expect(page.locator('.toast-success')).toContainText('Request cancelled');
    });
  });

  test.describe('Weekend & Holiday Shifts (HR)', () => {
    test('should schedule weekend shift', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/roster`);

      // Click on a Saturday/Sunday cell
      const weekendCell = page.locator('.roster-cell[data-day="Saturday"]:first-of-type');
      await weekendCell.click();

      // Assign shift
      await page.selectOption('select[name="shiftId"]', { index: 1 });

      // Mark as weekend shift (for compensation)
      await page.check('input[name="isWeekendShift"]');

      await page.click('button:has-text("Save")');

      await expect(page.locator('.toast-success')).toContainText('Roster updated');
    });

    test('should schedule holiday shift with compensation', async ({ page }) => {
      await page.goto(`${BASE_URL}/attendance/roster`);

      // Find a holiday date (assuming holidays are marked)
      const holidayCell = page.locator('.roster-cell.holiday:first-of-type');
      await holidayCell.click();

      // Assign shift
      await page.selectOption('select[name="shiftId"]', { index: 1 });

      // Mark as holiday shift
      await page.check('input[name="isHolidayShift"]');

      // Compensation type
      await page.selectOption('select[name="compensationType"]', 'comp_off');

      await page.click('button:has-text("Save")');

      await expect(page.locator('.toast-success')).toContainText('Roster updated');
    });

    test('should view compensatory off balance', async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);

      await page.goto(`${BASE_URL}/attendance/comp-off`);

      // Should show comp-off balance
      await expect(page.locator('[data-testid="comp-off-balance"]')).toBeVisible();
      await expect(page.locator('text=Available Comp-Off')).toBeVisible();
      await expect(page.locator('text=Earned')).toBeVisible();
      await expect(page.locator('text=Used')).toBeVisible();
    });
  });

  test.describe('Shift Reports (HR)', () => {
    test('should generate shift allocation report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/attendance/shifts`);

      // Select report type
      await page.selectOption('select[name="reportType"]', 'shift_allocation');

      // Select date range
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');

      // Generate report
      await page.click('button:has-text("Generate Report")');

      // Report should load
      await expect(page.locator('[data-testid="report-container"]')).toBeVisible();

      // Should show shift-wise breakdown
      await expect(page.locator('text=Shift-wise Employee Count')).toBeVisible();
    });

    test('should generate shift compliance report', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/attendance/shifts`);

      await page.selectOption('select[name="reportType"]', 'shift_compliance');

      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');

      await page.click('button:has-text("Generate Report")');

      // Should show compliance metrics
      await expect(page.locator('text=On-time Clock-ins')).toBeVisible();
      await expect(page.locator('text=Late Arrivals')).toBeVisible();
      await expect(page.locator('text=Early Departures')).toBeVisible();
    });

    test('should export shift report to PDF', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports/attendance/shifts`);

      await page.selectOption('select[name="reportType"]', 'shift_allocation');
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-01-31');
      await page.click('button:has-text("Generate Report")');

      await page.waitForTimeout(1000);

      // Export to PDF
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export PDF")');

      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('shift');
      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test.describe('Employee Shift View', () => {
    test('should view personal shift schedule', async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);

      await page.goto(`${BASE_URL}/attendance/my-shifts`);

      // Should show current shift details
      await expect(page.locator('[data-testid="current-shift"]')).toBeVisible();
      await expect(page.locator('text=Shift Name')).toBeVisible();
      await expect(page.locator('text=Timing')).toBeVisible();
      await expect(page.locator('text=Working Days')).toBeVisible();
    });

    test('should view upcoming roster in calendar', async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);

      await page.goto(`${BASE_URL}/attendance/my-shifts`);

      // Calendar view should be available
      await expect(page.locator('[data-testid="shift-calendar"]')).toBeVisible();

      // Should show shift assignments for each day
      const shiftsInMonth = await page.locator('.shift-day').count();
      expect(shiftsInMonth).toBeGreaterThan(0);
    });

    test('should receive notification for roster changes', async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, employeeToken);

      await page.goto(`${BASE_URL}/notifications`);

      // Should see roster-related notifications
      await expect(page.locator('.notification-item:has-text("roster")')).toBeVisible();
    });
  });

  test.describe('Manager Shift Operations', () => {
    test('should view team shift schedule', async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);

      await page.goto(`${BASE_URL}/team/shifts`);

      // Should see team members' shifts
      await expect(page.locator('h1:has-text("Team Shifts")')).toBeVisible();
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    test('should approve shift swap request as manager', async ({ page }) => {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
      }, managerToken);

      await page.goto(`${BASE_URL}/team/shift-swaps`);

      // Pending swap requests
      const firstRequest = page.locator('table tbody tr:first-child');
      await firstRequest.locator('button:has-text("Approve")').click();

      await page.click('button:has-text("Confirm")');

      await expect(page.locator('.toast-success')).toContainText('approved');
    });
  });
});
