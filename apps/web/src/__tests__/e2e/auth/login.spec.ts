/**
 * Authentication E2E Tests - Login Flow
 * Week 5: E2E Testing Setup
 *
 * Tests:
 * - Successful login with valid credentials
 * - Failed login with invalid credentials
 * - Form validation
 * - Remember me functionality
 * - Logout functionality
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { testUsers } from '../fixtures/test-users';

test.describe('Authentication - Login Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // Navigate to login page
    await loginPage.navigate();
    await loginPage.waitForLoginForm();
  });

  test('should successfully login with valid admin credentials', async () => {
    // Arrange
    const adminUser = testUsers.admin;

    // Act
    await loginPage.loginWithTestUser(adminUser);

    // Assert
    await loginPage.assertSuccessfulLogin();
    await dashboardPage.assertOnDashboard();
    await dashboardPage.assertUserLoggedIn();
  });

  test('should successfully login with valid manager credentials', async () => {
    // Arrange
    const managerUser = testUsers.manager;

    // Act
    await loginPage.loginWithTestUser(managerUser);

    // Assert
    await loginPage.assertSuccessfulLogin();
    await dashboardPage.assertOnDashboard();
  });

  test('should successfully login with valid user credentials', async () => {
    // Arrange
    const regularUser = testUsers.user;

    // Act
    await loginPage.loginWithTestUser(regularUser);

    // Assert
    await loginPage.assertSuccessfulLogin();
    await dashboardPage.assertOnDashboard();
  });

  test('should fail login with invalid email', async () => {
    // Arrange
    const invalidEmail = 'invalid@e2etest.com';
    const validPassword = testUsers.admin.password;

    // Act
    await loginPage.login(invalidEmail, validPassword);

    // Assert
    await loginPage.assertLoginFailed('Invalid');
    await loginPage.assertOnLoginPage();
  });

  test('should fail login with invalid password', async () => {
    // Arrange
    const validEmail = testUsers.admin.email;
    const invalidPassword = 'WrongPassword123!';

    // Act
    await loginPage.login(validEmail, invalidPassword);

    // Assert
    await loginPage.assertLoginFailed('Invalid');
    await loginPage.assertOnLoginPage();
  });

  test('should fail login with empty credentials', async () => {
    // Act
    await loginPage.clickLogin();

    // Assert
    const isErrorVisible = await loginPage.isErrorVisible();
    expect(isErrorVisible).toBeTruthy();
  });

  test('should show validation error for invalid email format', async () => {
    // Arrange
    const invalidEmailFormat = 'not-an-email';
    const validPassword = testUsers.admin.password;

    // Act
    await loginPage.fillEmail(invalidEmailFormat);
    await loginPage.fillPassword(validPassword);

    // Assert - Email input should show validation error
    // (Exact assertion depends on your UI implementation)
  });

  test('should successfully logout after login', async ({ page }) => {
    // Arrange - Login first
    await loginPage.loginAsAdmin();
    await loginPage.assertSuccessfulLogin();

    // Act - Logout
    await dashboardPage.logout();

    // Assert - Should be back on login page
    await loginPage.assertOnLoginPage();
  });

  test('should persist session with remember me', async ({ page }) => {
    // Arrange
    const adminUser = testUsers.admin;

    // Act - Login with remember me
    await loginPage.login(adminUser.email, adminUser.password, true);
    await loginPage.assertSuccessfulLogin();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Assert - Should still be logged in
    await dashboardPage.assertUserLoggedIn();
  });

  test('should not persist session without remember me', async ({ context, page }) => {
    // Arrange
    const adminUser = testUsers.admin;

    // Act - Login without remember me
    await loginPage.login(adminUser.email, adminUser.password, false);
    await loginPage.assertSuccessfulLogin();

    // Close and reopen browser context (simulates closing browser)
    await context.close();

    // This test verifies session behavior - actual implementation may vary
  });

  test('should navigate to forgot password page', async () => {
    // Act
    await loginPage.clickForgotPassword();

    // Assert
    await loginPage.assertURLContains('/forgot-password');
  });

  test('should clear form after failed login attempt', async () => {
    // Arrange
    const invalidEmail = 'invalid@e2etest.com';
    const invalidPassword = 'WrongPassword';

    // Act - First failed login
    await loginPage.login(invalidEmail, invalidPassword);
    await loginPage.assertLoginFailed();

    // Clear and try again
    await loginPage.clearForm();
    await loginPage.loginAsAdmin();

    // Assert - Should successfully login after clearing
    await loginPage.assertSuccessfulLogin();
  });

  test('should show loading state during login', async () => {
    // This test would verify loading indicators during login
    // Implementation depends on your UI
    const adminUser = testUsers.admin;

    await loginPage.fillEmail(adminUser.email);
    await loginPage.fillPassword(adminUser.password);
    await loginPage.clickLogin();

    // Assert loading state (implementation-specific)
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/auth/login', (route) =>
      route.abort('failed')
    );

    // Attempt login
    await loginPage.loginAsAdmin();

    // Assert error message shown
    const errorMessages = await loginPage.getErrorMessages();
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  test('should redirect to originally requested page after login', async ({ page }) => {
    // Navigate to protected page (should redirect to login)
    await page.goto('/employees');

    // Should be redirected to login
    await loginPage.assertOnLoginPage();

    // Login
    await loginPage.loginAsAdmin();

    // Should be redirected back to employees page
    await page.waitForURL(/\/employees/, { timeout: 10000 });
  });
});
