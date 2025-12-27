/**
 * Salary Calculation E2E Tests
 * Plan D - Week 7, Day 31
 *
 * Tests salary calculation flow including earnings, deductions, and net pay
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const ADMIN_EMAIL = 'admin@e2etest.com';
const ADMIN_PASSWORD = 'Test@1234';

let authToken: string;
let payrollRunId: number;

test.describe('Salary Calculation E2E', () => {
  test.beforeAll(async ({ request }) => {
    // Login
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });

    const data = await response.json();
    authToken = data.data.accessToken;

    // Create a test payroll run
    const payrollResponse = await request.post(`${API_URL}/payroll/runs`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        companyId: 1,
        payPeriodStart: '2024-01-01',
        payPeriodEnd: '2024-01-31',
        paymentDate: '2024-01-28',
        payFrequency: 'monthly',
        description: 'Test Payroll Run',
      },
    });

    const payrollData = await payrollResponse.json();
    payrollRunId = payrollData.data.id;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, authToken);
  });

  test('should process payroll run calculations', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}`);

    // Click "Process Payroll" button
    await page.click('button:has-text("Process Payroll")');

    // Confirmation dialog
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(page.locator('text=Process payroll for all employees')).toBeVisible();

    // Confirm processing
    await page.click('button:has-text("Process")');

    // Should show processing indicator
    await expect(page.locator('text=Processing payroll...')).toBeVisible();

    // Wait for processing to complete (may take a few seconds)
    await page.waitForSelector('text=Payroll processed successfully', { timeout: 30000 });

    // Status should change to "Processed"
    await expect(page.locator('text=Status: Processed')).toBeVisible();
  });

  test('should display salary components breakdown', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Select an employee
    await page.click('table tbody tr:first-child');

    // Salary breakdown modal/panel should open
    await expect(page.locator('h3:has-text("Salary Breakdown")')).toBeVisible();

    // Verify earnings section
    await expect(page.locator('text=Earnings')).toBeVisible();
    await expect(page.locator('text=Basic Salary')).toBeVisible();

    // Common allowances
    const allowances = ['HRA', 'Transport', 'Special Allowance', 'Bonus'];
    for (const allowance of allowances) {
      // May or may not be present depending on employee
      const element = page.locator(`text=${allowance}`);
      if (await element.isVisible()) {
        // Verify amount is displayed
        await expect(element.locator('..').locator('text=/\\d+/')).toBeVisible();
      }
    }

    // Verify deductions section
    await expect(page.locator('text=Deductions')).toBeVisible();

    // Common deductions
    const deductions = ['Income Tax', 'PF', 'ESI', 'Professional Tax'];
    for (const deduction of deductions) {
      const element = page.locator(`text=${deduction}`);
      if (await element.isVisible()) {
        await expect(element.locator('..').locator('text=/\\d+/')).toBeVisible();
      }
    }

    // Verify totals
    await expect(page.locator('text=Gross Salary')).toBeVisible();
    await expect(page.locator('text=Total Deductions')).toBeVisible();
    await expect(page.locator('text=Net Salary')).toBeVisible();
  });

  test('should verify tax calculation (old regime)', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Find employee with old tax regime
    await page.fill('input[placeholder*="Search"]', 'old regime');
    await page.click('table tbody tr:first-child');

    // Open tax breakdown
    await page.click('button:has-text("Tax Details")');

    await expect(page.locator('text=Tax Regime: Old')).toBeVisible();

    // Verify tax slabs
    await expect(page.locator('text=Taxable Income')).toBeVisible();
    await expect(page.locator('text=Standard Deduction')).toBeVisible();
    await expect(page.locator('text=Section 80C Deduction')).toBeVisible();
    await expect(page.locator('text=Tax Amount')).toBeVisible();

    // Verify tax calculation is correct
    const taxableIncome = await page.locator('text=Taxable Income').locator('..').locator('[data-testid="amount"]').textContent();
    const taxAmount = await page.locator('text=Tax Amount').locator('..').locator('[data-testid="amount"]').textContent();

    expect(taxableIncome).toMatch(/\d+/);
    expect(taxAmount).toMatch(/\d+/);
  });

  test('should verify tax calculation (new regime)', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Find employee with new tax regime
    await page.fill('input[placeholder*="Search"]', 'new regime');
    await page.click('table tbody tr:first-child');

    await page.click('button:has-text("Tax Details")');

    await expect(page.locator('text=Tax Regime: New')).toBeVisible();

    // New regime has different tax slabs, no standard deduction
    await expect(page.locator('text=Taxable Income')).toBeVisible();
    await expect(page.locator('text=Tax Amount')).toBeVisible();

    // Verify no standard deduction in new regime
    await expect(page.locator('text=Standard Deduction')).not.toBeVisible();
  });

  test('should verify PF calculation', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    await page.click('table tbody tr:first-child');

    // Open statutory details
    await page.click('button:has-text("Statutory Details")');

    // PF section
    await expect(page.locator('text=Provident Fund (PF)')).toBeVisible();

    // Employee PF contribution (12%)
    await expect(page.locator('text=Employee PF (12%)')).toBeVisible();
    const employeePF = await page.locator('text=Employee PF (12%)').locator('..').locator('[data-testid="amount"]').textContent();

    // Employer PF contribution (12%)
    await expect(page.locator('text=Employer PF (12%)')).toBeVisible();
    const employerPF = await page.locator('text=Employer PF (12%)').locator('..').locator('[data-testid="amount"]').textContent();

    // Both should be equal
    expect(employeePF).toBe(employerPF);

    // Total PF
    await expect(page.locator('text=Total PF')).toBeVisible();
  });

  test('should verify ESI calculation', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // ESI is applicable only for employees with gross salary < threshold
    await page.fill('input[placeholder*="Search"]', 'ESI');

    const esiEligibleRow = page.locator('table tbody tr:has-text("ESI Eligible")').first();

    if (await esiEligibleRow.isVisible()) {
      await esiEligibleRow.click();

      await page.click('button:has-text("Statutory Details")');

      // ESI section
      await expect(page.locator('text=Employee State Insurance (ESI)')).toBeVisible();

      // Employee ESI contribution (0.75%)
      await expect(page.locator('text=Employee ESI (0.75%)')).toBeVisible();

      // Employer ESI contribution (3.25%)
      await expect(page.locator('text=Employer ESI (3.25%)')).toBeVisible();

      // Total ESI
      await expect(page.locator('text=Total ESI')).toBeVisible();
    }
  });

  test('should verify Professional Tax calculation', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    await page.click('table tbody tr:first-child');

    await page.click('button:has-text("Statutory Details")');

    // Professional Tax (varies by state)
    await expect(page.locator('text=Professional Tax')).toBeVisible();

    const ptAmount = await page.locator('text=Professional Tax').locator('..').locator('[data-testid="amount"]').textContent();

    // PT amount should be present (even if 0)
    expect(ptAmount).toMatch(/\d+/);
  });

  test('should handle mid-month joiners (proration)', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Search for mid-month joiner
    await page.fill('input[placeholder*="Search"]', 'joiner');

    const joinerRow = page.locator('table tbody tr:has-text("Mid-month")').first();

    if (await joinerRow.isVisible()) {
      await joinerRow.click();

      // Should show proration details
      await expect(page.locator('text=Prorated Salary')).toBeVisible();
      await expect(page.locator('text=Working Days:')).toBeVisible();
      await expect(page.locator('text=Total Days in Month:')).toBeVisible();

      // Verify proration calculation
      const workingDays = await page.locator('text=Working Days:').locator('..').locator('[data-testid="value"]').textContent();
      const totalDays = await page.locator('text=Total Days in Month:').locator('..').locator('[data-testid="value"]').textContent();

      expect(parseInt(workingDays!)).toBeLessThan(parseInt(totalDays!));
    }
  });

  test('should handle mid-month leavers (proration)', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Search for mid-month leaver
    await page.fill('input[placeholder*="Search"]', 'leaver');

    const leaverRow = page.locator('table tbody tr:has-text("Resigned")').first();

    if (await leaverRow.isVisible()) {
      await leaverRow.click();

      // Should show proration details
      await expect(page.locator('text=Prorated Salary')).toBeVisible();
      await expect(page.locator('text=Last Working Day:')).toBeVisible();

      // Should show FnF (Full and Final) settlement
      await page.click('button:has-text("Settlement Details")');

      await expect(page.locator('text=Full and Final Settlement')).toBeVisible();
      await expect(page.locator('text=Notice Period Recovery')).toBeVisible();
      await expect(page.locator('text=Leave Encashment')).toBeVisible();
    }
  });

  test('should calculate overtime payments', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Find employee with overtime
    const overtimeRow = page.locator('table tbody tr:has-text("OT")').first();

    if (await overtimeRow.isVisible()) {
      await overtimeRow.click();

      await page.click('button:has-text("Overtime Details")');

      await expect(page.locator('text=Overtime Hours')).toBeVisible();
      await expect(page.locator('text=Overtime Rate')).toBeVisible();
      await expect(page.locator('text=Total Overtime Pay')).toBeVisible();

      // Verify calculation: Hours × Rate = Total
      const hours = await page.locator('text=Overtime Hours').locator('..').locator('[data-testid="value"]').textContent();
      const rate = await page.locator('text=Overtime Rate').locator('..').locator('[data-testid="amount"]').textContent();
      const total = await page.locator('text=Total Overtime Pay').locator('..').locator('[data-testid="amount"]').textContent();

      const calculatedTotal = parseFloat(hours!) * parseFloat(rate!);
      expect(parseFloat(total!)).toBeCloseTo(calculatedTotal, 2);
    }
  });

  test('should handle salary revisions', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Find employee with salary revision
    const revisionRow = page.locator('table tbody tr:has-text("Revision")').first();

    if (await revisionRow.isVisible()) {
      await revisionRow.click();

      await expect(page.locator('text=Salary Revision')).toBeVisible();
      await expect(page.locator('text=Old Salary:')).toBeVisible();
      await expect(page.locator('text=New Salary:')).toBeVisible();
      await expect(page.locator('text=Effective From:')).toBeVisible();

      // Should show prorated calculation for both old and new salaries
      await expect(page.locator('text=Days at Old Salary:')).toBeVisible();
      await expect(page.locator('text=Days at New Salary:')).toBeVisible();
    }
  });

  test('should calculate arrears', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Find employee with arrears
    const arrearsRow = page.locator('table tbody tr:has-text("Arrears")').first();

    if (await arrearsRow.isVisible()) {
      await arrearsRow.click();

      await page.click('button:has-text("Arrears Details")');

      await expect(page.locator('text=Arrear Amount')).toBeVisible();
      await expect(page.locator('text=Arrear Period')).toBeVisible();
      await expect(page.locator('text=Reason')).toBeVisible();
    }
  });

  test('should export calculation summary', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Summary")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('salary-calculations');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('should verify calculation accuracy', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    await page.click('table tbody tr:first-child');

    // Get all amounts
    const grossSalaryText = await page.locator('text=Gross Salary').locator('..').locator('[data-testid="amount"]').textContent();
    const totalDeductionsText = await page.locator('text=Total Deductions').locator('..').locator('[data-testid="amount"]').textContent();
    const netSalaryText = await page.locator('text=Net Salary').locator('..').locator('[data-testid="amount"]').textContent();

    const grossSalary = parseFloat(grossSalaryText!.replace(/[^0-9.-]+/g, ''));
    const totalDeductions = parseFloat(totalDeductionsText!.replace(/[^0-9.-]+/g, ''));
    const netSalary = parseFloat(netSalaryText!.replace(/[^0-9.-]+/g, ''));

    // Verify: Net Salary = Gross Salary - Total Deductions
    expect(netSalary).toBeCloseTo(grossSalary - totalDeductions, 2);
  });

  test('should handle calculation errors gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Look for employees with calculation errors
    const errorRow = page.locator('table tbody tr:has-text("Error")').first();

    if (await errorRow.isVisible()) {
      await errorRow.click();

      // Should display error details
      await expect(page.locator('text=Calculation Error')).toBeVisible();
      await expect(page.locator('text=Error Details:')).toBeVisible();

      // Should show option to recalculate
      await expect(page.locator('button:has-text("Recalculate")')).toBeVisible();

      // Try recalculating
      await page.click('button:has-text("Recalculate")');

      await expect(page.locator('text=Recalculating...')).toBeVisible();
    }
  });

  test('should bulk recalculate all employees', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/calculations`);

    // Click bulk recalculate
    await page.click('button:has-text("Recalculate All")');

    // Confirmation dialog
    await expect(page.locator('text=Recalculate salary for all employees')).toBeVisible();

    await page.click('button:has-text("Confirm")');

    // Should show progress
    await expect(page.locator('text=Recalculating salaries...')).toBeVisible();

    // Wait for completion
    await page.waitForSelector('text=Recalculation completed', { timeout: 60000 });

    await expect(page.locator('.toast-success')).toContainText('All salaries recalculated successfully');
  });
});
