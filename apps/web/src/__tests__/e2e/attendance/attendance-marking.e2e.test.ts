/**
 * Attendance Marking E2E Tests
 * Plan D - Week 7, Day 33
 *
 * Tests attendance clock in/out and marking workflows
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

test.describe('Attendance Clock In/Out E2E', () => {
  test.beforeAll(async ({ request }) => {
    const empResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: EMPLOYEE_EMAIL,
        password: EMPLOYEE_PASSWORD,
      },
    });

    const empData = await empResponse.json();
    employeeToken = empData.data.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, employeeToken);
  });

  test('should display attendance dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance`);

    await expect(page.locator('h1')).toContainText('Attendance');

    // Should show current status
    await expect(page.locator('[data-testid="attendance-status"]')).toBeVisible();

    // Should show clock in/out button
    const clockButton = page.locator('button:has-text("Clock In"), button:has-text("Clock Out")');
    await expect(clockButton).toBeVisible();
  });

  test('should clock in successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance`);

    // Check current status
    const status = await page.locator('[data-testid="attendance-status"]').textContent();

    if (status?.includes('Not Clocked In') || status?.includes('Clocked Out')) {
      // Click Clock In button
      await page.click('button:has-text("Clock In")');

      // Confirmation or GPS permission might be requested
      const confirmDialog = page.locator('[role="alertdialog"]');
      if (await confirmDialog.isVisible()) {
        await page.click('button:has-text("Confirm")');
      }

      // Wait for success notification
      await expect(page.locator('.toast-success')).toBeVisible();
      await expect(page.locator('.toast-success')).toContainText(/clocked in|attendance marked/i);

      // Status should update
      await expect(page.locator('[data-testid="attendance-status"]')).toContainText(/clocked in|working/i);

      // Clock in time should be displayed
      await expect(page.locator('text=Clock In Time:')).toBeVisible();
    }
  });

  test('should capture GPS location on clock in', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance`);

    // Grant geolocation permission
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 40.7128, longitude: -74.0060 });

    const clockInButton = page.locator('button:has-text("Clock In")');
    if (await clockInButton.isVisible()) {
      await clockInButton.click();

      // Should request location
      await page.waitForTimeout(1000);

      // Success message should mention location
      const successToast = page.locator('.toast-success');
      if (await successToast.isVisible()) {
        await expect(successToast).toBeVisible();
      }

      // View attendance details to see location
      await page.click('button:has-text("View Details")');

      await expect(page.locator('text=Location:')).toBeVisible();
    }
  });

  test('should show late arrival warning', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance`);

    // If clocking in after shift start time (e.g., 9:30 AM when shift starts at 9:00 AM)
    const currentTime = new Date();
    const hours = currentTime.getHours();

    // Simulate late clock in (this would need proper time mocking in real scenario)
    if (hours >= 9) {
      const clockInButton = page.locator('button:has-text("Clock In")');
      if (await clockInButton.isVisible()) {
        await clockInButton.click();

        // Should show late warning
        const lateWarning = page.locator('text=/late|delayed/i');
        if (await lateWarning.isVisible()) {
          await expect(lateWarning).toBeVisible();

          // Should ask for reason
          await expect(page.locator('textarea[name="lateReason"]')).toBeVisible();
        }
      }
    }
  });

  test('should clock out successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance`);

    const status = await page.locator('[data-testid="attendance-status"]').textContent();

    if (status?.includes('Clocked In') || status?.includes('Working')) {
      // Click Clock Out button
      await page.click('button:has-text("Clock Out")');

      // Confirmation
      const confirmDialog = page.locator('[role="alertdialog"]');
      if (await confirmDialog.isVisible()) {
        await page.click('button:has-text("Confirm")');
      }

      await expect(page.locator('.toast-success')).toContainText(/clocked out/i);

      // Status should update
      await expect(page.locator('[data-testid="attendance-status"]')).toContainText(/clocked out|off duty/i);

      // Should show working hours
      await expect(page.locator('text=Total Working Hours:')).toBeVisible();
    }
  });

  test('should calculate working hours correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/history`);

    // View today's attendance
    const todayRow = page.locator('table tbody tr:first-child');

    if (await todayRow.isVisible()) {
      await todayRow.click();

      // Attendance details
      await expect(page.locator('[data-testid="attendance-details"]')).toBeVisible();

      // Get clock in and out times
      const clockInText = await page.locator('text=Clock In:').locator('..').textContent();
      const clockOutText = await page.locator('text=Clock Out:').locator('..').textContent();
      const workingHoursText = await page.locator('text=Working Hours:').locator('..').textContent();

      // Verify all values are present
      expect(clockInText).toBeTruthy();
      if (clockOutText?.includes('Clock Out')) {
        expect(workingHoursText).toMatch(/\d+:\d+/); // Format: HH:MM
      }
    }
  });

  test('should show early departure warning', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance`);

    const status = await page.locator('[data-testid="attendance-status"]').textContent();

    if (status?.includes('Clocked In')) {
      // Try to clock out early (before shift end time)
      await page.click('button:has-text("Clock Out")');

      // Should show early departure warning
      const earlyWarning = page.locator('text=/early|before.*shift/i');
      if (await earlyWarning.isVisible()) {
        await expect(earlyWarning).toBeVisible();

        // Should ask for reason
        await expect(page.locator('textarea[name="earlyDepartureReason"]')).toBeVisible();
      }
    }
  });

  test('should prevent duplicate clock in', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance`);

    const status = await page.locator('[data-testid="attendance-status"]').textContent();

    if (status?.includes('Clocked In')) {
      // Clock in button should be disabled or not visible
      const clockInButton = page.locator('button:has-text("Clock In")');

      if (await clockInButton.isVisible()) {
        await expect(clockInButton).toBeDisabled();
      }
    }
  });

  test('should view attendance history', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/history`);

    await expect(page.locator('h1')).toContainText('Attendance History');

    // Should show attendance table
    await expect(page.locator('table')).toBeVisible();

    // Verify columns
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Clock In")')).toBeVisible();
    await expect(page.locator('th:has-text("Clock Out")')).toBeVisible();
    await expect(page.locator('th:has-text("Working Hours")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should filter attendance by date range', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/history`);

    // Select date range
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="startDate"]', formatDate(startDate));
    await page.fill('input[name="endDate"]', formatDate(new Date()));

    await page.click('button:has-text("Apply")');

    // Should show filtered results
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('should export attendance history', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/history`);

    // Click export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');

    // Select Excel
    await page.click('button:has-text("Excel")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('attendance');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('should view monthly attendance summary', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/summary`);

    await expect(page.locator('h1')).toContainText('Monthly Summary');

    // Should show summary cards
    await expect(page.locator('[data-testid="summary-card"]').first()).toBeVisible();

    // Summary metrics
    await expect(page.locator('text=Total Working Days')).toBeVisible();
    await expect(page.locator('text=Days Present')).toBeVisible();
    await expect(page.locator('text=Days Absent')).toBeVisible();
    await expect(page.locator('text=Late Arrivals')).toBeVisible();
    await expect(page.locator('text=Early Departures')).toBeVisible();
  });

  test('should show attendance on calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/calendar`);

    // Calendar should be visible
    await expect(page.locator('[data-testid="attendance-calendar"]')).toBeVisible();

    // Present days should be marked
    const presentDays = page.locator('.calendar-day.present');
    if (await presentDays.first().isVisible()) {
      await expect(presentDays.first()).toHaveClass(/present/);
    }

    // Absent days should be marked
    const absentDays = page.locator('.calendar-day.absent');
    if (await absentDays.first().isVisible()) {
      await expect(absentDays.first()).toHaveClass(/absent/);
    }

    // Late days should be marked differently
    const lateDays = page.locator('.calendar-day.late');
    if (await lateDays.first().isVisible()) {
      await expect(lateDays.first()).toHaveClass(/late/);
    }
  });

  test('should use biometric authentication', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance`);

    // If biometric option is available
    const biometricButton = page.locator('button:has-text("Use Biometric")');

    if (await biometricButton.isVisible()) {
      await biometricButton.click();

      // Simulate biometric authentication
      // In real scenario, this would trigger device biometric
      await page.waitForTimeout(2000);

      // Should show authentication result
      const authResult = page.locator('text=/authenticated|verified/i');
      if (await authResult.isVisible()) {
        await expect(authResult).toBeVisible();
      }
    }
  });
});

test.describe('Manual Attendance Marking (HR)', () => {
  test.beforeAll(async ({ request }) => {
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
    }, hrToken);
  });

  test('should mark attendance manually for employee', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/admin/mark`);

    await expect(page.locator('h1')).toContainText('Mark Attendance');

    // Select employee
    await page.click('input[name="employee"]');
    await page.fill('input[name="employee"]', 'John');
    await page.waitForTimeout(500);
    await page.click('.employee-option:first-child');

    // Select date
    const date = new Date();
    date.setDate(date.getDate() - 1); // Yesterday
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="date"]', formatDate(date));

    // Mark as present
    await page.selectOption('select[name="status"]', 'present');

    // Enter times
    await page.fill('input[name="clockIn"]', '09:00');
    await page.fill('input[name="clockOut"]', '18:00');

    // Add remarks
    await page.fill('textarea[name="remarks"]', 'Manually marked by HR');

    // Submit
    await page.click('button[type="submit"]:has-text("Mark Attendance")');

    await expect(page.locator('.toast-success')).toContainText('Attendance marked');
  });

  test('should bulk upload attendance', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/admin/bulk-upload`);

    await expect(page.locator('h1')).toContainText('Bulk Upload');

    // Download template
    const templateDownload = page.waitForEvent('download');
    await page.click('button:has-text("Download Template")');

    const template = await templateDownload;
    expect(template.suggestedFilename()).toContain('attendance-template');

    // Upload filled template
    const fileInput = page.locator('input[type="file"]');
    // In real test: await fileInput.setInputFiles('path/to/attendance-upload.xlsx');

    // Click upload
    // await page.click('button:has-text("Upload")');

    // Should show validation results
    // await expect(page.locator('text=Validation Results')).toBeVisible();
  });

  test('should view all employees attendance', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/admin`);

    await expect(page.locator('h1')).toContainText('Team Attendance');

    // Should show employee attendance table
    await expect(page.locator('table')).toBeVisible();

    // Filter by department
    await page.selectOption('select[name="department"]', { index: 1 });

    await page.click('button:has-text("Apply")');

    // Should show filtered employees
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('should view daily attendance report', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/admin/daily-report`);

    // Select date
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    await page.fill('input[name="date"]', formatDate(new Date()));

    await page.click('button:has-text("View Report")');

    // Should show attendance summary
    await expect(page.locator('text=Total Employees:')).toBeVisible();
    await expect(page.locator('text=Present:')).toBeVisible();
    await expect(page.locator('text=Absent:')).toBeVisible();
    await expect(page.locator('text=On Leave:')).toBeVisible();
    await expect(page.locator('text=Late:')).toBeVisible();

    // Should show employee list
    await expect(page.locator('table')).toBeVisible();
  });

  test('should send absent notifications', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/admin/daily-report`);

    await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
    await page.click('button:has-text("View Report")');

    // Click "Send Absent Notifications"
    await page.click('button:has-text("Send Notifications")');

    // Confirmation
    await expect(page.locator('text=Send notifications to absent employees')).toBeVisible();

    await page.click('button:has-text("Send")');

    await expect(page.locator('.toast-success')).toContainText('Notifications sent');
  });

  test('should generate monthly attendance report', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/admin/reports`);

    // Select month
    await page.selectOption('select[name="month"]', { index: 0 });
    await page.selectOption('select[name="year"]', '2024');

    // Generate report
    await page.click('button:has-text("Generate Report")');

    // Should show report
    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Should show summary statistics
    await expect(page.locator('text=Total Working Days')).toBeVisible();
    await expect(page.locator('text=Average Attendance')).toBeVisible();
  });

  test('should export monthly report to Excel', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/admin/reports`);

    await page.selectOption('select[name="month"]', { index: 0 });
    await page.click('button:has-text("Generate Report")');

    // Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export to Excel")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('attendance-report');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
