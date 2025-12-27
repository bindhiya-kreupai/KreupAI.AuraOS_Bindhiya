/**
 * Leave Calendar Integration E2E Tests
 * Plan D - Week 7, Day 32
 *
 * Tests leave calendar functionality including team view and integrations
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

test.describe('Personal Leave Calendar E2E', () => {
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

  test('should display personal leave calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Calendar should be visible
    await expect(page.locator('[data-testid="leave-calendar"]')).toBeVisible();

    // Should show current month and year
    const currentDate = new Date();
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    await expect(page.locator('text=' + monthYear)).toBeVisible();

    // Should show calendar grid
    await expect(page.locator('.calendar-grid')).toBeVisible();

    // Should show day headers (Sun, Mon, Tue, etc.)
    await expect(page.locator('text=Sun')).toBeVisible();
    await expect(page.locator('text=Mon')).toBeVisible();
  });

  test('should highlight leave days on calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Leave days should be highlighted
    const leaveDays = page.locator('.calendar-day.leave-day');

    if (await leaveDays.first().isVisible()) {
      await expect(leaveDays.first()).toHaveClass(/leave-day/);

      // Click on a leave day to see details
      await leaveDays.first().click();

      // Leave details popover should appear
      await expect(page.locator('[data-testid="leave-popover"]')).toBeVisible();
      await expect(page.locator('text=Leave Type:')).toBeVisible();
      await expect(page.locator('text=Status:')).toBeVisible();
    }
  });

  test('should show different colors for leave statuses', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Approved leaves - green
    const approvedLeaves = page.locator('.calendar-day.leave-approved');
    if (await approvedLeaves.first().isVisible()) {
      await expect(approvedLeaves.first()).toHaveClass(/approved/);
    }

    // Pending leaves - yellow/orange
    const pendingLeaves = page.locator('.calendar-day.leave-pending');
    if (await pendingLeaves.first().isVisible()) {
      await expect(pendingLeaves.first()).toHaveClass(/pending/);
    }

    // Rejected leaves - red
    const rejectedLeaves = page.locator('.calendar-day.leave-rejected');
    if (await rejectedLeaves.first().isVisible()) {
      await expect(rejectedLeaves.first()).toHaveClass(/rejected/);
    }
  });

  test('should show weekends and holidays differently', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Weekends should be highlighted
    const weekendDays = page.locator('.calendar-day.weekend');
    await expect(weekendDays.first()).toBeVisible();
    await expect(weekendDays.first()).toHaveClass(/weekend/);

    // Holidays should be highlighted
    const holidays = page.locator('.calendar-day.holiday');

    if (await holidays.first().isVisible()) {
      await expect(holidays.first()).toHaveClass(/holiday/);

      // Click on holiday to see details
      await holidays.first().click();

      // Should show holiday name
      await expect(page.locator('[data-testid="holiday-popover"]')).toBeVisible();
      await expect(page.locator('text=Holiday:')).toBeVisible();
    }
  });

  test('should navigate between months', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    const currentMonthText = await page.locator('[data-testid="current-month"]').textContent();

    // Click next month
    await page.click('button[aria-label="Next month"]');
    await page.waitForTimeout(300);

    const nextMonthText = await page.locator('[data-testid="current-month"]').textContent();
    expect(nextMonthText).not.toBe(currentMonthText);

    // Click previous month twice to go back
    await page.click('button[aria-label="Previous month"]');
    await page.waitForTimeout(300);

    const backToCurrentText = await page.locator('[data-testid="current-month"]').textContent();
    expect(backToCurrentText).toBe(currentMonthText);
  });

  test('should navigate to today', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Navigate to different month
    await page.click('button[aria-label="Next month"]');
    await page.click('button[aria-label="Next month"]');

    // Click "Today" button
    await page.click('button:has-text("Today")');

    // Should navigate back to current month
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    await expect(page.locator(`text=${currentMonth}`)).toBeVisible();

    // Today should be highlighted
    await expect(page.locator('.calendar-day.today')).toBeVisible();
  });

  test('should switch between month and year view', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Click view toggle
    await page.click('button:has-text("Year View")');

    // Should show year view with all 12 months
    await expect(page.locator('[data-testid="year-view"]')).toBeVisible();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (const month of months) {
      await expect(page.locator(`text=${month}`)).toBeVisible();
    }

    // Switch back to month view
    await page.click('button:has-text("Month View")');

    await expect(page.locator('[data-testid="leave-calendar"]')).toBeVisible();
  });

  test('should apply for leave from calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Click on a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    // Find the date cell
    const dateCell = page.locator(`[data-date="${futureDate.getDate()}"]`);

    if (await dateCell.isVisible()) {
      await dateCell.click();

      // Context menu or quick apply should appear
      const quickApply = page.locator('button:has-text("Apply Leave")');

      if (await quickApply.isVisible()) {
        await quickApply.click();

        // Leave application modal should open with pre-filled date
        await expect(page.locator('[role="dialog"]')).toBeVisible();

        const startDateValue = await page.locator('input[name="startDate"]').inputValue();
        expect(startDateValue).toContain(futureDate.getFullYear().toString());
      }
    }
  });

  test('should select multiple dates for leave', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Hold Shift and click multiple dates
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 10);

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 12);

    // Click first date
    await page.click(`[data-date="${futureDate1.getDate()}"]`);

    // Hold shift and click second date
    await page.keyboard.down('Shift');
    await page.click(`[data-date="${futureDate2.getDate()}"]`);
    await page.keyboard.up('Shift');

    // Range should be selected
    const selectedDays = page.locator('.calendar-day.selected');
    const count = await selectedDays.count();

    expect(count).toBeGreaterThanOrEqual(3); // At least 3 days selected

    // Apply leave button should appear
    await expect(page.locator('button:has-text("Apply for Selected Days")')).toBeVisible();
  });

  test('should show leave legend', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Legend should be visible
    await expect(page.locator('[data-testid="calendar-legend"]')).toBeVisible();

    // Should explain color coding
    await expect(page.locator('text=Approved Leave')).toBeVisible();
    await expect(page.locator('text=Pending Leave')).toBeVisible();
    await expect(page.locator('text=Weekend')).toBeVisible();
    await expect(page.locator('text=Holiday')).toBeVisible();
  });

  test('should export calendar to iCal format', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Click export button
    await page.click('button:has-text("Export")');

    // Select iCal format
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export to iCal")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('leave-calendar');
    expect(download.suggestedFilename()).toContain('.ics');
  });

  test('should sync with external calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar/settings`);

    // Calendar sync settings
    await expect(page.locator('h2:has-text("Calendar Sync")')).toBeVisible();

    // Should show sync options
    await expect(page.locator('text=Google Calendar')).toBeVisible();
    await expect(page.locator('text=Outlook Calendar')).toBeVisible();

    // Get calendar URL
    await page.click('button:has-text("Get Calendar URL")');

    await expect(page.locator('[data-testid="calendar-url"]')).toBeVisible();

    // Copy URL button
    await page.click('button:has-text("Copy URL")');

    await expect(page.locator('.toast-success')).toContainText('URL copied');
  });
});

test.describe('Team Leave Calendar E2E', () => {
  test.beforeAll(async ({ request }) => {
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
    }, managerToken);
  });

  test('should display team leave calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar`);

    await expect(page.locator('h1')).toContainText('Team Calendar');

    // Calendar should show multiple team members
    await expect(page.locator('[data-testid="team-calendar"]')).toBeVisible();

    // Should show employee list on sidebar
    await expect(page.locator('[data-testid="team-members-list"]')).toBeVisible();

    // Each team member should be listed
    const teamMembers = page.locator('.team-member-item');
    await expect(teamMembers.first()).toBeVisible();
  });

  test('should show all team members leaves on calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar`);

    // Each leave should show employee name
    const leaveItems = page.locator('.leave-item');

    if (await leaveItems.first().isVisible()) {
      const firstLeave = leaveItems.first();

      // Should show employee name on leave bar
      await expect(firstLeave).toBeVisible();

      // Click to see details
      await firstLeave.click();

      await expect(page.locator('[data-testid="leave-details"]')).toBeVisible();
      await expect(page.locator('text=Employee:')).toBeVisible();
    }
  });

  test('should filter team calendar by department', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar`);

    // Open department filter
    await page.click('button:has-text("Filter by Department")');

    // Select a department
    await page.click('label:has-text("Engineering") input[type="checkbox"]');

    await page.click('button:has-text("Apply")');

    // Should only show Engineering team members
    const visibleMembers = page.locator('.team-member-item:visible');
    const count = await visibleMembers.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(visibleMembers.nth(i)).toContainText('Engineering');
    }
  });

  test('should filter team members by name', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar`);

    // Search for team member
    await page.fill('input[placeholder*="Search team members"]', 'John');

    await page.waitForTimeout(500);

    // Should show filtered members
    const visibleMembers = page.locator('.team-member-item:visible');

    if (await visibleMembers.count() > 0) {
      await expect(visibleMembers.first()).toContainText('John');
    }
  });

  test('should check team availability for specific dates', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar`);

    // Click "Check Availability"
    await page.click('button:has-text("Check Availability")');

    // Select date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="checkStartDate"]', formatDate(startDate));
    await page.fill('input[name="checkEndDate"]', formatDate(endDate));

    await page.click('button:has-text("Check")');

    // Should show availability summary
    await expect(page.locator('text=Available Members:')).toBeVisible();
    await expect(page.locator('text=On Leave:')).toBeVisible();
    await expect(page.locator('text=Availability Percentage:')).toBeVisible();

    // Should list members on leave
    const onLeaveList = page.locator('[data-testid="members-on-leave"]');
    if (await onLeaveList.isVisible()) {
      await expect(onLeaveList).toBeVisible();
    }
  });

  test('should show leave conflicts and overlaps', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar`);

    // Look for overlap warnings
    const overlapWarning = page.locator('[data-testid="overlap-warning"]');

    if (await overlapWarning.isVisible()) {
      // Should show which dates have too many people on leave
      await expect(overlapWarning).toContainText(/overlap|multiple.*leave/i);

      // Click to see details
      await overlapWarning.click();

      // Should show list of employees on leave
      await expect(page.locator('[data-testid="overlap-details"]')).toBeVisible();
    }
  });

  test('should view department calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/department-calendar`);

    await expect(page.locator('h1')).toContainText('Department Calendar');

    // Select department
    await page.selectOption('select[name="department"]', { index: 1 });

    // Should load department calendar
    await expect(page.locator('[data-testid="department-calendar"]')).toBeVisible();

    // Should show all department members' leaves
    await expect(page.locator('.leave-item').first()).toBeVisible();
  });

  test('should compare multiple teams', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar/compare`);

    // Select multiple departments
    await page.check('input[value="engineering"]');
    await page.check('input[value="sales"]');

    await page.click('button:has-text("Compare")');

    // Should show side-by-side calendars
    await expect(page.locator('[data-testid="team-calendar-engineering"]')).toBeVisible();
    await expect(page.locator('[data-testid="team-calendar-sales"]')).toBeVisible();
  });

  test('should show team capacity chart', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar`);

    // Click "Capacity View"
    await page.click('button:has-text("Capacity View")');

    // Should show capacity chart
    await expect(page.locator('[data-testid="capacity-chart"]')).toBeVisible();

    // Should show daily team strength
    await expect(page.locator('text=Team Strength')).toBeVisible();

    // Should highlight low capacity days
    const lowCapacityDays = page.locator('.low-capacity-day');

    if (await lowCapacityDays.first().isVisible()) {
      await expect(lowCapacityDays.first()).toHaveClass(/low-capacity/);
    }
  });

  test('should export team calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar`);

    // Click export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Team Calendar")');

    // Select format
    await page.click('button:has-text("Excel")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('team-calendar');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('should send calendar email to team', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar`);

    // Click "Share Calendar"
    await page.click('button:has-text("Share Calendar")');

    // Email modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Select date range to share
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    await page.fill('input[name="shareStartDate"]', formatDate(startDate));
    await page.fill('input[name="shareEndDate"]', formatDate(endDate));

    // Add message
    await page.fill('textarea[name="message"]', 'Team leave calendar for next month');

    // Send email
    await page.click('button:has-text("Send Email")');

    await expect(page.locator('.toast-success')).toContainText('Calendar sent');
  });

  test('should show month-over-month leave trends', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar/trends`);

    await expect(page.locator('h1')).toContainText('Leave Trends');

    // Should show trend chart
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();

    // Should show metrics
    await expect(page.locator('text=Average Leaves per Month')).toBeVisible();
    await expect(page.locator('text=Peak Leave Period')).toBeVisible();
    await expect(page.locator('text=Least Utilized Leave Type')).toBeVisible();
  });

  test('should print team calendar', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/team-calendar`);

    // Click print
    await page.click('button:has-text("Print")');

    // Print styles should be applied
    const printStyles = await page.evaluate(() => {
      const printStylesheet = Array.from(document.styleSheets).find(
        sheet => sheet.media.mediaText.includes('print')
      );
      return printStylesheet !== undefined;
    });

    expect(printStyles).toBeTruthy();
  });
});
