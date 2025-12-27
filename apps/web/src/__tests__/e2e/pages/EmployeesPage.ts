/**
 * Employees Page Object Model
 * Week 5: E2E Testing Setup
 *
 * Handles all interactions with the employees module:
 * - Employee list
 * - Create employee
 * - Update employee
 * - View employee details
 * - Delete employee
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface EmployeeData {
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  joiningDate?: string;
  salary?: string;
}

export class EmployeesPage extends BasePage {
  // Locators
  private addEmployeeButton: Locator;
  private employeeListTable: Locator;
  private searchInput: Locator;
  private filterButton: Locator;

  // Form locators
  private employeeCodeInput: Locator;
  private firstNameInput: Locator;
  private lastNameInput: Locator;
  private emailInput: Locator;
  private phoneInput: Locator;
  private departmentSelect: Locator;
  private positionSelect: Locator;
  private joiningDateInput: Locator;
  private salaryInput: Locator;
  private saveButton: Locator;
  private cancelButton: Locator;

  constructor(page: Page) {
    super(page);

    // List page locators
    this.addEmployeeButton = page.locator('button:has-text("Add Employee"), button:has-text("New Employee")');
    this.employeeListTable = page.locator('table, [role="table"]');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.filterButton = page.locator('button:has-text("Filter")');

    // Form locators
    this.employeeCodeInput = page.locator('input[name="employeeCode"]');
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.emailInput = page.locator('input[name="email"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.departmentSelect = page.locator('select[name="department"]');
    this.positionSelect = page.locator('select[name="position"]');
    this.joiningDateInput = page.locator('input[name="joiningDate"]');
    this.salaryInput = page.locator('input[name="salary"]');
    this.saveButton = page.locator('button[type="submit"]:has-text("Save"), button:has-text("Create")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  /**
   * Navigate to employees page
   */
  async navigate() {
    await this.goto('/employees');
    await this.waitForPageLoad();
  }

  /**
   * Click add employee button
   */
  async clickAddEmployee() {
    await this.clickElement(this.addEmployeeButton);
    await this.waitForPageLoad();
  }

  /**
   * Fill employee form
   */
  async fillEmployeeForm(data: EmployeeData) {
    if (data.employeeCode) {
      await this.fillInput(this.employeeCodeInput, data.employeeCode);
    }

    await this.fillInput(this.firstNameInput, data.firstName);
    await this.fillInput(this.lastNameInput, data.lastName);
    await this.fillInput(this.emailInput, data.email);

    if (data.phone) {
      await this.fillInput(this.phoneInput, data.phone);
    }

    if (data.department) {
      await this.selectOption(this.departmentSelect, data.department);
    }

    if (data.position) {
      await this.selectOption(this.positionSelect, data.position);
    }

    if (data.joiningDate) {
      await this.fillInput(this.joiningDateInput, data.joiningDate);
    }

    if (data.salary) {
      await this.fillInput(this.salaryInput, data.salary);
    }
  }

  /**
   * Click save button
   */
  async clickSave() {
    await this.clickElement(this.saveButton);
  }

  /**
   * Click cancel button
   */
  async clickCancel() {
    await this.clickElement(this.cancelButton);
  }

  /**
   * Create new employee
   */
  async createEmployee(data: EmployeeData) {
    await this.clickAddEmployee();
    await this.fillEmployeeForm(data);
    await this.clickSave();
    await this.waitForToast('Employee created successfully');
  }

  /**
   * Search for employee
   */
  async searchEmployee(searchTerm: string) {
    await this.fillInput(this.searchInput, searchTerm);
    await this.pressKey('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Get employee row by email
   */
  getEmployeeRow(email: string): Locator {
    return this.page.locator(`tr:has-text("${email}")`);
  }

  /**
   * Click edit button for employee
   */
  async clickEditEmployee(email: string) {
    const row = this.getEmployeeRow(email);
    const editButton = row.locator('button:has-text("Edit")');
    await this.clickElement(editButton);
    await this.waitForPageLoad();
  }

  /**
   * Click view button for employee
   */
  async clickViewEmployee(email: string) {
    const row = this.getEmployeeRow(email);
    const viewButton = row.locator('button:has-text("View"), a:has-text("View")');
    await this.clickElement(viewButton);
    await this.waitForPageLoad();
  }

  /**
   * Click delete button for employee
   */
  async clickDeleteEmployee(email: string) {
    const row = this.getEmployeeRow(email);
    const deleteButton = row.locator('button:has-text("Delete")');
    await this.clickElement(deleteButton);
  }

  /**
   * Confirm delete dialog
   */
  async confirmDelete() {
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete")');
    await this.clickElement(confirmButton);
    await this.waitForToast('Employee deleted successfully');
  }

  /**
   * Update employee
   */
  async updateEmployee(currentEmail: string, newData: EmployeeData) {
    await this.clickEditEmployee(currentEmail);
    await this.fillEmployeeForm(newData);
    await this.clickSave();
    await this.waitForToast('Employee updated successfully');
  }

  /**
   * Delete employee
   */
  async deleteEmployee(email: string) {
    await this.clickDeleteEmployee(email);
    await this.confirmDelete();
  }

  /**
   * Check if employee exists in list
   */
  async employeeExists(email: string): Promise<boolean> {
    const row = this.getEmployeeRow(email);
    return await this.isElementVisible(row);
  }

  /**
   * Assert employee exists
   */
  async assertEmployeeExists(email: string) {
    const row = this.getEmployeeRow(email);
    await this.assertElementVisible(row);
  }

  /**
   * Assert employee does not exist
   */
  async assertEmployeeDoesNotExist(email: string) {
    const row = this.getEmployeeRow(email);
    await this.assertElementHidden(row);
  }

  /**
   * Get employee count
   */
  async getEmployeeCount(): Promise<number> {
    const rows = await this.page.locator('table tbody tr').all();
    return rows.length;
  }

  /**
   * Wait for employee list to load
   */
  async waitForEmployeeList() {
    await this.waitForElement(this.employeeListTable);
  }

  /**
   * Assert on employees page
   */
  async assertOnEmployeesPage() {
    await this.assertURLContains('/employees');
    await this.assertElementVisible(this.addEmployeeButton);
  }
}
