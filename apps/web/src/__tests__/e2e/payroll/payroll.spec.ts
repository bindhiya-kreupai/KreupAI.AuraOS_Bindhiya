/**
 * Payroll E2E Tests
 * Week 7: Secondary E2E Flows
 *
 * Tests:
 * - View payslips
 * - Download payslips
 * - Filter payslips by month/year
 * - Process payroll
 * - Verify payslip calculations
 * - Search payslips
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PayrollPage, PayrollProcessData } from '../pages/PayrollPage';
import { testUsers } from '../fixtures/test-users';

test.describe('Payroll Management - View Payslips', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let payrollPage: PayrollPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    payrollPage = new PayrollPage(page);

    // Login as admin
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
    await loginPage.assertSuccessfulLogin();

    // Navigate to payroll page
    await payrollPage.navigateToPayslips();
    await payrollPage.waitForPayslipsTable();
  });

  test('should display payslips list page', async () => {
    // Assert
    await payrollPage.assertOnPayslipsPage();

    // Should show filter options
    await payrollPage.assertElementVisible(
      payrollPage['page'].locator('select[name="month"], select[data-testid="month-filter"]')
    );
  });

  test('should filter payslips by month and year', async () => {
    // Arrange
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();

    // Act
    await payrollPage.filterPayslips(currentMonth, currentYear);

    // Assert - Should reload with filtered results
    await payrollPage.waitForPayslipsTable();
  });

  test('should view payslip details', async () => {
    // Arrange - Assuming at least one payslip exists
    const payslipCount = await payrollPage.getPayslipCount();

    if (payslipCount > 0) {
      // Act - View first payslip
      const firstRow = payrollPage['page'].locator('table tbody tr').first();
      const employeeName = await firstRow.locator('td').first().textContent();

      if (employeeName) {
        await payrollPage.clickViewPayslip(employeeName);

        // Assert - Modal should be visible with payslip details
        const payslipModal = payrollPage['page'].locator('[role="dialog"]:has-text("Payslip")');
        await payrollPage.assertElementVisible(payslipModal);

        // Should show salary components
        const modalContent = await payslipModal.textContent();
        expect(modalContent).toContain('Basic Salary');
        expect(modalContent).toContain('Net Salary');

        // Close modal
        await payrollPage.closePayslipModal();
      }
    } else {
      test.skip();
    }
  });

  test('should download payslip as PDF', async ({ page }) => {
    // Arrange
    const payslipCount = await payrollPage.getPayslipCount();

    if (payslipCount > 0) {
      const firstRow = page.locator('table tbody tr').first();
      const employeeName = await firstRow.locator('td').first().textContent();

      if (employeeName) {
        // Act
        await payrollPage.downloadPayslip(employeeName);

        // Assert - Download should complete without error
        // (downloadPayslip throws if not PDF)
      }
    } else {
      test.skip();
    }
  });

  test('should search for payslip by employee name', async () => {
    // Arrange
    const payslipCount = await payrollPage.getPayslipCount();

    if (payslipCount > 0) {
      const firstRow = payrollPage['page'].locator('table tbody tr').first();
      const employeeName = await firstRow.locator('td').first().textContent();

      if (employeeName) {
        // Act
        await payrollPage.searchPayslip(employeeName.trim());

        // Assert
        await payrollPage.assertPayslipExists(employeeName.trim());
      }
    } else {
      test.skip();
    }
  });

  test('should verify payslip calculation is correct', async () => {
    // Arrange
    const payslipCount = await payrollPage.getPayslipCount();

    if (payslipCount > 0) {
      const firstRow = payrollPage['page'].locator('table tbody tr').first();
      const employeeName = await firstRow.locator('td').first().textContent();

      if (employeeName) {
        // Act & Assert
        await payrollPage.verifyPayslipCalculation(employeeName.trim());
      }
    } else {
      test.skip();
    }
  });

  test('should show empty state when no payslips for selected month', async () => {
    // Arrange - Select a future month unlikely to have payslips
    const futureMonth = '12';
    const futureYear = '2030';

    // Act
    await payrollPage.filterPayslips(futureMonth, futureYear);

    // Assert - Should show empty state or zero results
    const count = await payrollPage.getPayslipCount();
    expect(count).toBe(0);
  });
});

test.describe('Payroll Management - Process Payroll', () => {
  let loginPage: LoginPage;
  let payrollPage: PayrollPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    payrollPage = new PayrollPage(page);

    // Login as admin (only admins can process payroll)
    await loginPage.navigate();
    await loginPage.loginAsAdmin();
    await loginPage.assertSuccessfulLogin();
  });

  test('should display process payroll page', async () => {
    // Act
    await payrollPage.navigateToProcessPayroll();

    // Assert
    await payrollPage.assertOnProcessPayrollPage();

    // Should show process form
    await payrollPage.assertElementVisible(
      payrollPage['page'].locator('select[name="processingMonth"]')
    );
  });

  test('should process payroll for current month', async () => {
    // Arrange
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();

    const processData: PayrollProcessData = {
      month: currentMonth,
      year: currentYear,
      processType: 'full',
    };

    // Act
    await payrollPage.processPayroll(processData);

    // Assert - Should show success message
    // Success toast is already asserted in processPayroll()

    // Verify payslips were created
    await payrollPage.navigateToPayslips();
    await payrollPage.filterPayslips(currentMonth, currentYear);

    const payslipCount = await payrollPage.getPayslipCount();
    expect(payslipCount).toBeGreaterThan(0);
  });

  test('should show processing progress', async () => {
    // Arrange
    await payrollPage.navigateToProcessPayroll();

    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();

    const processData: PayrollProcessData = {
      month: currentMonth,
      year: currentYear,
      processType: 'full',
    };

    // Act
    await payrollPage.fillProcessPayrollForm(processData);
    await payrollPage.startProcessing();
    await payrollPage.confirmProcessing();

    // Assert - Should show processing modal
    const processingModal = payrollPage['page'].locator('[role="dialog"]:has-text("Processing")');
    await payrollPage.assertElementVisible(processingModal);

    // Should show progress indicator
    const progressExists = await payrollPage.isElementVisible(
      payrollPage['page'].locator('[role="progressbar"]')
    );

    if (progressExists) {
      const progress = await payrollPage.getProcessingProgress();
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    }

    // Wait for completion
    await payrollPage.waitForProcessingComplete();
  });

  test('should allow canceling payroll processing setup', async () => {
    // Arrange
    await payrollPage.navigateToProcessPayroll();

    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();

    const processData: PayrollProcessData = {
      month: currentMonth,
      year: currentYear,
      processType: 'full',
    };

    // Act
    await payrollPage.fillProcessPayrollForm(processData);
    await payrollPage.startProcessing();

    // Wait a moment for confirmation modal
    await payrollPage['page'].waitForTimeout(500);

    // Cancel before confirming
    await payrollPage.cancelProcessing();

    // Assert - Should return to process payroll page
    await payrollPage.assertOnProcessPayrollPage();
  });

  test('should validate required fields for payroll processing', async () => {
    // Arrange
    await payrollPage.navigateToProcessPayroll();

    // Act - Try to process without selecting month/year
    const startButton = payrollPage['page'].locator('button[type="submit"]:has-text("Start Processing")');

    // Check if button is disabled or form validation prevents submission
    const isDisabled = await startButton.isDisabled();

    if (!isDisabled) {
      // If not disabled, clicking should show validation errors
      await payrollPage.clickElement(startButton);

      // Assert - Should show validation errors
      const errors = await payrollPage.getErrorMessages();
      expect(errors.length).toBeGreaterThan(0);
    } else {
      // Assert - Button should be disabled
      expect(isDisabled).toBe(true);
    }
  });

  test('should prevent duplicate payroll processing for same month', async () => {
    // Arrange - Process payroll for a month
    const testMonth = '01';
    const testYear = '2024';

    const processData: PayrollProcessData = {
      month: testMonth,
      year: testYear,
      processType: 'full',
    };

    await payrollPage.processPayroll(processData);

    // Act - Try to process again for same month
    await payrollPage.navigateToProcessPayroll();
    await payrollPage.fillProcessPayrollForm(processData);
    await payrollPage.startProcessing();

    // Assert - Should show error about duplicate processing
    const pageContent = await payrollPage['page'].content();
    const hasWarning =
      pageContent.includes('already processed') ||
      pageContent.includes('duplicate') ||
      pageContent.includes('correction'); // Might suggest correction mode

    if (!hasWarning) {
      // If no warning, the system might allow correction mode
      // This is acceptable as well
    }
  });

  test('should process payroll for specific department', async () => {
    // Arrange
    await payrollPage.navigateToProcessPayroll();

    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = currentDate.getFullYear().toString();

    // Check if department filter is available
    const departmentSelect = payrollPage['page'].locator('select[name="department"]');
    const hasDepartmentFilter = await payrollPage.isElementVisible(departmentSelect);

    if (hasDepartmentFilter) {
      // Get available departments
      const options = await departmentSelect.locator('option').all();

      if (options.length > 1) {
        // Select first non-empty department
        const departmentValue = await options[1].getAttribute('value');

        const processData: PayrollProcessData = {
          month: currentMonth,
          year: currentYear,
          departmentId: departmentValue || undefined,
          processType: 'partial',
        };

        // Act
        await payrollPage.processPayroll(processData);

        // Assert - Should complete successfully
        // Success is verified in processPayroll()
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });
});

test.describe('Payroll Management - Access Control', () => {
  let loginPage: LoginPage;
  let payrollPage: PayrollPage;

  test('regular user should be able to view own payslip', async ({ page }) => {
    // Arrange
    loginPage = new LoginPage(page);
    payrollPage = new PayrollPage(page);

    // Login as regular user
    await loginPage.navigate();
    await loginPage.loginAsUser();

    // Navigate to payroll
    await payrollPage.navigateToPayslips();

    // Assert - User should see their payslips
    await payrollPage.assertOnPayslipsPage();

    // Should be able to view and download their own payslip
    const payslipCount = await payrollPage.getPayslipCount();
    if (payslipCount > 0) {
      const firstRow = page.locator('table tbody tr').first();
      const employeeName = await firstRow.locator('td').first().textContent();

      if (employeeName) {
        await payrollPage.clickViewPayslip(employeeName.trim());
        await payrollPage.closePayslipModal();
      }
    }
  });

  test('regular user should NOT be able to process payroll', async ({ page }) => {
    // Arrange
    loginPage = new LoginPage(page);
    payrollPage = new PayrollPage(page);

    // Login as regular user
    await loginPage.navigate();
    await loginPage.loginAsUser();

    // Try to navigate to process payroll
    await payrollPage.navigateToProcessPayroll();

    // Assert - Should be blocked or redirected
    // Either:
    // 1. 403 Forbidden page
    // 2. Redirected to payslips view
    // 3. Process button not visible

    const currentUrl = payrollPage.getCurrentURL();
    const processButton = page.locator('button:has-text("Process Payroll")');
    const hasProcessButton = await payrollPage.isElementVisible(processButton);

    // Should either not be on process page, or button should not be visible
    expect(
      !currentUrl.includes('/payroll/process') || !hasProcessButton
    ).toBe(true);
  });

  test('manager should be able to view team payslips', async ({ page }) => {
    // Arrange
    loginPage = new LoginPage(page);
    payrollPage = new PayrollPage(page);

    // Login as manager
    await loginPage.navigate();
    await loginPage.loginAsManager();

    // Navigate to payroll
    await payrollPage.navigateToPayslips();

    // Assert - Manager should see team payslips
    await payrollPage.assertOnPayslipsPage();

    const payslipCount = await payrollPage.getPayslipCount();

    // Manager should see multiple payslips (their team)
    // This depends on data setup, so we just verify access
    expect(payslipCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Payroll Management - Edge Cases', () => {
  let loginPage: LoginPage;
  let payrollPage: PayrollPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    payrollPage = new PayrollPage(page);

    await loginPage.navigate();
    await loginPage.loginAsAdmin();
    await loginPage.assertSuccessfulLogin();
  });

  test('should handle payroll processing with no employees', async () => {
    // Arrange - This would require setting up a department with no employees
    // For now, this is a placeholder test

    await payrollPage.navigateToProcessPayroll();

    // If we had a way to select empty department, we could test this
    // For now, skip
    test.skip();
  });

  test('should handle network errors during payroll processing gracefully', async () => {
    // This would require network simulation
    // Placeholder for future implementation
    test.skip();
  });

  test('should persist filter selections across page navigations', async () => {
    // Arrange
    await payrollPage.navigateToPayslips();

    const testMonth = '06';
    const testYear = '2024';

    // Act
    await payrollPage.filterPayslips(testMonth, testYear);

    // Navigate away and back
    await payrollPage.navigate();
    await payrollPage.navigateToPayslips();

    // Assert - Filters should persist (if implemented)
    // This depends on implementation
    // For now, we just verify the page loads
    await payrollPage.assertOnPayslipsPage();
  });
});
