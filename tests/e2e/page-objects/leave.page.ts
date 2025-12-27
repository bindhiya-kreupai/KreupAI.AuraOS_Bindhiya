/**
 * Leave Management Page Object
 * Handles all leave management related interactions
 *
 * @reference docs/testing/E2E-PAGE-OBJECT-MODEL.md
 * @owner Dev B (QA Specialist) - PRIMARY OWNER for Leave E2E flows
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface LeaveApplicationData {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  halfDay?: boolean;
  contactNumber?: string;
}

export interface LeaveApprovalData {
  action: 'approve' | 'reject';
  comments?: string;
}

export class LeavePage extends BasePage {
  // Page Elements
  readonly applyLeaveButton: Locator;
  readonly leaveTypeDropdown: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly reasonTextarea: Locator;
  readonly halfDayCheckbox: Locator;
  readonly contactNumberInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Leave List Elements
  readonly leaveListTable: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly statusFilter: Locator;

  // Leave Balance Elements
  readonly leaveBalanceCard: Locator;
  readonly annualLeaveBalance: Locator;
  readonly sickLeaveBalance: Locator;
  readonly casualLeaveBalance: Locator;

  // Leave Details Elements
  readonly leaveDetailsModal: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly cancelLeaveButton: Locator;
  readonly commentsTextarea: Locator;
  readonly confirmButton: Locator;

  // Toast/Alert Elements
  readonly successToast: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    super(page, '/dashboard/leave');

    // Initialize Apply Leave Form Elements
    this.applyLeaveButton = page.getByRole('button', { name: /apply.*leave/i });
    this.leaveTypeDropdown = page.getByLabel(/leave.*type/i);
    this.startDateInput = page.getByLabel(/start.*date/i);
    this.endDateInput = page.getByLabel(/end.*date/i);
    this.reasonTextarea = page.getByLabel(/reason/i);
    this.halfDayCheckbox = page.getByLabel(/half.*day/i);
    this.contactNumberInput = page.getByLabel(/contact.*number/i);
    this.submitButton = page.getByRole('button', { name: /submit/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });

    // Initialize Leave List Elements
    this.leaveListTable = page.getByRole('table');
    this.searchInput = page.getByPlaceholder(/search.*leave/i);
    this.filterDropdown = page.getByLabel(/filter/i);
    this.statusFilter = page.getByLabel(/status/i);

    // Initialize Leave Balance Elements
    this.leaveBalanceCard = page.locator('[data-testid="leave-balance-card"]');
    this.annualLeaveBalance = page.locator('[data-testid="annual-leave-balance"]');
    this.sickLeaveBalance = page.locator('[data-testid="sick-leave-balance"]');
    this.casualLeaveBalance = page.locator('[data-testid="casual-leave-balance"]');

    // Initialize Leave Details Elements
    this.leaveDetailsModal = page.locator('[role="dialog"]');
    this.approveButton = page.getByRole('button', { name: /approve/i });
    this.rejectButton = page.getByRole('button', { name: /reject/i });
    this.cancelLeaveButton = page.getByRole('button', { name: /cancel.*leave/i });
    this.commentsTextarea = page.getByLabel(/comments/i);
    this.confirmButton = page.getByRole('button', { name: /confirm/i });

    // Initialize Toast Elements
    this.successToast = page.locator('[role="alert"]').filter({ hasText: /success/i });
    this.errorToast = page.locator('[role="alert"]').filter({ hasText: /error/i });
  }

  /**
   * Navigate to Leave Management page
   */
  async navigateToLeave(): Promise<void> {
    await this.goto();
    await this.waitForPageLoad();
  }

  /**
   * Click Apply Leave button to open the form
   */
  async clickApplyLeave(): Promise<void> {
    await this.click(this.applyLeaveButton);
    await this.waitForElement(this.leaveTypeDropdown);
  }

  /**
   * Fill leave application form
   */
  async fillLeaveForm(data: LeaveApplicationData): Promise<void> {
    await this.selectOption(this.leaveTypeDropdown, data.leaveType);
    await this.fill(this.startDateInput, data.startDate);
    await this.fill(this.endDateInput, data.endDate);
    await this.fill(this.reasonTextarea, data.reason);

    if (data.halfDay) {
      await this.click(this.halfDayCheckbox);
    }

    if (data.contactNumber) {
      await this.fill(this.contactNumberInput, data.contactNumber);
    }
  }

  /**
   * Submit leave application
   */
  async submitLeaveApplication(): Promise<void> {
    await this.click(this.submitButton);
    await this.waitForResponse(/\/api\/leave\/apply/);
  }

  /**
   * Apply for leave (complete flow)
   */
  async applyForLeave(data: LeaveApplicationData): Promise<void> {
    await this.clickApplyLeave();
    await this.fillLeaveForm(data);
    await this.submitLeaveApplication();
    await this.waitForElement(this.successToast);
  }

  /**
   * Search for leave requests
   */
  async searchLeave(searchTerm: string): Promise<void> {
    await this.fill(this.searchInput, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForResponse(/\/api\/leave\/search/);
  }

  /**
   * Filter leave by status
   */
  async filterByStatus(status: string): Promise<void> {
    await this.selectOption(this.statusFilter, status);
    await this.waitForResponse(/\/api\/leave/);
  }

  /**
   * Click on a leave request in the list
   */
  async clickLeaveRequest(index: number = 0): Promise<void> {
    const row = this.leaveListTable.locator('tbody tr').nth(index);
    await this.click(row);
    await this.waitForElement(this.leaveDetailsModal);
  }

  /**
   * Approve leave request
   */
  async approveLeave(comments?: string): Promise<void> {
    if (comments) {
      await this.fill(this.commentsTextarea, comments);
    }
    await this.click(this.approveButton);
    await this.click(this.confirmButton);
    await this.waitForResponse(/\/api\/leave\/approve/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Reject leave request
   */
  async rejectLeave(comments: string): Promise<void> {
    await this.fill(this.commentsTextarea, comments);
    await this.click(this.rejectButton);
    await this.click(this.confirmButton);
    await this.waitForResponse(/\/api\/leave\/reject/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Cancel leave request
   */
  async cancelLeave(reason?: string): Promise<void> {
    if (reason) {
      await this.fill(this.commentsTextarea, reason);
    }
    await this.click(this.cancelLeaveButton);
    await this.click(this.confirmButton);
    await this.waitForResponse(/\/api\/leave\/cancel/);
    await this.waitForElement(this.successToast);
  }

  /**
   * Get leave balance for specific type
   */
  async getLeaveBalance(leaveType: 'annual' | 'sick' | 'casual'): Promise<string> {
    const balanceMap = {
      annual: this.annualLeaveBalance,
      sick: this.sickLeaveBalance,
      casual: this.casualLeaveBalance,
    };

    const balanceElement = balanceMap[leaveType];
    return await this.getText(balanceElement);
  }

  /**
   * Verify leave appears in list
   */
  async verifyLeaveInList(leaveType: string, status: string): Promise<void> {
    const row = this.leaveListTable.locator('tbody tr').filter({ hasText: leaveType });
    await this.assertVisible(row);
    await this.assertContainsText(row, status);
  }

  /**
   * Verify success message
   */
  async verifySuccessMessage(message?: string): Promise<void> {
    await this.assertVisible(this.successToast);
    if (message) {
      await this.assertContainsText(this.successToast, message);
    }
  }

  /**
   * Verify error message
   */
  async verifyErrorMessage(message?: string): Promise<void> {
    await this.assertVisible(this.errorToast);
    if (message) {
      await this.assertContainsText(this.errorToast, message);
    }
  }

  /**
   * Get leave count from table
   */
  async getLeaveCount(): Promise<number> {
    const rows = await this.leaveListTable.locator('tbody tr').count();
    return rows;
  }

  /**
   * Close leave details modal
   */
  async closeLeaveDetails(): Promise<void> {
    const closeButton = this.leaveDetailsModal.getByRole('button', { name: /close/i });
    await this.click(closeButton);
  }

  /**
   * Verify leave balance is displayed
   */
  async verifyLeaveBalanceDisplayed(): Promise<void> {
    await this.assertVisible(this.leaveBalanceCard);
    await this.assertVisible(this.annualLeaveBalance);
    await this.assertVisible(this.sickLeaveBalance);
    await this.assertVisible(this.casualLeaveBalance);
  }

  /**
   * Get leave details from modal
   */
  async getLeaveDetails(): Promise<{
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    reason: string;
  }> {
    const modal = this.leaveDetailsModal;

    return {
      type: await this.getText(modal.locator('[data-testid="leave-type"]')),
      status: await this.getText(modal.locator('[data-testid="leave-status"]')),
      startDate: await this.getText(modal.locator('[data-testid="start-date"]')),
      endDate: await this.getText(modal.locator('[data-testid="end-date"]')),
      reason: await this.getText(modal.locator('[data-testid="leave-reason"]')),
    };
  }

  /**
   * Verify leave application form validation
   */
  async verifyFormValidation(field: string, expectedError: string): Promise<void> {
    const errorMessage = this.page.locator(`[data-testid="${field}-error"]`);
    await this.assertVisible(errorMessage);
    await this.assertHasText(errorMessage, expectedError);
  }
}
