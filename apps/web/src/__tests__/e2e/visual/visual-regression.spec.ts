/**
 * Visual Regression Tests
 * Week 7: Visual Regression Testing Baseline
 *
 * Tests:
 * - Capture baseline screenshots of key pages
 * - Compare visual changes across builds
 * - Detect unintended UI changes
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeesPage } from '../pages/EmployeesPage';
import { PayrollPage } from '../pages/PayrollPage';
import { ReportsPage } from '../pages/ReportsPage';

test.describe('Visual Regression - Authentication Pages', () => {
  test('login page should match baseline', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.navigate();
    await loginPage.waitForPageLoad();

    // Assert - Visual comparison
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('login page with error should match baseline', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.navigate();
    await loginPage.login('invalid@test.com', 'wrongpassword');

    // Wait for error to appear
    await page.waitForTimeout(1000);

    // Assert
    await expect(page).toHaveScreenshot('login-page-error.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
  });

  test('dashboard page should match baseline', async ({ page }) => {
    // Arrange
    const dashboardPage = new DashboardPage(page);

    // Act
    await dashboardPage.navigate();
    await dashboardPage.waitForPageLoad();

    // Wait for widgets to load
    await page.waitForTimeout(2000);

    // Assert
    await expect(page).toHaveScreenshot('dashboard-page.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [
        // Mask dynamic content like dates/times
        page.locator('text=/\\d{1,2}:\\d{2}/'), // Times
        page.locator('[data-testid="current-time"]'),
      ],
    });
  });

  test('dashboard mobile view should match baseline', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    const dashboardPage = new DashboardPage(page);

    // Act
    await dashboardPage.navigate();
    await dashboardPage.waitForPageLoad();
    await page.waitForTimeout(2000);

    // Assert
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
  });

  test('employees list page should match baseline', async ({ page }) => {
    // Arrange
    const employeesPage = new EmployeesPage(page);

    // Act
    await employeesPage.navigate();
    await employeesPage.waitForEmployeeList();

    // Assert
    await expect(page).toHaveScreenshot('employees-list.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [
        // Mask dynamic employee data that might change
        page.locator('table tbody td:nth-child(1)'), // Employee codes
      ],
    });
  });

  test('employee create form should match baseline', async ({ page }) => {
    // Arrange
    const employeesPage = new EmployeesPage(page);

    // Act
    await employeesPage.navigate();
    await employeesPage.clickAddEmployee();
    await page.waitForTimeout(500);

    // Assert
    await expect(page).toHaveScreenshot('employee-create-form.png', {
      animations: 'disabled',
    });
  });

  test('employees list mobile view should match baseline', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 375, height: 667 });
    const employeesPage = new EmployeesPage(page);

    // Act
    await employeesPage.navigate();
    await employeesPage.waitForEmployeeList();

    // Assert
    await expect(page).toHaveScreenshot('employees-list-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Payroll', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
  });

  test('payslips list page should match baseline', async ({ page }) => {
    // Arrange
    const payrollPage = new PayrollPage(page);

    // Act
    await payrollPage.navigateToPayslips();
    await payrollPage.waitForPayslipsTable();

    // Assert
    await expect(page).toHaveScreenshot('payslips-list.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [
        // Mask dynamic salary amounts
        page.locator('table tbody td:has-text("$")'),
      ],
    });
  });

  test('process payroll page should match baseline', async ({ page }) => {
    // Arrange
    const payrollPage = new PayrollPage(page);

    // Act
    await payrollPage.navigateToProcessPayroll();
    await page.waitForTimeout(500);

    // Assert
    await expect(page).toHaveScreenshot('process-payroll.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Reports', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
  });

  test('reports list page should match baseline', async ({ page }) => {
    // Arrange
    const reportsPage = new ReportsPage(page);

    // Act
    await reportsPage.navigate();
    await reportsPage.waitForReportsTable();

    // Assert
    await expect(page).toHaveScreenshot('reports-list.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [
        // Mask timestamps and dynamic dates
        page.locator('text=/\\d{4}-\\d{2}-\\d{2}/'),
        page.locator('[data-testid="report-date"]'),
      ],
    });
  });

  test('generate report form should match baseline', async ({ page }) => {
    // Arrange
    const reportsPage = new ReportsPage(page);

    // Act
    await reportsPage.navigate();
    await reportsPage.clickGenerateReport();
    await page.waitForTimeout(500);

    // Assert
    await expect(page).toHaveScreenshot('generate-report-form.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Components', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
  });

  test('navigation menu should match baseline', async ({ page }) => {
    // Arrange & Act
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Get navigation element
    const nav = page.locator('nav, [role="navigation"]').first();

    // Assert
    await expect(nav).toHaveScreenshot('navigation-menu.png', {
      animations: 'disabled',
    });
  });

  test('user profile dropdown should match baseline', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Act - Open user menu
    const userMenu = page.locator('button:has-text("Admin"), [data-testid="user-menu"]').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.waitForTimeout(300);

      // Assert
      const dropdown = page.locator('[role="menu"], .dropdown-menu').first();
      await expect(dropdown).toHaveScreenshot('user-dropdown.png', {
        animations: 'disabled',
      });
    } else {
      test.skip();
    }
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
  });

  for (const viewport of viewports) {
    test(`dashboard on ${viewport.name} should match baseline`, async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Act
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Assert
      await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Visual Regression - Theme Variations', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
  });

  test('light theme dashboard should match baseline', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Ensure light theme (if theme toggle exists)
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("Dark")').first();
    if (await themeToggle.isVisible({ timeout: 1000 }).catch(() => false)) {
      // If we see "Dark" button, we're in light mode
      await page.waitForTimeout(500);
    }

    // Assert
    await expect(page).toHaveScreenshot('dashboard-light-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('dark theme dashboard should match baseline', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Switch to dark theme (if theme toggle exists)
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("Dark"), button:has-text("Light")').first();
    if (await themeToggle.isVisible({ timeout: 1000 }).catch(() => false)) {
      await themeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition
    } else {
      test.skip(); // Skip if no theme toggle
    }

    // Assert
    await expect(page).toHaveScreenshot('dashboard-dark-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Error States', () => {
  test('404 page should match baseline', async ({ page }) => {
    // Act
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');

    // Assert
    await expect(page).toHaveScreenshot('404-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('unauthorized access page should match baseline', async ({ page }) => {
    // Act - Try to access admin page without login
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');

    // Assert - Should show error or redirect to login
    await expect(page).toHaveScreenshot('unauthorized-access.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
