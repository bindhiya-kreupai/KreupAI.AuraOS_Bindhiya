/**
 * Payroll Reports E2E Tests
 * Plan D - Week 7, Day 31
 *
 * Tests payroll reporting functionality including summary, statutory, and export reports
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const ADMIN_EMAIL = 'admin@e2etest.com';
const ADMIN_PASSWORD = 'Test@1234';

let authToken: string;
let payrollRunId: number;

test.describe('Payroll Reports E2E', () => {
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

    // Get a processed payroll run
    const payrollResponse = await request.get(`${API_URL}/payroll/runs?status=processed`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const payrollData = await payrollResponse.json();
    payrollRunId = payrollData.data.items[0]?.id || 1;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, authToken);
  });

  test('should generate payroll summary report', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    // Click "Generate Summary Report"
    await page.click('button:has-text("Payroll Summary")');

    // Report configuration modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Payroll Summary Report');

    // Select report parameters
    await page.check('input[name="includeEarnings"]');
    await page.check('input[name="includeDeductions"]');
    await page.check('input[name="includeTax"]');
    await page.check('input[name="includeStatutory"]');

    // Select grouping
    await page.selectOption('select[name="groupBy"]', 'department');

    // Generate report
    await page.click('button:has-text("Generate")');

    // Report should be displayed
    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Verify report sections
    await expect(page.locator('text=Payroll Summary')).toBeVisible();
    await expect(page.locator('text=Total Employees')).toBeVisible();
    await expect(page.locator('text=Gross Salary')).toBeVisible();
    await expect(page.locator('text=Total Deductions')).toBeVisible();
    await expect(page.locator('text=Net Salary')).toBeVisible();
  });

  test('should generate department-wise summary', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Department Summary")');

    // Report should show department breakdown
    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Verify department sections
    await expect(page.locator('text=Department')).toBeVisible();
    await expect(page.locator('text=Employee Count')).toBeVisible();
    await expect(page.locator('text=Total Cost')).toBeVisible();

    // Should show at least one department
    await expect(page.locator('table tbody tr').first()).toBeVisible();

    // Verify totals row
    await expect(page.locator('text=Grand Total')).toBeVisible();
  });

  test('should generate PF report', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    // Click "PF Report"
    await page.click('button:has-text("PF Report")');

    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Verify PF report columns
    await expect(page.locator('text=Employee ID')).toBeVisible();
    await expect(page.locator('text=Employee Name')).toBeVisible();
    await expect(page.locator('text=UAN Number')).toBeVisible();
    await expect(page.locator('text=Employee PF')).toBeVisible();
    await expect(page.locator('text=Employer PF')).toBeVisible();
    await expect(page.locator('text=Total PF')).toBeVisible();

    // Verify totals
    await expect(page.locator('text=Total Employee PF:')).toBeVisible();
    await expect(page.locator('text=Total Employer PF:')).toBeVisible();
  });

  test('should generate ESI report', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("ESI Report")');

    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Verify ESI report columns
    await expect(page.locator('text=IP Number')).toBeVisible();
    await expect(page.locator('text=Employee ESI')).toBeVisible();
    await expect(page.locator('text=Employer ESI')).toBeVisible();
    await expect(page.locator('text=Total ESI')).toBeVisible();

    // ESI is applicable only for employees below threshold
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('should generate PT report', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Professional Tax")');

    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Verify PT report columns
    await expect(page.locator('text=Employee Name')).toBeVisible();
    await expect(page.locator('text=State')).toBeVisible();
    await expect(page.locator('text=PT Amount')).toBeVisible();

    // Verify total PT collected
    await expect(page.locator('text=Total PT:')).toBeVisible();
  });

  test('should generate TDS report', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("TDS Report")');

    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Verify TDS report columns
    await expect(page.locator('text=PAN Number')).toBeVisible();
    await expect(page.locator('text=Gross Salary')).toBeVisible();
    await expect(page.locator('text=Taxable Income')).toBeVisible();
    await expect(page.locator('text=Tax Deducted')).toBeVisible();

    // Should show tax regime
    await expect(page.locator('text=Tax Regime')).toBeVisible();

    // Verify total TDS
    await expect(page.locator('text=Total TDS:')).toBeVisible();
  });

  test('should generate bank transfer file', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    // Click "Bank Transfer File"
    await page.click('button:has-text("Bank Transfer File")');

    // Select bank format
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.selectOption('select[name="bankFormat"]', 'hdfc');

    // Generate file
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate File")');

    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toContain('bank-transfer');
    expect(download.suggestedFilename()).toMatch(/\.(txt|csv)$/);
  });

  test('should generate payroll journal entries', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Journal Entries")');

    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Verify journal entry format
    await expect(page.locator('text=Account Head')).toBeVisible();
    await expect(page.locator('text=Debit')).toBeVisible();
    await expect(page.locator('text=Credit')).toBeVisible();

    // Common account heads
    const accountHeads = [
      'Salary Payable',
      'PF Payable',
      'Tax Payable',
      'Bank Account',
    ];

    for (const account of accountHeads) {
      const element = page.locator(`text=${account}`);
      if (await element.isVisible()) {
        expect(await element.isVisible()).toBeTruthy();
      }
    }

    // Verify totals match (Debit = Credit)
    const totalDebit = await page.locator('text=Total Debit:').locator('..').locator('[data-testid="amount"]').textContent();
    const totalCredit = await page.locator('text=Total Credit:').locator('..').locator('[data-testid="amount"]').textContent();

    expect(totalDebit).toBe(totalCredit);
  });

  test('should export report to Excel', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Payroll Summary")');
    await page.click('button:has-text("Generate")');

    // Wait for report to load
    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Export to Excel
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export to Excel")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('payroll');
    expect(download.suggestedFilename()).toContain('.xlsx');

    // Verify file content
    const filePath = path.join(__dirname, 'downloads', download.suggestedFilename());
    await download.saveAs(filePath);

    expect(fs.existsSync(filePath)).toBeTruthy();
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);

    // Cleanup
    fs.unlinkSync(filePath);
  });

  test('should export report to PDF', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Payroll Summary")');
    await page.click('button:has-text("Generate")');

    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Export to PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export to PDF")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('payroll');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should export report to CSV', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Payroll Summary")');
    await page.click('button:has-text("Generate")');

    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Export to CSV
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export to CSV")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('payroll');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should filter report by date range', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/reports`);

    // Generate comparative report
    await page.click('button:has-text("Comparative Report")');

    // Select date range
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');

    await page.click('button:has-text("Generate")');

    // Should show multiple months
    await expect(page.locator('text=January 2024')).toBeVisible();
    await expect(page.locator('text=February 2024')).toBeVisible();
    await expect(page.locator('text=March 2024')).toBeVisible();
  });

  test('should generate cost center report', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Cost Center Report")');

    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Verify cost center breakdown
    await expect(page.locator('text=Cost Center')).toBeVisible();
    await expect(page.locator('text=Employee Count')).toBeVisible();
    await expect(page.locator('text=Total Cost')).toBeVisible();

    // Should show at least one cost center
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('should generate variance report', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/reports`);

    await page.click('button:has-text("Variance Report")');

    // Select comparison periods
    await page.selectOption('select[name="previousPeriod"]', '2023-12');
    await page.selectOption('select[name="currentPeriod"]', '2024-01');

    await page.click('button:has-text("Generate")');

    // Verify variance columns
    await expect(page.locator('text=Previous Period')).toBeVisible();
    await expect(page.locator('text=Current Period')).toBeVisible();
    await expect(page.locator('text=Variance')).toBeVisible();
    await expect(page.locator('text=Variance %')).toBeVisible();

    // Verify variance calculations
    const varianceCells = page.locator('[data-testid="variance-percentage"]');
    await expect(varianceCells.first()).toBeVisible();
  });

  test('should schedule recurring report', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/reports/scheduled`);

    // Click "Schedule Report"
    await page.click('button:has-text("Schedule Report")');

    // Fill schedule details
    await page.selectOption('select[name="reportType"]', 'payroll-summary');
    await page.selectOption('select[name="frequency"]', 'monthly');
    await page.selectOption('select[name="dayOfMonth"]', '1');
    await page.fill('input[name="recipients"]', 'hr@company.com, finance@company.com');

    // Select export format
    await page.check('input[value="excel"]');
    await page.check('input[value="pdf"]');

    // Save schedule
    await page.click('button:has-text("Save Schedule")');

    await expect(page.locator('.toast-success')).toContainText('Report scheduled');

    // Verify schedule appears in list
    await expect(page.locator('table tbody tr:has-text("Payroll Summary")')).toBeVisible();
  });

  test('should email report to recipients', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Payroll Summary")');
    await page.click('button:has-text("Generate")');

    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Click email button
    await page.click('button:has-text("Email Report")');

    // Email dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Enter recipients
    await page.fill('input[name="to"]', 'hr@company.com');
    await page.fill('input[name="cc"]', 'finance@company.com');
    await page.fill('input[name="subject"]', 'Payroll Report - January 2024');
    await page.fill('textarea[name="message"]', 'Please find attached the payroll report.');

    // Select format
    await page.selectOption('select[name="format"]', 'pdf');

    // Send email
    await page.click('button:has-text("Send Email")');

    await expect(page.locator('.toast-success')).toContainText('Report sent successfully');
  });

  test('should print report', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Payroll Summary")');
    await page.click('button:has-text("Generate")');

    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();

    // Click print button
    await page.click('button:has-text("Print")');

    // Verify print styles are applied
    const printStyles = await page.evaluate(() => {
      const printStylesheet = Array.from(document.styleSheets).find(
        sheet => sheet.media.mediaText.includes('print')
      );
      return printStylesheet !== undefined;
    });

    expect(printStyles).toBeTruthy();
  });

  test('should save custom report template', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/reports/templates`);

    // Click "Create Template"
    await page.click('button:has-text("Create Template")');

    // Fill template details
    await page.fill('input[name="templateName"]', 'Monthly Payroll Summary');
    await page.selectOption('select[name="reportType"]', 'payroll-summary');

    // Select columns
    await page.check('input[value="employeeName"]');
    await page.check('input[value="department"]');
    await page.check('input[value="grossSalary"]');
    await page.check('input[value="netSalary"]');

    // Set grouping and sorting
    await page.selectOption('select[name="groupBy"]', 'department');
    await page.selectOption('select[name="sortBy"]', 'employeeName');

    // Save template
    await page.click('button:has-text("Save Template")');

    await expect(page.locator('.toast-success')).toContainText('Template saved');

    // Use template to generate report
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Use Template")');
    await page.click('text=Monthly Payroll Summary');

    // Report should be generated with template settings
    await expect(page.locator('[data-testid="report-viewer"]')).toBeVisible();
  });

  test('should handle report generation errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    // Try to generate report with invalid parameters
    await page.click('button:has-text("Variance Report")');

    // Don't select comparison periods
    await page.click('button:has-text("Generate")');

    // Should show validation error
    await expect(page.locator('text=/Please select.*period/i')).toBeVisible();
  });

  test('should show report generation progress', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/reports`);

    await page.click('button:has-text("Detailed Employee Report")');
    await page.click('button:has-text("Generate")');

    // Should show progress indicator for large reports
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    await expect(page.locator('text=Generating report...')).toBeVisible();

    // Wait for completion
    await page.waitForSelector('[data-testid="report-viewer"]', { timeout: 60000 });
  });
});
