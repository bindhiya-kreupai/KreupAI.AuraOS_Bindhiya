/**
 * Login Page Object Model
 * Week 5: E2E Testing Setup
 *
 * Handles all interactions with the login page:
 * - Login form submission
 * - Error handling
 * - Navigation after login
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestUser } from '../fixtures/test-users';

export class LoginPage extends BasePage {
  // Locators
  private emailInput: Locator;
  private passwordInput: Locator;
  private loginButton: Locator;
  private errorMessage: Locator;
  private forgotPasswordLink: Locator;
  private rememberMeCheckbox: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]:has-text("Login"), button:has-text("Sign In")');
    this.errorMessage = page.locator('[role="alert"], .error-message');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot Password")');
    this.rememberMeCheckbox = page.locator('input[type="checkbox"][name="rememberMe"]');
  }

  /**
   * Navigate to login page
   */
  async navigate() {
    await this.goto('/auth/login');
    await this.waitForPageLoad();
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string) {
    await this.fillInput(this.emailInput, email);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string) {
    await this.fillInput(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLogin() {
    await this.clickElement(this.loginButton);
  }

  /**
   * Check remember me checkbox
   */
  async checkRememberMe() {
    await this.checkCheckbox(this.rememberMeCheckbox);
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string, rememberMe = false) {
    await this.fillEmail(email);
    await this.fillPassword(password);

    if (rememberMe) {
      await this.checkRememberMe();
    }

    await this.clickLogin();
  }

  /**
   * Login with test user
   */
  async loginWithTestUser(user: TestUser) {
    await this.login(user.email, user.password);
  }

  /**
   * Login as admin
   */
  async loginAsAdmin() {
    await this.login('admin@e2etest.com', 'Test@1234');
  }

  /**
   * Login as manager
   */
  async loginAsManager() {
    await this.login('manager@e2etest.com', 'Test@1234');
  }

  /**
   * Login as regular user
   */
  async loginAsUser() {
    await this.login('user@e2etest.com', 'Test@1234');
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return await this.getElementText(this.errorMessage);
  }

  /**
   * Check if error message is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.clickElement(this.forgotPasswordLink);
  }

  /**
   * Assert successful login (redirects to dashboard)
   */
  async assertSuccessfulLogin() {
    // Wait for navigation to dashboard
    await this.page.waitForURL(/\/dashboard|\//, { timeout: 10000 });
    await this.waitForPageLoad();
  }

  /**
   * Assert login failed with error
   */
  async assertLoginFailed(expectedError?: string) {
    await this.assertElementVisible(this.errorMessage);

    if (expectedError) {
      const actualError = await this.getErrorMessage();
      if (!actualError.includes(expectedError)) {
        throw new Error(`Expected error to contain "${expectedError}", but got "${actualError}"`);
      }
    }
  }

  /**
   * Assert still on login page
   */
  async assertOnLoginPage() {
    await this.assertURLContains('/auth/login');
  }

  /**
   * Wait for login form to be ready
   */
  async waitForLoginForm() {
    await this.waitForElement(this.emailInput);
    await this.waitForElement(this.passwordInput);
    await this.waitForElement(this.loginButton);
  }

  /**
   * Clear login form
   */
  async clearForm() {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Check if remember me is checked
   */
  async isRememberMeChecked(): Promise<boolean> {
    return await this.rememberMeCheckbox.isChecked();
  }

  /**
   * Assert login button is disabled
   */
  async assertLoginButtonDisabled() {
    await this.page.locator('button[type="submit"][disabled]').waitFor({ state: 'visible' });
  }

  /**
   * Assert login button is enabled
   */
  async assertLoginButtonEnabled() {
    const isDisabled = await this.loginButton.isDisabled();
    if (isDisabled) {
      throw new Error('Login button is disabled, but expected to be enabled');
    }
  }
}
