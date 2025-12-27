/**
 * Payroll Page Object Model
 * Week 7: Secondary E2E Flows
 *
 * Handles all interactions with the payroll module:
 * - View payslips
 * - Process payroll
 * - Download payslips
 * - View payroll history
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface PayslipData {
  employeeId?: string;
  employeeName?: string;
  month: string;
  year: string;
  basicSalary?: number;
  allowances?: number;
  deductions?: number;
  netSalary?: number;
}

export interface PayrollProcessData {
  month: string;
  year: string;
  departmentId?: string;
  employeeIds?: string[];
  processType: 'full' | 'partial' | 'correction';
}

export class PayrollPage extends BasePage {
  // Locators - Payslip View
  private payslipsListTable: Locator;
  private viewPayslipButton: Locator;
  private downloadPayslipButton: Locator;
  private monthFilter: Locator;
  private yearFilter: Locator;
  private searchInput: Locator;

  // Locators - Process Payroll
  private processPayrollButton: Locator;
  private monthSelect: Locator;
  private yearSelect: Locator;
  private departmentSelect: Locator;
  private processTypeSelect: Locator;
  private startProcessButton: Locator;
  private confirmProcessButton: Locator;
  private cancelButton: Locator;

  // Locators - Payslip Details
  private payslipModal: Locator;
  private basicSalaryField: Locator;
  private allowancesField: Locator;
  private deductionsField: Locator;
  private netSalaryField: Locator;
  private closeModalButton: Locator;

  // Locators - Process Status
  private processingStatusModal: Locator;
  private progressBar: Locator;
  private processedCountText: Locator;
  private processCompleteMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Payslip view locators
    this.payslipsListTable = page.locator('table[data-testid="payslips-table"], table:has(th:has-text("Employee"))');
    this.viewPayslipButton = page.locator('button:has-text("View Payslip"), button:has-text("View")');
    this.downloadPayslipButton = page.locator('button:has-text("Download"), button[aria-label*="Download"]');
    this.monthFilter = page.locator('select[name="month"], select[data-testid="month-filter"]');
    this.yearFilter = page.locator('select[name="year"], select[data-testid="year-filter"]');
    this.searchInput = page.locator('input[placeholder*="Search"], input[name="search"]');

    // Process payroll locators
    this.processPayrollButton = page.locator('button:has-text("Process Payroll"), button:has-text("Run Payroll")');
    this.monthSelect = page.locator('select[name="processingMonth"], select[data-testid="process-month"]');
    this.yearSelect = page.locator('select[name="processingYear"], select[data-testid="process-year"]');
    this.departmentSelect = page.locator('select[name="department"], select[data-testid="department-select"]');
    this.processTypeSelect = page.locator('select[name="processType"], select[data-testid="process-type"]');
    this.startProcessButton = page.locator('button[type="submit"]:has-text("Start Processing"), button:has-text("Process")');
    this.confirmProcessButton = page.locator('button:has-text("Confirm"), button:has-text("Yes, Process")');
    this.cancelButton = page.locator('button:has-text("Cancel")');

    // Payslip details locators
    this.payslipModal = page.locator('[role="dialog"]:has-text("Payslip"), div[data-testid="payslip-modal"]');
    this.basicSalaryField = page.locator('text="Basic Salary"').locator('..').locator('span, div').last();
    this.allowancesField = page.locator('text="Allowances"').locator('..').locator('span, div').last();
    this.deductionsField = page.locator('text="Deductions"').locator('..').locator('span, div').last();
    this.netSalaryField = page.locator('text="Net Salary"').locator('..').locator('span, div').last();
    this.closeModalButton = page.locator('button:has-text("Close"), button[aria-label="Close"]');

    // Process status locators
    this.processingStatusModal = page.locator('[role="dialog"]:has-text("Processing"), div[data-testid="processing-modal"]');
    this.progressBar = page.locator('[role="progressbar"], div[data-testid="progress-bar"]');
    this.processedCountText = page.locator('text=/Processed \\d+ of \\d+/');
    this.processCompleteMessage = page.locator('text="Processing Complete", text="Payroll processed successfully"');
  }

  /**
   * Navigate to payroll page
   */
  async navigate() {
    await this.goto('/payroll');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to payslips view
   */
  async navigateToPayslips() {
    await this.goto('/payroll/payslips');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to process payroll page
   */
  async navigateToProcessPayroll() {
    await this.goto('/payroll/process');
    await this.waitForPageLoad();
  }

  /**
   * Filter payslips by month and year
   */
  async filterPayslips(month: string, year: string) {
    if (await this.isElementVisible(this.monthFilter)) {
      await this.selectOption(this.monthFilter, month);
    }
    if (await this.isElementVisible(this.yearFilter)) {
      await this.selectOption(this.yearFilter, year);
    }
    await this.waitForPageLoad();
  }

  /**
   * Search for payslip by employee name or ID
   */
  async searchPayslip(searchTerm: string) {
    await this.fillInput(this.searchInput, searchTerm);
    await this.pressKey('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Get payslip row by employee name or email
   */
  getPayslipRow(identifier: string): Locator {
    return this.page.locator(`tr:has-text("${identifier}")`);
  }

  /**
   * Click view payslip for specific employee
   */
  async clickViewPayslip(employeeIdentifier: string) {
    const row = this.getPayslipRow(employeeIdentifier);
    const viewButton = row.locator('button:has-text("View"), a:has-text("View")');
    await this.clickElement(viewButton);
    await this.waitForElement(this.payslipModal);
  }

  /**
   * View payslip details
   */
  async viewPayslip(employeeIdentifier: string): Promise<PayslipData> {
    await this.clickViewPayslip(employeeIdentifier);

    // Extract payslip data
    const basicSalaryText = await this.getElementText(this.basicSalaryField);
    const allowancesText = await this.getElementText(this.allowancesField);
    const deductionsText = await this.getElementText(this.deductionsField);
    const netSalaryText = await this.getElementText(this.netSalaryField);

    // Parse amounts (assuming format like "$5,000" or "5000")
    const parseAmount = (text: string): number => {
      return parseFloat(text.replace(/[$,]/g, '')) || 0;
    };

    return {
      month: '', // Would be extracted from modal header
      year: '',
      basicSalary: parseAmount(basicSalaryText),
      allowances: parseAmount(allowancesText),
      deductions: parseAmount(deductionsText),
      netSalary: parseAmount(netSalaryText),
    };
  }

  /**
   * Close payslip modal
   */
  async closePayslipModal() {
    await this.clickElement(this.closeModalButton);
    await this.waitForElementToDisappear(this.payslipModal);
  }

  /**
   * Download payslip for employee
   */
  async downloadPayslip(employeeIdentifier: string): Promise<void> {
    const row = this.getPayslipRow(employeeIdentifier);
    const downloadButton = row.locator('button:has-text("Download")');

    // Set up download promise before clicking
    const downloadPromise = this.page.waitForEvent('download');
    await this.clickElement(downloadButton);

    // Wait for download to complete
    const download = await downloadPromise;
    const fileName = download.suggestedFilename();

    // Verify it's a PDF
    if (!fileName.endsWith('.pdf')) {
      throw new Error(`Expected PDF download, got: ${fileName}`);
    }
  }

  /**
   * Click process payroll button
   */
  async clickProcessPayroll() {
    await this.clickElement(this.processPayrollButton);
    await this.waitForPageLoad();
  }

  /**
   * Fill process payroll form
   */
  async fillProcessPayrollForm(data: PayrollProcessData) {
    await this.selectOption(this.monthSelect, data.month);
    await this.selectOption(this.yearSelect, data.year);

    if (data.departmentId && await this.isElementVisible(this.departmentSelect)) {
      await this.selectOption(this.departmentSelect, data.departmentId);
    }

    if (data.processType && await this.isElementVisible(this.processTypeSelect)) {
      await this.selectOption(this.processTypeSelect, data.processType);
    }
  }

  /**
   * Start payroll processing
   */
  async startProcessing() {
    await this.clickElement(this.startProcessButton);
    // Wait for confirmation modal
    await this.page.waitForTimeout(500);
  }

  /**
   * Confirm payroll processing
   */
  async confirmProcessing() {
    await this.clickElement(this.confirmProcessButton);
    await this.waitForElement(this.processingStatusModal);
  }

  /**
   * Wait for payroll processing to complete
   */
  async waitForProcessingComplete(timeout = 60000) {
    await this.waitForElement(this.processCompleteMessage, timeout);
  }

  /**
   * Cancel payroll processing
   */
  async cancelProcessing() {
    await this.clickElement(this.cancelButton);
  }

  /**
   * Process payroll - complete workflow
   */
  async processPayroll(data: PayrollProcessData) {
    await this.navigateToProcessPayroll();
    await this.fillProcessPayrollForm(data);
    await this.startProcessing();
    await this.confirmProcessing();
    await this.waitForProcessingComplete();
    await this.waitForToast('Payroll processed successfully');
  }

  /**
   * Check if payslip exists for employee
   */
  async payslipExists(employeeIdentifier: string, month?: string, year?: string): Promise<boolean> {
    if (month && year) {
      await this.filterPayslips(month, year);
    }
    const row = this.getPayslipRow(employeeIdentifier);
    return await this.isElementVisible(row);
  }

  /**
   * Assert payslip exists
   */
  async assertPayslipExists(employeeIdentifier: string, month?: string, year?: string) {
    if (month && year) {
      await this.filterPayslips(month, year);
    }
    const row = this.getPayslipRow(employeeIdentifier);
    await this.assertElementVisible(row);
  }

  /**
   * Assert payslip does not exist
   */
  async assertPayslipDoesNotExist(employeeIdentifier: string, month?: string, year?: string) {
    if (month && year) {
      await this.filterPayslips(month, year);
    }
    const row = this.getPayslipRow(employeeIdentifier);
    await this.assertElementHidden(row);
  }

  /**
   * Get payslip count
   */
  async getPayslipCount(): Promise<number> {
    const rows = await this.page.locator('table tbody tr').all();
    return rows.length;
  }

  /**
   * Wait for payslips table to load
   */
  async waitForPayslipsTable() {
    await this.waitForElement(this.payslipsListTable);
  }

  /**
   * Assert on payroll page
   */
  async assertOnPayrollPage() {
    await this.assertURLContains('/payroll');
  }

  /**
   * Assert on payslips page
   */
  async assertOnPayslipsPage() {
    await this.assertURLContains('/payroll/payslips');
    await this.assertElementVisible(this.payslipsListTable);
  }

  /**
   * Assert on process payroll page
   */
  async assertOnProcessPayrollPage() {
    await this.assertURLContains('/payroll/process');
    await this.assertElementVisible(this.processPayrollButton);
  }

  /**
   * Get processing progress percentage
   */
  async getProcessingProgress(): Promise<number> {
    if (await this.isElementVisible(this.progressBar)) {
      const ariaValueNow = await this.progressBar.getAttribute('aria-valuenow');
      return ariaValueNow ? parseInt(ariaValueNow, 10) : 0;
    }
    return 0;
  }

  /**
   * Get processed employee count
   */
  async getProcessedCount(): Promise<{ processed: number; total: number }> {
    const text = await this.getElementText(this.processedCountText);
    const match = text.match(/Processed (\d+) of (\d+)/);
    if (match) {
      return {
        processed: parseInt(match[1], 10),
        total: parseInt(match[2], 10),
      };
    }
    return { processed: 0, total: 0 };
  }

  /**
   * Assert payslip amounts are correct
   */
  async assertPayslipAmounts(expected: PayslipData) {
    const actual = await this.viewPayslip(expected.employeeName || '');

    if (expected.basicSalary !== undefined) {
      if (Math.abs(actual.basicSalary! - expected.basicSalary) > 0.01) {
        throw new Error(`Basic salary mismatch: expected ${expected.basicSalary}, got ${actual.basicSalary}`);
      }
    }

    if (expected.netSalary !== undefined) {
      if (Math.abs(actual.netSalary! - expected.netSalary) > 0.01) {
        throw new Error(`Net salary mismatch: expected ${expected.netSalary}, got ${actual.netSalary}`);
      }
    }

    await this.closePayslipModal();
  }

  /**
   * Verify payslip calculation
   */
  async verifyPayslipCalculation(employeeIdentifier: string) {
    const payslip = await this.viewPayslip(employeeIdentifier);

    // Verify net salary = basic salary + allowances - deductions
    const expectedNetSalary = (payslip.basicSalary || 0) + (payslip.allowances || 0) - (payslip.deductions || 0);
    const actualNetSalary = payslip.netSalary || 0;

    if (Math.abs(actualNetSalary - expectedNetSalary) > 0.01) {
      throw new Error(
        `Payslip calculation error: ` +
        `Expected net salary ${expectedNetSalary} ` +
        `(${payslip.basicSalary} + ${payslip.allowances} - ${payslip.deductions}), ` +
        `but got ${actualNetSalary}`
      );
    }

    await this.closePayslipModal();
  }
}
