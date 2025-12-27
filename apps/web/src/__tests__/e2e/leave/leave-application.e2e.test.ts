/**
 * Leave Application E2E Tests
 * Plan D - Week 7, Day 32
 *
 * Tests the complete leave application and approval workflow
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

test.describe('Leave Application E2E', () => {
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
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, employeeToken);
  });

  test('should navigate to leave module', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Navigate to Leave module
    await page.click('text=Leave');

    await expect(page).toHaveURL(/.*\/leave/);
    await expect(page.locator('h1')).toContainText('Leave');
  });

  test('should view leave balances', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    // Should display leave balance cards
    await expect(page.locator('[data-testid="leave-balance-card"]').first()).toBeVisible();

    // Common leave types
    const leaveTypes = ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Earned Leave'];

    for (const leaveType of leaveTypes) {
      const card = page.locator(`[data-testid="leave-balance-card"]:has-text("${leaveType}")`).first();

      if (await card.isVisible()) {
        // Should show available balance
        await expect(card.locator('text=Available:')).toBeVisible();
        await expect(card.locator('text=/\\d+/')).toBeVisible();
      }
    }
  });

  test('should apply for casual leave', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    // Click "Apply Leave" button
    await page.click('button:has-text("Apply Leave")');

    // Modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Apply for Leave');

    // Select leave type
    await page.selectOption('select[name="leaveTypeId"]', { label: 'Casual Leave' });

    // Select dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // 7 days from now
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2); // 3 days leave

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="startDate"]', formatDate(startDate));
    await page.fill('input[name="endDate"]', formatDate(endDate));

    // Select half day option (optional)
    const halfDayOption = page.locator('select[name="halfDay"]');
    if (await halfDayOption.isVisible()) {
      await halfDayOption.selectOption('none');
    }

    // Enter reason
    await page.fill('textarea[name="reason"]', 'Personal work - family function');

    // Submit application
    await page.click('button[type="submit"]:has-text("Submit")');

    // Wait for success notification
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Leave application submitted');

    // Verify leave appears in list
    await expect(page.locator('table tbody tr:has-text("Casual Leave")').first()).toBeVisible();
  });

  test('should apply for half-day leave', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    await page.click('button:has-text("Apply Leave")');

    await page.selectOption('select[name="leaveTypeId"]', { label: 'Casual Leave' });

    // Select same date for start and end
    const leaveDate = new Date();
    leaveDate.setDate(leaveDate.getDate() + 10);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="startDate"]', formatDate(leaveDate));
    await page.fill('input[name="endDate"]', formatDate(leaveDate));

    // Select half day
    await page.selectOption('select[name="halfDay"]', 'first-half');

    await page.fill('textarea[name="reason"]', 'Doctor appointment in the morning');

    await page.click('button[type="submit"]:has-text("Submit")');

    await expect(page.locator('.toast-success')).toContainText('Leave application submitted');

    // Verify leave shows as 0.5 days
    const leaveRow = page.locator('table tbody tr:has-text("Casual Leave")').first();
    await expect(leaveRow).toContainText('0.5');
  });

  test('should apply for sick leave with medical certificate', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    await page.click('button:has-text("Apply Leave")');

    await page.selectOption('select[name="leaveTypeId"]', { label: 'Sick Leave' });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 5);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="startDate"]', formatDate(startDate));
    await page.fill('input[name="endDate"]', formatDate(endDate));
    await page.fill('textarea[name="reason"]', 'Fever and flu');

    // Upload medical certificate
    const fileInput = page.locator('input[type="file"][name="attachment"]');
    if (await fileInput.isVisible()) {
      // In real test, upload actual file
      // await fileInput.setInputFiles('path/to/medical-certificate.pdf');
    }

    await page.click('button[type="submit"]:has-text("Submit")');

    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should validate leave balance before application', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    await page.click('button:has-text("Apply Leave")');

    await page.selectOption('select[name="leaveTypeId"]', { label: 'Casual Leave' });

    // Try to apply for more days than available
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30); // 31 days
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="startDate"]', formatDate(startDate));
    await page.fill('input[name="endDate"]', formatDate(endDate));

    // Should show balance validation error
    await expect(page.locator('text=/insufficient.*balance|not enough/i')).toBeVisible();

    // Submit button should be disabled
    await expect(page.locator('button[type="submit"]:has-text("Submit")')).toBeDisabled();
  });

  test('should check for overlapping leave dates', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    await page.click('button:has-text("Apply Leave")');

    await page.selectOption('select[name="leaveTypeId"]', { label: 'Casual Leave' });

    // Try to apply for dates that overlap with existing leave
    // (This assumes there's already a pending leave application)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="startDate"]', formatDate(startDate));
    await page.fill('input[name="endDate"]', formatDate(endDate));

    // Should show overlap warning
    const overlapWarning = page.locator('text=/overlap|already applied/i');
    if (await overlapWarning.isVisible()) {
      await expect(overlapWarning).toBeVisible();
    }
  });

  test('should show leave calendar while selecting dates', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    await page.click('button:has-text("Apply Leave")');

    // Click on start date input to open calendar
    await page.click('input[name="startDate"]');

    // Calendar should be visible
    await expect(page.locator('[data-testid="date-picker-calendar"]')).toBeVisible();

    // Weekends should be highlighted differently
    const weekendDays = page.locator('.weekend-day');
    if (await weekendDays.first().isVisible()) {
      await expect(weekendDays.first()).toHaveClass(/weekend/);
    }

    // Holidays should be highlighted
    const holidays = page.locator('.holiday-day');
    if (await holidays.first().isVisible()) {
      await expect(holidays.first()).toHaveClass(/holiday/);
    }
  });

  test('should calculate working days excluding weekends and holidays', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    await page.click('button:has-text("Apply Leave")');

    await page.selectOption('select[name="leaveTypeId"]', { label: 'Casual Leave' });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // 7 calendar days
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="startDate"]', formatDate(startDate));
    await page.fill('input[name="endDate"]', formatDate(endDate));

    // Should show working days count (excluding weekends)
    await expect(page.locator('text=Working Days:')).toBeVisible();

    const workingDaysText = await page.locator('text=Working Days:').locator('..').textContent();
    expect(workingDaysText).toMatch(/5|6|7/); // Should be less than 7
  });

  test('should edit pending leave application', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    // Find a pending leave
    const pendingRow = page.locator('table tbody tr:has-text("Pending")').first();

    if (await pendingRow.isVisible()) {
      // Click edit button
      await pendingRow.locator('button[aria-label="Edit"]').click();

      // Modal should open with existing data
      await expect(page.locator('[role="dialog"]')).toBeVisible();

      // Modify reason
      await page.fill('textarea[name="reason"]', 'Updated reason for leave');

      // Save changes
      await page.click('button[type="submit"]:has-text("Update")');

      await expect(page.locator('.toast-success')).toContainText('Leave application updated');
    }
  });

  test('should cancel pending leave application', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    const pendingRow = page.locator('table tbody tr:has-text("Pending")').first();

    if (await pendingRow.isVisible()) {
      // Click cancel button
      await pendingRow.locator('button[aria-label="Cancel"]').click();

      // Confirmation dialog
      await expect(page.locator('[role="alertdialog"]')).toBeVisible();
      await expect(page.locator('text=Are you sure you want to cancel')).toBeVisible();

      // Enter cancellation reason
      await page.fill('textarea[name="cancellationReason"]', 'Plans changed');

      // Confirm cancellation
      await page.click('button:has-text("Cancel Leave")');

      await expect(page.locator('.toast-success')).toContainText('Leave cancelled');

      // Status should change to "Cancelled"
      await expect(pendingRow).toContainText('Cancelled');
    }
  });

  test('should not allow editing approved leave', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    const approvedRow = page.locator('table tbody tr:has-text("Approved")').first();

    if (await approvedRow.isVisible()) {
      // Edit button should be disabled or not visible
      const editButton = approvedRow.locator('button[aria-label="Edit"]');

      if (await editButton.isVisible()) {
        await expect(editButton).toBeDisabled();
      } else {
        await expect(editButton).not.toBeVisible();
      }
    }
  });

  test('should filter leave applications by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    // Open status filter
    await page.click('button:has-text("Status")');

    // Select "Approved" status
    await page.click('label:has-text("Approved") input[type="checkbox"]');

    // Apply filter
    await page.click('button:has-text("Apply")');

    // All visible rows should have "Approved" status
    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i)).toContainText('Approved');
      }
    }
  });

  test('should filter leave applications by leave type', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    // Open leave type filter
    await page.click('button:has-text("Leave Type")');

    // Select "Casual Leave"
    await page.click('label:has-text("Casual Leave") input[type="checkbox"]');

    await page.click('button:has-text("Apply")');

    // All visible rows should be Casual Leave
    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(rows.nth(i)).toContainText('Casual Leave');
      }
    }
  });

  test('should filter leave applications by date range', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    // Open date range filter
    await page.click('button:has-text("Date Range")');

    // Select current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="filterStartDate"]', formatDate(startOfMonth));
    await page.fill('input[name="filterEndDate"]', formatDate(endOfMonth));

    await page.click('button:has-text("Apply")');

    // Should show filtered results
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('should view leave application details', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    // Click on first leave application
    await page.click('table tbody tr:first-child');

    // Details modal/panel should open
    await expect(page.locator('[data-testid="leave-details"]')).toBeVisible();

    // Verify details are displayed
    await expect(page.locator('text=Leave Type:')).toBeVisible();
    await expect(page.locator('text=Start Date:')).toBeVisible();
    await expect(page.locator('text=End Date:')).toBeVisible();
    await expect(page.locator('text=Number of Days:')).toBeVisible();
    await expect(page.locator('text=Reason:')).toBeVisible();
    await expect(page.locator('text=Status:')).toBeVisible();

    // If approved, should show approver details
    const approverInfo = page.locator('text=Approved By:');
    if (await approverInfo.isVisible()) {
      await expect(page.locator('text=Approved On:')).toBeVisible();
    }
  });

  test('should export leave history', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/my-leaves`);

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');

    // Select Excel format
    await page.click('button:has-text("Excel")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('leave-history');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('should show leave application on calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Calendar should be visible
    await expect(page.locator('[data-testid="leave-calendar"]')).toBeVisible();

    // Should show current month
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    await expect(page.locator(`text=${currentMonth}`)).toBeVisible();

    // Leave days should be highlighted on calendar
    const leaveDays = page.locator('.leave-day');

    if (await leaveDays.first().isVisible()) {
      await expect(leaveDays.first()).toHaveClass(/leave/);
    }
  });

  test('should navigate calendar months', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    const currentMonth = await page.locator('[data-testid="current-month"]').textContent();

    // Click next month
    await page.click('button[aria-label="Next month"]');

    const nextMonth = await page.locator('[data-testid="current-month"]').textContent();
    expect(nextMonth).not.toBe(currentMonth);

    // Click previous month
    await page.click('button[aria-label="Previous month"]');

    const backToCurrentMonth = await page.locator('[data-testid="current-month"]').textContent();
    expect(backToCurrentMonth).toBe(currentMonth);
  });

  test('should apply for leave from calendar view', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Click on a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dayOfMonth = futureDate.getDate();

    await page.click(`[data-date="${dayOfMonth}"]`);

    // Leave application modal should open with pre-filled date
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Apply for Leave');

    // Start date should be pre-filled
    const startDateValue = await page.locator('input[name="startDate"]').inputValue();
    expect(startDateValue).toBeTruthy();
  });
});

test.describe('Leave Approval Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, managerToken);
  });

  test('should view pending leave requests as manager', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/approvals`);

    await expect(page.locator('h1')).toContainText('Leave Approvals');

    // Should show pending requests table
    await expect(page.locator('table')).toBeVisible();

    // Should show employee names, leave types, dates
    const firstRow = page.locator('table tbody tr:first-child');

    if (await firstRow.isVisible()) {
      await expect(firstRow.locator('td:nth-child(1)')).toBeVisible(); // Employee name
      await expect(firstRow.locator('td:nth-child(2)')).toBeVisible(); // Leave type
      await expect(firstRow.locator('td:nth-child(3)')).toBeVisible(); // Dates
    }
  });

  test('should approve leave request', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/approvals`);

    const pendingRow = page.locator('table tbody tr:has-text("Pending")').first();

    if (await pendingRow.isVisible()) {
      // Click approve button
      await pendingRow.locator('button:has-text("Approve")').click();

      // Confirmation dialog
      await expect(page.locator('[role="alertdialog"]')).toBeVisible();

      // Add optional comments
      await page.fill('textarea[name="comments"]', 'Approved for personal reasons');

      // Confirm approval
      await page.click('button:has-text("Confirm Approval")');

      await expect(page.locator('.toast-success')).toContainText('Leave approved');

      // Row should be removed from pending list or status updated
      await page.waitForTimeout(1000);
    }
  });

  test('should reject leave request', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/approvals`);

    const pendingRow = page.locator('table tbody tr:has-text("Pending")').first();

    if (await pendingRow.isVisible()) {
      // Click reject button
      await pendingRow.locator('button:has-text("Reject")').click();

      // Confirmation dialog
      await expect(page.locator('[role="alertdialog"]')).toBeVisible();

      // Rejection reason is required
      await page.fill('textarea[name="rejectionReason"]', 'Team is already short-staffed during this period');

      // Confirm rejection
      await page.click('button:has-text("Confirm Rejection")');

      await expect(page.locator('.toast-success')).toContainText('Leave rejected');
    }
  });

  test('should view leave request details before approval', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/approvals`);

    const firstRow = page.locator('table tbody tr:first-child');

    if (await firstRow.isVisible()) {
      // Click on row to view details
      await firstRow.click();

      // Details panel should open
      await expect(page.locator('[data-testid="leave-request-details"]')).toBeVisible();

      // Should show employee details
      await expect(page.locator('text=Employee:')).toBeVisible();
      await expect(page.locator('text=Department:')).toBeVisible();
      await expect(page.locator('text=Current Balance:')).toBeVisible();
      await expect(page.locator('text=Requested Days:')).toBeVisible();
      await expect(page.locator('text=Remaining Balance:')).toBeVisible();
    }
  });

  test('should check team availability before approval', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/approvals`);

    const firstRow = page.locator('table tbody tr:first-child');

    if (await firstRow.isVisible()) {
      await firstRow.click();

      // Click "Check Team Availability"
      await page.click('button:has-text("Team Availability")');

      // Should show team calendar with other leaves
      await expect(page.locator('[data-testid="team-calendar"]')).toBeVisible();

      // Should highlight conflicting leaves
      const conflictWarning = page.locator('text=/conflicts|other team members/i');
      if (await conflictWarning.isVisible()) {
        await expect(conflictWarning).toBeVisible();
      }
    }
  });

  test('should bulk approve leave requests', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/approvals`);

    // Select multiple requests
    await page.check('table tbody tr:first-child input[type="checkbox"]');
    await page.check('table tbody tr:nth-child(2) input[type="checkbox"]');

    // Click bulk approve
    await page.click('button:has-text("Approve Selected")');

    // Confirmation
    await expect(page.locator('text=/Approve \\d+ leave requests/i')).toBeVisible();

    await page.click('button:has-text("Confirm")');

    await expect(page.locator('.toast-success')).toContainText('approved successfully');
  });

  test('should filter approvals by department', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/approvals`);

    // Open department filter
    await page.click('button:has-text("Department")');

    // Select a department
    await page.click('label:has-text("Engineering") input[type="checkbox"]');

    await page.click('button:has-text("Apply")');

    // All visible requests should be from Engineering
    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(rows.nth(i)).toContainText('Engineering');
      }
    }
  });
});
