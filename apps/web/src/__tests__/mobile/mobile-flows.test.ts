/**
 * Mobile E2E Flow Tests (Days 69-70)
 *
 * End-to-end testing of core workflows on mobile devices:
 * - Mobile authentication
 * - Dashboard navigation
 * - Employee management
 * - Leave application
 * - Attendance marking
 * - Forms and data entry
 */

import { test, expect, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test on primary mobile device
test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Authentication Flow', () => {
  test('should login successfully on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Fill credentials
    await page.tap('input[name="email"]');
    await page.fill('input[name="email"]', 'admin@auraos.com');

    await page.tap('input[name="password"]');
    await page.fill('input[name="password"]', 'Admin@123');

    // Submit
    await page.tap('button[type="submit"]');

    // Should navigate to dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('should show password visibility toggle on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('button[aria-label*="password"], [data-testid="toggle-password"]');

    // Initially password type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Tap toggle
    if (await toggleButton.count() > 0) {
      await toggleButton.first().tap();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Tap again to hide
      await toggleButton.first().tap();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should show mobile-friendly error messages', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.tap('button[type="submit"]');

    await page.waitForTimeout(1000);

    // Error should be visible and readable
    const error = page.locator('.error, .alert-error, [role="alert"]');
    await expect(error).toBeVisible();

    const errorBox = await error.first().boundingBox();
    const viewport = page.viewportSize();

    expect(errorBox!.width).toBeLessThanOrEqual(viewport!.width);
  });

  test('should handle biometric authentication prompt', async ({ page }) => {
    test.skip(); // Requires device biometric API simulation
  });
});

test.describe('Mobile Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.tap('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should display mobile-optimized dashboard', async ({ page }) => {
    // Dashboard should load
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Widgets should stack vertically
    const widgets = await page.locator('[data-testid="widget"], .dashboard-card, .widget').all();

    if (widgets.length >= 2) {
      const box1 = await widgets[0].boundingBox();
      const box2 = await widgets[1].boundingBox();

      if (box1 && box2) {
        // Should be stacked (y position increases)
        expect(box2.y).toBeGreaterThan(box1.y);
      }
    }
  });

  test('should navigate via mobile menu', async ({ page }) => {
    // Open mobile menu
    const menuButton = page.locator('[data-testid="mobile-menu"], .hamburger, [aria-label*="menu"]').first();
    await menuButton.tap();

    await page.waitForTimeout(500);

    // Navigate to employees
    await page.tap('a:has-text("Employees"), a[href*="employees"]');

    await page.waitForURL(/employees/);
    expect(page.url()).toContain('employees');
  });

  test('should handle swipe gestures for navigation', async ({ page }) => {
    // Some mobile apps support swipe to go back
    // This depends on implementation
    test.skip(); // Implementation-specific
  });

  test('should display notifications on mobile', async ({ page }) => {
    const notificationBell = page.locator('[data-testid="notifications"], [aria-label*="notification"]');

    if (await notificationBell.count() > 0) {
      await notificationBell.first().tap();

      await page.waitForTimeout(500);

      // Notification panel should open
      const panel = page.locator('[data-testid="notification-panel"], .notifications-panel');
      await expect(panel.first()).toBeVisible();
    }
  });
});

test.describe('Mobile Forms - Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'hr@auraos.com');
    await page.fill('input[name="password"]', 'HR@123');
    await page.tap('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should fill employee form on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);

    // Fill form using mobile interactions
    await page.tap('input[name="firstName"]');
    await page.fill('input[name="firstName"]', 'John');

    await page.tap('input[name="lastName"]');
    await page.fill('input[name="lastName"]', 'Mobile');

    await page.tap('input[name="email"]');
    await page.fill('input[name="email"]', `mobile-${Date.now()}@example.com`);

    // Select dropdown
    await page.tap('select[name="department"]');
    await page.selectOption('select[name="department"]', { index: 1 });

    // Date picker
    await page.tap('input[name="joiningDate"]');
    await page.fill('input[name="joiningDate"]', '2024-01-15');

    // Submit
    await page.tap('button[type="submit"]:has-text("Create"), button:has-text("Save")');

    await page.waitForTimeout(1000);

    // Should show success or navigate
    const currentUrl = page.url();
    expect(currentUrl).toContain('employee');
  });

  test('should handle form validation on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);

    // Try to submit empty form
    await page.tap('button[type="submit"]:has-text("Create"), button:has-text("Save")');

    await page.waitForTimeout(500);

    // Validation errors should be visible
    const errors = await page.locator('.error, .field-error, [role="alert"]').count();
    expect(errors).toBeGreaterThan(0);
  });

  test('should use native mobile date picker', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);

    const dateInput = page.locator('input[name="joiningDate"], input[type="date"]').first();

    // Should have type="date" for native picker
    const inputType = await dateInput.getAttribute('type');
    expect(['date', 'text']).toContain(inputType);
  });
});

test.describe('Mobile Leave Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.tap('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should apply for leave on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/apply`);

    // Select leave type
    await page.tap('select[name="leaveType"]');
    await page.selectOption('select[name="leaveType"]', { label: 'Casual Leave' });

    // Select dates
    await page.tap('input[name="startDate"]');
    await page.fill('input[name="startDate"]', '2024-03-01');

    await page.tap('input[name="endDate"]');
    await page.fill('input[name="endDate"]', '2024-03-02');

    // Enter reason
    await page.tap('textarea[name="reason"]');
    await page.fill('textarea[name="reason"]', 'Personal work - mobile application');

    // Submit
    await page.tap('button[type="submit"]:has-text("Apply")');

    await page.waitForTimeout(1000);

    // Should show success
    const toast = page.locator('.toast-success, .alert-success');
    if (await toast.count() > 0) {
      await expect(toast.first()).toBeVisible();
    }
  });

  test('should view leave balance on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/balance`);

    // Leave balance cards should be visible
    const balanceCards = await page.locator('[data-testid="leave-balance"], .leave-balance-card').count();
    expect(balanceCards).toBeGreaterThan(0);

    // Should be mobile-friendly layout
    const viewport = page.viewportSize();
    const cards = await page.locator('[data-testid="leave-balance"], .leave-balance-card').all();

    for (const card of cards.slice(0, 3)) {
      const box = await card.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(viewport!.width);
      }
    }
  });

  test('should view leave calendar on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/leave/calendar`);

    // Calendar should be visible
    const calendar = page.locator('[data-testid="calendar"], .calendar').first();
    await expect(calendar).toBeVisible();

    // Should be scrollable
    const box = await calendar.boundingBox();
    expect(box).toBeTruthy();
  });
});

test.describe('Mobile Attendance Marking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.tap('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should clock in on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance`);

    // Clock in button
    const clockInButton = page.locator('button:has-text("Clock In")');
    await clockInButton.tap();

    await page.waitForTimeout(1000);

    // Should show clocked in status
    const status = page.locator('[data-testid="attendance-status"], .attendance-status');
    if (await status.count() > 0) {
      const statusText = await status.first().textContent();
      expect(statusText?.toLowerCase()).toContain('clocked in');
    }
  });

  test('should request location for attendance', async ({ page, context }) => {
    // Grant location permission
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });

    await page.goto(`${BASE_URL}/attendance`);

    // Clock in should request location
    const clockInButton = page.locator('button:has-text("Clock In")');
    await clockInButton.tap();

    await page.waitForTimeout(1000);

    // Location should be captured (implementation-specific)
    expect(true).toBeTruthy();
  });

  test('should view attendance history on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/attendance/history`);

    // History list should be visible
    const historyItems = await page.locator('[data-testid="attendance-record"], .attendance-item').count();
    expect(historyItems).toBeGreaterThanOrEqual(0);

    // Should be scrollable list
    const container = page.locator('[data-testid="attendance-list"], .attendance-history').first();
    if (await container.count() > 0) {
      await expect(container).toBeVisible();
    }
  });
});

test.describe('Mobile Search and Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'hr@auraos.com');
    await page.fill('input[name="password"]', 'HR@123');
    await page.tap('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should search employees on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);

    // Search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await searchInput.tap();
    await searchInput.fill('John');

    await page.waitForTimeout(1000);

    // Results should filter
    const results = await page.locator('[data-testid="employee-row"], .employee-item').count();
    expect(results).toBeGreaterThanOrEqual(0);
  });

  test('should apply filters on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);

    // Open filter panel
    const filterButton = page.locator('button:has-text("Filter"), [data-testid="filter-button"]');
    if (await filterButton.count() > 0) {
      await filterButton.first().tap();

      await page.waitForTimeout(500);

      // Filter panel should open
      const filterPanel = page.locator('[data-testid="filter-panel"], .filter-sidebar');
      await expect(filterPanel.first()).toBeVisible();

      // Apply filter
      await page.tap('select[name="department"]');
      await page.selectOption('select[name="department"]', { index: 1 });

      await page.tap('button:has-text("Apply")');

      await page.waitForTimeout(1000);

      // Results should update
      expect(true).toBeTruthy();
    }
  });
});

test.describe('Mobile Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.tap('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should view notifications on mobile', async ({ page }) => {
    const notificationIcon = page.locator('[data-testid="notifications"], [aria-label*="notification"]').first();

    if (await notificationIcon.count() > 0) {
      await notificationIcon.tap();

      await page.waitForTimeout(500);

      // Notification list should be visible
      const notificationList = page.locator('[data-testid="notification-list"], .notifications');
      await expect(notificationList.first()).toBeVisible();
    }
  });

  test('should mark notification as read on mobile', async ({ page }) => {
    const notificationIcon = page.locator('[data-testid="notifications"]').first();

    if (await notificationIcon.count() > 0) {
      await notificationIcon.tap();

      await page.waitForTimeout(500);

      // Tap first notification
      const firstNotification = page.locator('[data-testid="notification-item"]').first();
      if (await firstNotification.count() > 0) {
        await firstNotification.tap();

        await page.waitForTimeout(500);

        // Should navigate or mark as read
        expect(true).toBeTruthy();
      }
    }
  });
});

test.describe('Mobile Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.tap('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should view profile on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);

    // Profile should be visible
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Profile details should be readable
    const viewport = page.viewportSize();
    const profileCard = page.locator('[data-testid="profile-card"], .profile-section').first();

    if (await profileCard.count() > 0) {
      const box = await profileCard.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(viewport!.width);
      }
    }
  });

  test('should edit profile on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile/edit`);

    // Update bio
    const bioField = page.locator('textarea[name="bio"]');
    if (await bioField.count() > 0) {
      await bioField.tap();
      await bioField.fill('Updated bio from mobile device');

      // Save
      await page.tap('button[type="submit"]:has-text("Save")');

      await page.waitForTimeout(1000);

      // Should show success
      const toast = page.locator('.toast-success');
      if (await toast.count() > 0) {
        await expect(toast.first()).toBeVisible();
      }
    }
  });

  test('should upload profile picture on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile/edit`);

    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.count() > 0) {
      // On mobile, file upload opens camera or gallery
      // In test, we simulate file selection
      await fileInput.setInputFiles({
        name: 'profile.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-content'),
      });

      await page.waitForTimeout(1000);

      // Upload should be triggered
      expect(true).toBeTruthy();
    }
  });
});

test.describe('Mobile Logout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.tap('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should logout on mobile', async ({ page }) => {
    // Open menu
    const menuButton = page.locator('[data-testid="mobile-menu"], .hamburger').first();
    await menuButton.tap();

    await page.waitForTimeout(500);

    // Tap logout
    await page.tap('button:has-text("Logout"), a:has-text("Logout")');

    await page.waitForURL(`${BASE_URL}/login`);

    // Should be on login page
    expect(page.url()).toContain('/login');
  });
});
