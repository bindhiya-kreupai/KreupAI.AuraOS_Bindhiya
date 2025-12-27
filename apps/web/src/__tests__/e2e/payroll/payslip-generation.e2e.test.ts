/**
 * Payslip Generation E2E Tests
 * Plan D - Week 7, Day 31
 *
 * Tests payslip generation, PDF creation, and distribution
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

const ADMIN_EMAIL = 'admin@e2etest.com';
const ADMIN_PASSWORD = 'Test@1234';
const EMPLOYEE_EMAIL = 'employee@e2etest.com';
const EMPLOYEE_PASSWORD = 'Test@1234';

let authToken: string;
let employeeToken: string;
let payrollRunId: number;

test.describe('Payslip Generation E2E', () => {
  test.beforeAll(async ({ request }) => {
    // Admin login
    const adminResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });

    const adminData = await adminResponse.json();
    authToken = adminData.data.accessToken;

    // Employee login
    const empResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: EMPLOYEE_EMAIL,
        password: EMPLOYEE_PASSWORD,
      },
    });

    const empData = await empResponse.json();
    employeeToken = empData.data.accessToken;

    // Create and process payroll run
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
        status: 'processed',
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

  test('should generate payslips for all employees', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}`);

    // Click "Generate Payslips" button
    await page.click('button:has-text("Generate Payslips")');

    // Confirmation dialog
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(page.locator('text=Generate payslips for all employees')).toBeVisible();

    // Confirm generation
    await page.click('button:has-text("Generate")');

    // Should show progress indicator
    await expect(page.locator('text=Generating payslips...')).toBeVisible();

    // Wait for completion
    await page.waitForSelector('text=Payslips generated successfully', { timeout: 60000 });

    await expect(page.locator('.toast-success')).toContainText('payslips generated');

    // Navigate to payslips tab
    await page.click('a:has-text("Payslips")');

    // Verify payslips list is populated
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('should view individual payslip', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    // Click on first payslip
    await page.click('table tbody tr:first-child button:has-text("View")');

    // Payslip viewer should open
    await expect(page.locator('[data-testid="payslip-viewer"]')).toBeVisible();

    // Verify payslip sections
    await expect(page.locator('text=Employee Details')).toBeVisible();
    await expect(page.locator('text=Earnings')).toBeVisible();
    await expect(page.locator('text=Deductions')).toBeVisible();
    await expect(page.locator('text=Net Salary')).toBeVisible();

    // Verify company logo/branding
    await expect(page.locator('img[alt="Company Logo"]')).toBeVisible();

    // Verify pay period
    await expect(page.locator('text=/January 2024|Jan 2024/')).toBeVisible();
  });

  test('should download payslip PDF', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    // Click download button for first payslip
    const downloadPromise = page.waitForEvent('download');
    await page.click('table tbody tr:first-child button:has-text("Download")');

    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toContain('payslip');
    expect(download.suggestedFilename()).toContain('.pdf');

    // Save to temp directory for verification
    const filePath = path.join(__dirname, 'downloads', download.suggestedFilename());
    await download.saveAs(filePath);

    // Verify file exists and has content
    expect(fs.existsSync(filePath)).toBeTruthy();
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);

    // Cleanup
    fs.unlinkSync(filePath);
  });

  test('should verify payslip PDF content', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    await page.click('table tbody tr:first-child button:has-text("View")');

    // Wait for PDF to render
    await page.waitForTimeout(2000);

    // Verify payslip contains required information
    const payslipContent = await page.locator('[data-testid="payslip-viewer"]').textContent();

    // Employee information
    expect(payslipContent).toContain('Employee ID');
    expect(payslipContent).toContain('Employee Name');
    expect(payslipContent).toContain('Department');
    expect(payslipContent).toContain('Designation');

    // Pay period information
    expect(payslipContent).toContain('Pay Period');
    expect(payslipContent).toContain('Payment Date');

    // Salary components
    expect(payslipContent).toContain('Basic Salary');
    expect(payslipContent).toContain('Gross Salary');
    expect(payslipContent).toContain('Total Deductions');
    expect(payslipContent).toContain('Net Salary');

    // Bank details
    expect(payslipContent).toContain('Bank');
    expect(payslipContent).toContain('Account Number');
  });

  test('should bulk download payslips', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    // Select multiple payslips
    await page.check('table thead input[type="checkbox"]'); // Select all

    // Click bulk download
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Selected")');

    const download = await downloadPromise;

    // Should download a ZIP file with all payslips
    expect(download.suggestedFilename()).toContain('payslips');
    expect(download.suggestedFilename()).toContain('.zip');
  });

  test('should email payslip to employee', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    // Click email button for first payslip
    await page.click('table tbody tr:first-child button:has-text("Email")');

    // Email confirmation dialog
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(page.locator('text=Send payslip via email')).toBeVisible();

    // Verify recipient email is shown
    await expect(page.locator('input[name="recipientEmail"]')).toHaveValue(/@.*\.com/);

    // Optionally add CC
    await page.fill('input[name="cc"]', 'hr@company.com');

    // Add custom message
    await page.fill('textarea[name="message"]', 'Please find your payslip for January 2024.');

    // Send email
    await page.click('button:has-text("Send Email")');

    await expect(page.locator('.toast-success')).toContainText('Payslip sent successfully');
  });

  test('should bulk email payslips to all employees', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    // Click bulk email
    await page.click('button:has-text("Email All")');

    // Confirmation dialog
    await expect(page.locator('text=Send payslips to all employees')).toBeVisible();

    // Show email preview
    await expect(page.locator('text=Email Template')).toBeVisible();
    await expect(page.locator('text=Subject:')).toBeVisible();
    await expect(page.locator('text=Body:')).toBeVisible();

    // Customize email template
    await page.fill('input[name="subject"]', 'Your Salary Slip for January 2024');
    await page.fill('textarea[name="body"]', 'Dear Employee,\n\nPlease find attached your salary slip.');

    // Send emails
    await page.click('button:has-text("Send to All")');

    // Should show progress
    await expect(page.locator('text=Sending emails...')).toBeVisible();

    // Wait for completion
    await page.waitForSelector('text=All emails sent successfully', { timeout: 60000 });
  });

  test('should print payslip', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    await page.click('table tbody tr:first-child button:has-text("View")');

    // Click print button
    await page.click('button:has-text("Print")');

    // Print dialog should be triggered (browser native)
    // In test environment, we verify the print CSS is applied
    const printStyles = await page.evaluate(() => {
      const printStylesheet = Array.from(document.styleSheets).find(
        sheet => sheet.media.mediaText.includes('print')
      );
      return printStylesheet !== undefined;
    });

    expect(printStyles).toBeTruthy();
  });

  test('should filter payslips by department', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    // Open department filter
    await page.click('button:has-text("Department")');

    // Select a department
    await page.click('label:has-text("Engineering") input[type="checkbox"]');

    // Apply filter
    await page.click('button:has-text("Apply")');

    // All visible payslips should be from Engineering department
    const rows = page.locator('table tbody tr');
    const count = await rows.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(rows.nth(i)).toContainText('Engineering');
    }
  });

  test('should search payslips by employee name', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    // Enter search term
    await page.fill('input[placeholder*="Search"]', 'John');

    // Wait for search results
    await page.waitForTimeout(500);

    // Should show filtered results
    const firstRow = page.locator('table tbody tr:first-child');
    const rowText = await firstRow.textContent();

    expect(rowText).toContain('John');
  });

  test('should regenerate payslip with updated data', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    // Find a payslip
    await page.click('table tbody tr:first-child [aria-label="Actions"]');

    // Click regenerate option
    await page.click('button:has-text("Regenerate")');

    // Confirmation
    await expect(page.locator('text=Regenerate payslip with latest data')).toBeVisible();

    await page.click('button:has-text("Regenerate")');

    await expect(page.locator('.toast-success')).toContainText('Payslip regenerated');
  });

  test('should access payslip from employee portal', async ({ page }) => {
    // Logout admin and login as employee
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
    });

    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, employeeToken);

    // Navigate to my payslips
    await page.goto(`${BASE_URL}/my-profile/payslips`);

    // Should see list of own payslips
    await expect(page.locator('h1')).toContainText('My Payslips');
    await expect(page.locator('table tbody tr').first()).toBeVisible();

    // View latest payslip
    await page.click('table tbody tr:first-child button:has-text("View")');

    await expect(page.locator('[data-testid="payslip-viewer"]')).toBeVisible();

    // Download payslip
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('payslip');
  });

  test('should verify payslip portal accessibility', async ({ page }) => {
    // Login as employee
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, employeeToken);

    await page.goto(`${BASE_URL}/my-profile/payslips`);

    // Employee should NOT be able to see other employees' payslips
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    // Should be redirected or show access denied
    await expect(
      page.locator('text=/Access Denied|Unauthorized|403/')
    ).toBeVisible();
  });

  test('should handle payslip generation errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}`);

    // Try to generate payslips before processing payroll
    // (This assumes there's a draft payroll run)
    await page.click('button:has-text("Generate Payslips")');

    // Should show validation error
    await expect(
      page.locator('text=/Please process payroll first|Payroll not processed/')
    ).toBeVisible();
  });

  test('should display generation progress for large payroll runs', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}`);

    await page.click('button:has-text("Generate Payslips")');
    await page.click('button:has-text("Generate")');

    // Should show progress bar
    await expect(page.locator('[role="progressbar"]')).toBeVisible();

    // Should show percentage
    await expect(page.locator('text=/%/')).toBeVisible();

    // Should show count (e.g., "50/100 payslips generated")
    await expect(page.locator('text=/\\d+\\/\\d+ payslips/')).toBeVisible();
  });

  test('should customize payslip template', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings/payslip-template`);

    // Upload company logo
    const logoInput = page.locator('input[type="file"][name="companyLogo"]');
    await logoInput.setInputFiles(path.join(__dirname, 'test-assets', 'logo.png'));

    // Customize header text
    await page.fill('input[name="companyName"]', 'ACME Corporation');
    await page.fill('input[name="companyAddress"]', '123 Business St, City');

    // Customize footer
    await page.fill('textarea[name="footerText"]', 'This is a computer-generated payslip.');

    // Select color scheme
    await page.selectOption('select[name="colorScheme"]', 'blue');

    // Save template
    await page.click('button:has-text("Save Template")');

    await expect(page.locator('.toast-success')).toContainText('Template saved');

    // Preview template
    await page.click('button:has-text("Preview")');

    await expect(page.locator('[data-testid="template-preview"]')).toBeVisible();
  });

  test('should export payslips data to Excel', async ({ page }) => {
    await page.goto(`${BASE_URL}/payroll/${payrollRunId}/payslips`);

    // Click export to Excel
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export to Excel")');

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('payslips');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });
});
