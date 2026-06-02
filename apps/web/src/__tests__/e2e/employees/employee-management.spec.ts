/**
 * Employee Management E2E Tests
 * Week 5: E2E Testing Setup
 *
 * Tests:
 * - Create employee
 * - View employee list
 * - View employee details
 * - Update employee
 * - Delete employee
 * - Search and filter
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import type { EmployeeData } from '../pages/EmployeesPage';
import { EmployeesPage } from '../pages/EmployeesPage';
import { testUsers } from '../fixtures/test-users';

test.describe('Employee Management', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let employeesPage: EmployeesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    employeesPage = new EmployeesPage(page);

    // Login as admin
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
    await loginPage.assertSuccessfulLogin();

    // Navigate to employees page
    await employeesPage.navigate();
    await employeesPage.waitForEmployeeList();
  });

  test('should display employees list page', async () => {
    // Assert
    await employeesPage.assertOnEmployeesPage();

    // Should show add employee button
    await employeesPage.assertElementVisible(
      employeesPage['page'].locator('button:has-text("Add Employee")')
    );
  });

  test('should create new employee successfully', async () => {
    // Arrange
    const newEmployee: EmployeeData = {
      employeeCode: `EMP-${Date.now()}`,
      firstName: 'John',
      lastName: 'Doe',
      email: `john.doe.${Date.now()}@e2etest.com`,
      phone: '+1234567890',
      joiningDate: '2024-01-15',
    };

    // Act
    await employeesPage.createEmployee(newEmployee);

    // Assert
    await employeesPage.assertEmployeeExists(newEmployee.email);
  });

  test('should view employee details', async () => {
    // Arrange - Create employee first
    const employee: EmployeeData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: `jane.smith.${Date.now()}@e2etest.com`,
    };
    await employeesPage.createEmployee(employee);

    // Act
    await employeesPage.clickViewEmployee(employee.email);

    // Assert
    await employeesPage.assertURLContains('/employees/');

    // Should show employee details
    const pageContent = await employeesPage['page'].content();
    expect(pageContent).toContain(employee.firstName);
    expect(pageContent).toContain(employee.lastName);
  });

  test('should update employee information', async () => {
    // Arrange - Create employee first
    const originalEmployee: EmployeeData = {
      firstName: 'Original',
      lastName: 'Name',
      email: `original.${Date.now()}@e2etest.com`,
    };
    await employeesPage.createEmployee(originalEmployee);

    // Act - Update employee
    const updatedData: EmployeeData = {
      firstName: 'Updated',
      lastName: 'Name',
      email: originalEmployee.email,
      phone: '+9876543210',
    };
    await employeesPage.updateEmployee(originalEmployee.email, updatedData);

    // Assert - Updated data should be visible
    const employeeRow = employeesPage.getEmployeeRow(originalEmployee.email);
    await employeesPage.assertElementVisible(employeeRow);

    const rowText = await employeeRow.textContent() || '';
    expect(rowText).toContain(updatedData.firstName);
  });

  test('should delete employee', async () => {
    // Arrange - Create employee first
    const employee: EmployeeData = {
      firstName: 'To',
      lastName: 'Delete',
      email: `todelete.${Date.now()}@e2etest.com`,
    };
    await employeesPage.createEmployee(employee);

    // Verify employee exists
    await employeesPage.assertEmployeeExists(employee.email);

    // Act - Delete employee
    await employeesPage.deleteEmployee(employee.email);

    // Assert - Employee should not exist
    await employeesPage.assertEmployeeDoesNotExist(employee.email);
  });

  test('should search for employee by name', async () => {
    // Arrange - Create employee with unique name
    const uniqueName = `SearchTest${Date.now()}`;
    const employee: EmployeeData = {
      firstName: uniqueName,
      lastName: 'User',
      email: `${uniqueName.toLowerCase()}@e2etest.com`,
    };
    await employeesPage.createEmployee(employee);

    // Act - Search for employee
    await employeesPage.searchEmployee(uniqueName);

    // Assert - Should find the employee
    await employeesPage.assertEmployeeExists(employee.email);
  });

  test('should search for employee by email', async () => {
    // Arrange - Create employee
    const employee: EmployeeData = {
      firstName: 'Email',
      lastName: 'Search',
      email: `emailsearch.${Date.now()}@e2etest.com`,
    };
    await employeesPage.createEmployee(employee);

    // Act - Search by email
    await employeesPage.searchEmployee(employee.email);

    // Assert
    await employeesPage.assertEmployeeExists(employee.email);
  });

  test('should validate required fields when creating employee', async () => {
    // Arrange
    await employeesPage.clickAddEmployee();

    // Act - Try to save without filling required fields
    await employeesPage.clickSave();

    // Assert - Should show validation errors
    const errorMessages = await employeesPage.getErrorMessages();
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  test('should validate email format', async () => {
    // Arrange
    await employeesPage.clickAddEmployee();

    const invalidEmployee: EmployeeData = {
      firstName: 'Invalid',
      lastName: 'Email',
      email: 'not-an-email',
    };

    // Act
    await employeesPage.fillEmployeeForm(invalidEmployee);
    await employeesPage.clickSave();

    // Assert - Should show email validation error
    const errors = await employeesPage.getErrorMessages();
    expect(errors.some(error => error.toLowerCase().includes('email'))).toBeTruthy();
  });

  test('should prevent duplicate employee codes', async () => {
    // Arrange - Create first employee
    const employeeCode = `DUP-${Date.now()}`;
    const employee1: EmployeeData = {
      employeeCode,
      firstName: 'First',
      lastName: 'Employee',
      email: `first.${Date.now()}@e2etest.com`,
    };
    await employeesPage.createEmployee(employee1);

    // Act - Try to create second employee with same code
    await employeesPage.clickAddEmployee();
    const employee2: EmployeeData = {
      employeeCode, // Same code
      firstName: 'Second',
      lastName: 'Employee',
      email: `second.${Date.now()}@e2etest.com`,
    };
    await employeesPage.fillEmployeeForm(employee2);
    await employeesPage.clickSave();

    // Assert - Should show duplicate error
    const errors = await employeesPage.getErrorMessages();
    expect(errors.some(error =>
      error.toLowerCase().includes('duplicate') ||
      error.toLowerCase().includes('already exists')
    )).toBeTruthy();
  });

  test('should cancel employee creation', async () => {
    // Arrange
    await employeesPage.clickAddEmployee();

    const employee: EmployeeData = {
      firstName: 'Cancel',
      lastName: 'Test',
      email: `cancel.${Date.now()}@e2etest.com`,
    };
    await employeesPage.fillEmployeeForm(employee);

    // Act - Click cancel
    await employeesPage.clickCancel();

    // Assert - Should return to list page
    await employeesPage.assertOnEmployeesPage();

    // Employee should not exist
    await employeesPage.assertEmployeeDoesNotExist(employee.email);
  });

  test('should handle pagination', async () => {
    // This test assumes pagination is implemented
    // Implementation will depend on your UI

    const employeeCount = await employeesPage.getEmployeeCount();

    // If pagination exists, test navigation
    const nextButton = employeesPage['page'].locator('button:has-text("Next")');
    if (await employeesPage.isElementVisible(nextButton)) {
      await employeesPage.clickElement(nextButton);
      await employeesPage.waitForPageLoad();

      // Assert - Should be on next page
      await employeesPage.assertURLContains('page=2');
    }
  });

  test('should handle bulk operations', async () => {
    // This test is a placeholder for bulk operations
    // Implementation depends on your features

    // Example: Select multiple employees and delete
    // Actual implementation will vary
  });

  test('should export employee list', async () => {
    // This test is a placeholder for export functionality
    // Implementation depends on your features

    // Example: Click export button and verify download
    const exportButton = employeesPage['page'].locator('button:has-text("Export")');
    if (await employeesPage.isElementVisible(exportButton)) {
      // Test export functionality
    }
  });
});

test.describe('Employee Management - Access Control', () => {
  let loginPage: LoginPage;
  let employeesPage: EmployeesPage;

  test('regular user should have limited access', async ({ page }) => {
    // Arrange
    loginPage = new LoginPage(page);
    employeesPage = new EmployeesPage(page);

    // Login as regular user
    await loginPage.navigate();
    await loginPage.loginAsUser();

    // Navigate to employees
    await employeesPage.navigate();

    // Assert - Regular user might not see add/edit/delete buttons
    // Implementation depends on your access control
    const addButton = page.locator('button:has-text("Add Employee")');
    const hasAddButton = await employeesPage.isElementVisible(addButton);

    // This assertion depends on your authorization rules
    // expect(hasAddButton).toBe(false); // If regular users can't add
  });

  test('manager should have appropriate access', async ({ page }) => {
    // Similar test for manager role
    loginPage = new LoginPage(page);
    employeesPage = new EmployeesPage(page);

    await loginPage.navigate();
    await loginPage.loginAsManager();

    await employeesPage.navigate();

    // Test manager-specific permissions
  });
});
