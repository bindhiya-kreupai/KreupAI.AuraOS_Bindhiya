/**
 * Payroll Run Creation E2E Tests
 * Plan D - Week 7, Day 31
 *
 * Tests the complete payroll run creation and processing flow
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

// Test user credentials
const ADMIN_EMAIL = 'admin@e2etest.com';
const ADMIN_PASSWORD = 'Test@1234';

let authToken: string;

test.describe('Payroll Run Creation E2E', () => {
  test.beforeAll(async ({ request }) => {
    // Login and get auth token
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    authToken = data.data.accessToken;
  });

  test.beforeEach(async ({ page }) => {
    // Set auth token in local storage
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, authToken);
  });

  test('should navigate to payroll module', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Navigate to Payroll module
    await page.click('text=Payroll');

    await expect(page).toHaveURL(/.*\/payroll/);
    await expect(page.locator('h1')).toContainText('Payroll');
  });

  test('should create new payroll run', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    // Click "Create Payroll Run" button
    await page.click('button:has-text("Create Payroll Run")');

    // Modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Create Payroll Run');

    // Fill in payroll run details
    await page.selectOption('select[name="companyId"]', { index: 1 });

    // Select current month
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');

    await page.fill('input[name="payPeriodStart"]', `${year}-${month}-01`);
    await page.fill('input[name="payPeriodEnd"]', `${year}-${month}-30`);
    await page.fill('input[name="paymentDate"]', `${year}-${month}-28`);

    // Select pay frequency
    await page.selectOption('select[name="payFrequency"]', 'monthly');

    // Add description
    await page.fill('textarea[name="description"]', `Payroll for ${month}/${year}`);

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for success notification
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Payroll run created successfully');

    // Verify payroll run appears in list
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('should validate required fields in payroll run creation', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    await page.click('button:has-text("Create Payroll Run")');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]:has-text("Create")');

    // Should show validation errors
    await expect(page.locator('text=Company is required')).toBeVisible();
    await expect(page.locator('text=Pay period start is required')).toBeVisible();
    await expect(page.locator('text=Pay period end is required')).toBeVisible();
  });

  test('should configure payroll run parameters', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    await page.click('button:has-text("Create Payroll Run")');

    // Fill basic details
    await page.selectOption('select[name="companyId"]', { index: 1 });
    await page.fill('input[name="payPeriodStart"]', '2024-01-01');
    await page.fill('input[name="payPeriodEnd"]', '2024-01-31');
    await page.fill('input[name="paymentDate"]', '2024-01-28');

    // Click "Advanced Settings"
    await page.click('button:has-text("Advanced Settings")');

    // Configure parameters
    await page.check('input[name="includeBonuses"]');
    await page.check('input[name="includeOvertim"]');
    await page.check('input[name="calculateTax"]');
    await page.check('input[name="calculatePF"]');
    await page.check('input[name="calculateESI"]');

    // Select tax regime
    await page.selectOption('select[name="defaultTaxRegime"]', 'new');

    // Set proration
    await page.check('input[name="prorateForJoiners"]');
    await page.check('input[name="prorateForLeavers"]');

    await page.click('button[type="submit"]:has-text("Create")');

    await expect(page.locator('.toast-success')).toBeVisible();
  });

  test('should filter employees for payroll run', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    await page.click('button:has-text("Create Payroll Run")');

    // Fill basic details
    await page.selectOption('select[name="companyId"]', { index: 1 });
    await page.fill('input[name="payPeriodStart"]', '2024-01-01');
    await page.fill('input[name="payPeriodEnd"]', '2024-01-31');

    // Click "Filter Employees"
    await page.click('button:has-text("Filter Employees")');

    // Add filters
    await page.selectOption('select[name="departmentFilter"]', { index: 1 });
    await page.selectOption('select[name="employmentTypeFilter"]', 'full-time');
    await page.selectOption('select[name="statusFilter"]', 'active');

    // Apply filters
    await page.click('button:has-text("Apply Filters")');

    // Should show filtered employee count
    await expect(page.locator('text=/\\d+ employees selected/')).toBeVisible();
  });

  test('should view payroll run details', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    // Click on first payroll run in the list
    await page.click('table tbody tr:first-child td:first-child');

    // Should navigate to details page
    await expect(page).toHaveURL(/.*\/payroll\/\d+/);

    // Verify details are displayed
    await expect(page.locator('h1')).toContainText('Payroll Run Details');
    await expect(page.locator('text=Pay Period:')).toBeVisible();
    await expect(page.locator('text=Status:')).toBeVisible();
    await expect(page.locator('text=Total Employees:')).toBeVisible();
  });

  test('should edit payroll run in draft status', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    // Find a draft payroll run
    const draftRow = page.locator('table tbody tr:has-text("Draft")').first();

    // Click edit button
    await draftRow.locator('button[aria-label="Edit"]').click();

    // Modal should open with existing data
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Modify description
    await page.fill('textarea[name="description"]', 'Updated payroll run description');

    // Save changes
    await page.click('button[type="submit"]:has-text("Save")');

    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Payroll run updated');
  });

  test('should delete payroll run in draft status', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    // Find a draft payroll run
    const draftRow = page.locator('table tbody tr:has-text("Draft")').first();

    // Click delete button
    await draftRow.locator('button[aria-label="Delete"]').click();

    // Confirmation dialog should appear
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(page.locator('text=Are you sure you want to delete')).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Delete")');

    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('deleted successfully');
  });

  test('should not allow editing processed payroll run', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    // Find a processed payroll run
    const processedRow = page.locator('table tbody tr:has-text("Processed")').first();

    if (await processedRow.count() > 0) {
      // Edit button should be disabled
      await expect(processedRow.locator('button[aria-label="Edit"]')).toBeDisabled();
    }
  });

  test('should search payroll runs by pay period', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    // Enter search term
    await page.fill('input[placeholder*="Search"]', '2024-01');

    // Wait for search results
    await page.waitForTimeout(500);

    // Should show filtered results
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();

    // All visible rows should contain search term in pay period
    const firstRowText = await rows.first().textContent();
    expect(firstRowText).toContain('2024-01');
  });

  test('should filter payroll runs by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    // Open status filter
    await page.click('button:has-text("Status")');

    // Select "Draft" status
    await page.click('label:has-text("Draft") input[type="checkbox"]');

    // Apply filter
    await page.click('button:has-text("Apply")');

    // All visible rows should have "Draft" status
    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Draft');
    }
  });

  test('should sort payroll runs by payment date', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    // Click on "Payment Date" column header to sort
    await page.click('th:has-text("Payment Date")');

    // Wait for sorting
    await page.waitForTimeout(300);

    // Verify sorting (should be ascending first)
    const firstDate = await page.locator('table tbody tr:first-child td:nth-child(4)').textContent();
    const lastDate = await page.locator('table tbody tr:last-child td:nth-child(4)').textContent();

    // Click again to sort descending
    await page.click('th:has-text("Payment Date")');
    await page.waitForTimeout(300);

    const newFirstDate = await page.locator('table tbody tr:first-child td:nth-child(4)').textContent();
    expect(newFirstDate).toBe(lastDate);
  });

  test('should paginate through payroll runs', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    // Check if pagination is visible
    const pagination = page.locator('[role="navigation"][aria-label="Pagination"]');

    if (await pagination.isVisible()) {
      // Get current page number
      const currentPage = await page.locator('.pagination .active').textContent();
      expect(currentPage).toBe('1');

      // Click next page
      await page.click('button[aria-label="Next page"]');

      // Wait for page change
      await page.waitForTimeout(300);

      // Verify page changed
      const newPage = await page.locator('.pagination .active').textContent();
      expect(newPage).toBe('2');

      // Click previous page
      await page.click('button[aria-label="Previous page"]');
      await page.waitForTimeout(300);

      const backToFirstPage = await page.locator('.pagination .active').textContent();
      expect(backToFirstPage).toBe('1');
    }
  });

  test('should export payroll run list', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');

    // Select Excel format
    await page.click('button:has-text("Excel")');

    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toContain('payroll-runs');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});

test.describe('Payroll Run Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, authToken);
  });

  test('should prevent overlapping pay periods for same company', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    await page.click('button:has-text("Create Payroll Run")');

    // Create payroll run with overlapping period
    await page.selectOption('select[name="companyId"]', { index: 1 });
    await page.fill('input[name="payPeriodStart"]', '2024-01-15');
    await page.fill('input[name="payPeriodEnd"]', '2024-01-31');

    await page.click('button[type="submit"]:has-text("Create")');

    // Should show validation error if overlapping
    // (This test assumes there's already a payroll run for this period)
    await expect(page.locator('text=/overlapping|already exists/i')).toBeVisible();
  });

  test('should validate pay period end is after start', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    await page.click('button:has-text("Create Payroll Run")');

    await page.selectOption('select[name="companyId"]', { index: 1 });
    await page.fill('input[name="payPeriodStart"]', '2024-01-31');
    await page.fill('input[name="payPeriodEnd"]', '2024-01-01');

    await page.click('button[type="submit"]:has-text("Create")');

    await expect(page.locator('text=/end date must be after start date/i')).toBeVisible();
  });

  test('should validate payment date is after pay period', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll`);

    await page.click('button:has-text("Create Payroll Run")');

    await page.selectOption('select[name="companyId"]', { index: 1 });
    await page.fill('input[name="payPeriodStart"]', '2024-01-01');
    await page.fill('input[name="payPeriodEnd"]', '2024-01-31');
    await page.fill('input[name="paymentDate"]', '2023-12-31');

    await page.click('button[type="submit"]:has-text("Create")');

    await expect(page.locator('text=/payment date must be after/i')).toBeVisible();
  });
});
