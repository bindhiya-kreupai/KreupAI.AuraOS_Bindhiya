/**
 * Reports Page Object Model
 * Week 7: Secondary E2E Flows
 *
 * Handles all interactions with the reports module:
 * - Generate reports
 * - Download reports
 * - Schedule reports
 * - View report history
 */

import type { Page, Locator, Download } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ReportConfig {
  reportType: string; // 'employee', 'payroll', 'attendance', 'leave', 'performance'
  format: 'PDF' | 'Excel' | 'CSV';
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: {
    departmentId?: string;
    locationId?: string;
    employeeIds?: string[];
  };
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    recipients?: string[];
  };
}

export class ReportsPage extends BasePage {
  // Locators - Report List
  private reportsListTable: Locator;
  private generateReportButton: Locator;
  private searchInput: Locator;
  private filterByTypeSelect: Locator;
  private filterByStatusSelect: Locator;

  // Locators - Generate Report Form
  private reportTypeSelect: Locator;
  private formatSelect: Locator;
  private dateFromInput: Locator;
  private dateToInput: Locator;
  private departmentSelect: Locator;
  private locationSelect: Locator;
  private generateButton: Locator;
  private cancelButton: Locator;

  // Locators - Schedule Report
  private scheduleReportCheckbox: Locator;
  private frequencySelect: Locator;
  private timeInput: Locator;
  private recipientsInput: Locator;
  private addRecipientButton: Locator;
  private scheduleButton: Locator;

  // Locators - Report Actions
  private downloadButton: Locator;
  private viewButton: Locator;
  private deleteButton: Locator;
  private confirmDeleteButton: Locator;

  // Locators - Status and Progress
  private generatingStatusBadge: Locator;
  private completedStatusBadge: Locator;
  private failedStatusBadge: Locator;
  private progressBar: Locator;

  constructor(page: Page) {
    super(page);

    // Report list locators
    this.reportsListTable = page.locator('table[data-testid="reports-table"], table:has(th:has-text("Report"))');
    this.generateReportButton = page.locator('button:has-text("Generate Report"), button:has-text("New Report")');
    this.searchInput = page.locator('input[placeholder*="Search"], input[name="search"]');
    this.filterByTypeSelect = page.locator('select[name="reportType"], select[data-testid="type-filter"]');
    this.filterByStatusSelect = page.locator('select[name="status"], select[data-testid="status-filter"]');

    // Generate report form locators
    this.reportTypeSelect = page.locator('select[name="reportType"], select[data-testid="report-type"]');
    this.formatSelect = page.locator('select[name="format"], select[data-testid="format-select"]');
    this.dateFromInput = page.locator('input[name="dateFrom"], input[data-testid="date-from"]');
    this.dateToInput = page.locator('input[name="dateTo"], input[data-testid="date-to"]');
    this.departmentSelect = page.locator('select[name="department"], select[data-testid="department-select"]');
    this.locationSelect = page.locator('select[name="location"], select[data-testid="location-select"]');
    this.generateButton = page.locator('button[type="submit"]:has-text("Generate"), button:has-text("Create Report")');
    this.cancelButton = page.locator('button:has-text("Cancel")');

    // Schedule report locators
    this.scheduleReportCheckbox = page.locator('input[type="checkbox"][name="schedule"], input[data-testid="schedule-checkbox"]');
    this.frequencySelect = page.locator('select[name="frequency"], select[data-testid="frequency-select"]');
    this.timeInput = page.locator('input[name="time"], input[data-testid="time-input"]');
    this.recipientsInput = page.locator('input[name="recipients"], input[data-testid="recipients-input"]');
    this.addRecipientButton = page.locator('button:has-text("Add Recipient")');
    this.scheduleButton = page.locator('button:has-text("Schedule")');

    // Action button locators
    this.downloadButton = page.locator('button:has-text("Download"), button[aria-label*="Download"]');
    this.viewButton = page.locator('button:has-text("View"), button[aria-label*="View"]');
    this.deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="Delete"]');
    this.confirmDeleteButton = page.locator('button:has-text("Confirm"), button:has-text("Yes, Delete")');

    // Status locators
    this.generatingStatusBadge = page.locator('[data-status="generating"], .badge:has-text("Generating")');
    this.completedStatusBadge = page.locator('[data-status="completed"], .badge:has-text("Completed")');
    this.failedStatusBadge = page.locator('[data-status="failed"], .badge:has-text("Failed")');
    this.progressBar = page.locator('[role="progressbar"]');
  }

  /**
   * Navigate to reports page
   */
  async navigate() {
    await this.goto('/reports');
    await this.waitForPageLoad();
  }

  /**
   * Click generate report button
   */
  async clickGenerateReport() {
    await this.clickElement(this.generateReportButton);
    await this.waitForPageLoad();
  }

  /**
   * Fill report generation form
   */
  async fillReportForm(config: ReportConfig) {
    // Select report type
    await this.selectOption(this.reportTypeSelect, config.reportType);

    // Select format
    await this.selectOption(this.formatSelect, config.format);

    // Set date range if provided
    if (config.dateRange) {
      await this.fillInput(this.dateFromInput, config.dateRange.from);
      await this.fillInput(this.dateToInput, config.dateRange.to);
    }

    // Apply filters if provided
    if (config.filters) {
      if (config.filters.departmentId && await this.isElementVisible(this.departmentSelect)) {
        await this.selectOption(this.departmentSelect, config.filters.departmentId);
      }

      if (config.filters.locationId && await this.isElementVisible(this.locationSelect)) {
        await this.selectOption(this.locationSelect, config.filters.locationId);
      }
    }
  }

  /**
   * Fill schedule configuration
   */
  async fillScheduleConfig(schedule: NonNullable<ReportConfig['schedule']>) {
    // Enable scheduling
    await this.checkCheckbox(this.scheduleReportCheckbox);

    // Wait for schedule fields to appear
    await this.waitForElement(this.frequencySelect);

    // Set frequency
    await this.selectOption(this.frequencySelect, schedule.frequency);

    // Set time if provided
    if (schedule.time && await this.isElementVisible(this.timeInput)) {
      await this.fillInput(this.timeInput, schedule.time);
    }

    // Add recipients if provided
    if (schedule.recipients && schedule.recipients.length > 0) {
      for (const recipient of schedule.recipients) {
        await this.fillInput(this.recipientsInput, recipient);
        if (await this.isElementVisible(this.addRecipientButton)) {
          await this.clickElement(this.addRecipientButton);
        } else {
          await this.pressKey('Enter');
        }
      }
    }
  }

  /**
   * Generate report - complete workflow
   */
  async generateReport(config: ReportConfig): Promise<void> {
    await this.clickGenerateReport();
    await this.fillReportForm(config);

    if (config.schedule) {
      await this.fillScheduleConfig(config.schedule);
      await this.clickElement(this.scheduleButton);
      await this.waitForToast('Report scheduled successfully');
    } else {
      await this.clickElement(this.generateButton);
      await this.waitForToast('Report generated successfully');
    }
  }

  /**
   * Get report row by name or type
   */
  getReportRow(identifier: string): Locator {
    return this.page.locator(`tr:has-text("${identifier}")`);
  }

  /**
   * Download report
   */
  async downloadReport(reportIdentifier: string): Promise<Download> {
    const row = this.getReportRow(reportIdentifier);
    const downloadBtn = row.locator('button:has-text("Download")');

    const downloadPromise = this.page.waitForEvent('download');
    await this.clickElement(downloadBtn);

    return await downloadPromise;
  }

  /**
   * Download report and verify format
   */
  async downloadAndVerifyReport(reportIdentifier: string, expectedFormat: 'PDF' | 'Excel' | 'CSV'): Promise<void> {
    const download = await this.downloadReport(reportIdentifier);
    const fileName = download.suggestedFilename();

    const formatExtensions = {
      PDF: '.pdf',
      Excel: '.xlsx',
      CSV: '.csv',
    };

    const expectedExtension = formatExtensions[expectedFormat];
    if (!fileName.toLowerCase().endsWith(expectedExtension)) {
      throw new Error(`Expected ${expectedFormat} file, got: ${fileName}`);
    }
  }

  /**
   * View report
   */
  async viewReport(reportIdentifier: string) {
    const row = this.getReportRow(reportIdentifier);
    const viewBtn = row.locator('button:has-text("View")');
    await this.clickElement(viewBtn);
    await this.waitForPageLoad();
  }

  /**
   * Delete report
   */
  async deleteReport(reportIdentifier: string) {
    const row = this.getReportRow(reportIdentifier);
    const deleteBtn = row.locator('button:has-text("Delete")');
    await this.clickElement(deleteBtn);

    // Wait for confirmation modal
    await this.page.waitForTimeout(500);

    // Confirm deletion
    await this.clickElement(this.confirmDeleteButton);
    await this.waitForToast('Report deleted successfully');
  }

  /**
   * Search reports
   */
  async searchReports(searchTerm: string) {
    await this.fillInput(this.searchInput, searchTerm);
    await this.pressKey('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Filter reports by type
   */
  async filterByType(reportType: string) {
    await this.selectOption(this.filterByTypeSelect, reportType);
    await this.waitForPageLoad();
  }

  /**
   * Filter reports by status
   */
  async filterByStatus(status: string) {
    await this.selectOption(this.filterByStatusSelect, status);
    await this.waitForPageLoad();
  }

  /**
   * Get report status
   */
  async getReportStatus(reportIdentifier: string): Promise<string> {
    const row = this.getReportRow(reportIdentifier);
    const statusBadge = row.locator('[data-status], .badge').first();

    if (await this.isElementVisible(statusBadge)) {
      const statusText = await statusBadge.textContent();
      return statusText?.trim() || 'unknown';
    }

    return 'unknown';
  }

  /**
   * Wait for report to complete
   */
  async waitForReportComplete(reportIdentifier: string, timeout = 60000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getReportStatus(reportIdentifier);

      if (status.toLowerCase() === 'completed' || status.toLowerCase() === 'ready') {
        return;
      }

      if (status.toLowerCase() === 'failed' || status.toLowerCase() === 'error') {
        throw new Error(`Report generation failed with status: ${status}`);
      }

      // Wait 2 seconds before checking again
      await this.page.waitForTimeout(2000);

      // Reload to get updated status
      await this.reload();
      await this.waitForPageLoad();
    }

    throw new Error(`Report did not complete within ${timeout}ms`);
  }

  /**
   * Check if report exists
   */
  async reportExists(reportIdentifier: string): Promise<boolean> {
    const row = this.getReportRow(reportIdentifier);
    return await this.isElementVisible(row);
  }

  /**
   * Assert report exists
   */
  async assertReportExists(reportIdentifier: string) {
    const row = this.getReportRow(reportIdentifier);
    await this.assertElementVisible(row);
  }

  /**
   * Assert report does not exist
   */
  async assertReportDoesNotExist(reportIdentifier: string) {
    const row = this.getReportRow(reportIdentifier);
    await this.assertElementHidden(row);
  }

  /**
   * Get report count
   */
  async getReportCount(): Promise<number> {
    const rows = await this.page.locator('table tbody tr').all();
    return rows.length;
  }

  /**
   * Wait for reports table to load
   */
  async waitForReportsTable() {
    await this.waitForElement(this.reportsListTable);
  }

  /**
   * Assert on reports page
   */
  async assertOnReportsPage() {
    await this.assertURLContains('/reports');
    await this.assertElementVisible(this.generateReportButton);
  }

  /**
   * Cancel report generation
   */
  async cancelReportGeneration() {
    await this.clickElement(this.cancelButton);
  }

  /**
   * Get all scheduled reports
   */
  async getScheduledReports(): Promise<string[]> {
    await this.filterByStatus('scheduled');
    const rows = await this.page.locator('table tbody tr').all();

    const scheduledReports: string[] = [];
    for (const row of rows) {
      const reportName = await row.locator('td').first().textContent();
      if (reportName) {
        scheduledReports.push(reportName.trim());
      }
    }

    return scheduledReports;
  }

  /**
   * Verify report contains data
   */
  async verifyReportHasData(reportIdentifier: string): Promise<boolean> {
    await this.viewReport(reportIdentifier);

    // Check if report view shows data
    const reportContent = await this.page.content();

    // Look for indicators of empty report
    const isEmpty =
      reportContent.includes('No data') ||
      reportContent.includes('No records') ||
      reportContent.includes('Empty report');

    await this.goBack();
    return !isEmpty;
  }
}
