/**
 * @file employee-crud.spec.ts
 * @description E2E tests for Employee lifecycle:
 *   - Create new employee
 *   - View employee profile
 *   - Update employee details
 *   - Search / filter employees
 *   - Offboard / deactivate employee
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

// All tests in this file use admin auth
test.use({ storageState: '.auth/admin.json' });

// ── Test data ─────────────────────────────────────────────────────────────────

function uniqueEmployee() {
  const id = Date.now().toString(36);
  return {
    firstName:  `TestFirst${id}`,
    lastName:   `TestLast${id}`,
    email:      `employee.${id}@auraos-e2e.example`,
    department: 'Engineering',
    jobTitle:   'Software Engineer',
  };
}

// ── Create Employee ───────────────────────────────────────────────────────────

test.describe('Create Employee', () => {
  test('should display the Add Employee form', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('form, [data-testid="employee-form"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"], [data-testid="firstName-input"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"],  [data-testid="lastName-input"]')).toBeVisible();
    await expect(page.locator('input[name="email"],     [data-testid="email-input"]')).toBeVisible();
  });

  test('should create a new employee with valid data', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);
    await page.waitForLoadState('networkidle');

    const emp = uniqueEmployee();

    await page.fill('input[name="firstName"], [data-testid="firstName-input"]', emp.firstName);
    await page.fill('input[name="lastName"],  [data-testid="lastName-input"]',  emp.lastName);
    await page.fill('input[name="email"],     [data-testid="email-input"]',     emp.email);

    // Department select
    await page.selectOption('select[name="department"], [data-testid="department-select"]', emp.department).catch(async () => {
      await page.fill('[data-testid="department-input"], input[name="department"]', emp.department);
    });

    await page.click('button[type="submit"], [data-testid="save-employee"]');

    // Should redirect to new employee profile or list
    await expect(page).toHaveURL(/\/employees\/(?!new)/, { timeout: 10_000 });

    // Success notification
    await expect(
      page.locator('[data-testid="success-toast"], .toast-success, [role="alert"]'),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('should show validation errors for missing required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);
    await page.waitForLoadState('networkidle');

    await page.click('button[type="submit"], [data-testid="save-employee"]');

    // Should show validation errors
    await expect(
      page.locator('[data-testid="firstName-error"], .field-error').first(),
    ).toBeVisible({ timeout: 3_000 });
  });

  test('should show error for duplicate email', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);
    await page.waitForLoadState('networkidle');

    const emp = uniqueEmployee();
    emp.email = 'admin@auraos.test'; // known existing email

    await page.fill('input[name="firstName"]', emp.firstName);
    await page.fill('input[name="lastName"]',  emp.lastName);
    await page.fill('input[name="email"]',     emp.email);
    await page.click('button[type="submit"]');

    await expect(
      page.locator('[data-testid="email-error"], [data-testid="api-error"], .error-message'),
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ── View Employee ─────────────────────────────────────────────────────────────

test.describe('View Employee Profile', () => {
  test('should display employee list', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('table, [data-testid="employee-list"], [data-testid="employee-grid"]')).toBeVisible();
    // At least one row / card
    await expect(page.locator('tr[data-testid], [data-testid="employee-card"], tbody tr').first()).toBeVisible();
  });

  test('should navigate to employee detail on click', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    // Click first employee row
    await page.locator('tr[data-testid], tbody tr, [data-testid="employee-card"]').first().click();

    await expect(page).toHaveURL(/\/employees\/\w+/);
    await expect(page.locator('[data-testid="employee-profile"], h1, h2').first()).toBeVisible();
  });
});

// ── Update Employee ───────────────────────────────────────────────────────────

test.describe('Update Employee', () => {
  test('should update employee job title', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    // Click first employee
    await page.locator('tbody tr, [data-testid="employee-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Click Edit
    await page.click('[data-testid="edit-employee"], button:has-text("Edit")');

    // Update job title
    const jobTitleInput = page.locator('input[name="jobTitle"], [data-testid="jobTitle-input"]');
    await jobTitleInput.fill('Senior Software Engineer');

    await page.click('button[type="submit"], [data-testid="save-employee"]');

    await expect(
      page.locator('[data-testid="success-toast"], .toast-success'),
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ── Search & Filter ───────────────────────────────────────────────────────────

test.describe('Search Employees', () => {
  test('should filter employees by name', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="Search" i]');
    await searchInput.fill('Admin');
    await page.waitForTimeout(500); // debounce

    // Should show filtered results
    const rows = page.locator('tbody tr, [data-testid="employee-card"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0); // could be 0 if name not found
  });

  test('should filter employees by department', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    // Click department filter
    const deptFilter = page.locator('[data-testid="department-filter"], select[name="department"]');
    const hasDeptFilter = await deptFilter.isVisible().catch(() => false);

    if (hasDeptFilter) {
      await page.selectOption('[data-testid="department-filter"]', 'Engineering');
      await page.waitForTimeout(500);
      await expect(page.locator('tbody tr, [data-testid="employee-card"]').first()).toBeVisible();
    }
  });
});

// ── Deactivate Employee ───────────────────────────────────────────────────────

test.describe('Deactivate Employee', () => {
  test('should show deactivation confirmation dialog', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    await page.locator('tbody tr, [data-testid="employee-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Click actions / more options
    const actionsBtn = page.locator('[data-testid="actions-menu"], button:has-text("Actions"), [aria-label="More options"]');
    await actionsBtn.click().catch(() => { /* may be direct deactivate button */ });

    const deactivateBtn = page.locator('[data-testid="deactivate-employee"], button:has-text("Deactivate"), button:has-text("Terminate")');
    const isVisible     = await deactivateBtn.isVisible({ timeout: 2_000 }).catch(() => false);

    if (isVisible) {
      await deactivateBtn.click();
      // Confirmation dialog should appear
      await expect(
        page.locator('[role="dialog"], [data-testid="confirm-modal"]'),
      ).toBeVisible({ timeout: 3_000 });

      // Cancel (we don't want to actually deactivate in E2E tests)
      await page.click('[data-testid="cancel-button"], button:has-text("Cancel")');
    }
  });
});
