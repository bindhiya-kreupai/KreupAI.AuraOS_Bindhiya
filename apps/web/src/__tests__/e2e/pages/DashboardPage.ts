/**
 * Dashboard Page Object Model
 * Week 5: E2E Testing Setup
 *
 * Handles interactions with the main dashboard:
 * - Navigation menu
 * - User profile
 * - Logout
 * - Dashboard widgets
 */

import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  // Locators
  private userProfileButton: Locator;
  private logoutButton: Locator;
  private navigationMenu: Locator;
  private pageTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.userProfileButton = page.locator('[data-testid="user-profile"], button:has-text("Profile")');
    this.logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
    this.navigationMenu = page.locator('nav, [role="navigation"]');
    this.pageTitle = page.locator('h1, h2').first();
  }

  /**
   * Navigate to dashboard
   */
  async navigate() {
    await this.goto('/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to specific module
   */
  async navigateToModule(moduleName: string) {
    const moduleLink = this.page.locator(`nav a:has-text("${moduleName}")`);
    await this.clickElement(moduleLink);
    await this.waitForPageLoad();
  }

  /**
   * Open user profile
   */
  async openUserProfile() {
    await this.clickElement(this.userProfileButton);
  }

  /**
   * Logout
   */
  async logout() {
    await this.openUserProfile();
    await this.clickElement(this.logoutButton);
    await this.waitForPageLoad();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.getElementText(this.pageTitle);
  }

  /**
   * Check if on dashboard
   */
  async isOnDashboard(): Promise<boolean> {
    return await this.isElementVisible(this.navigationMenu);
  }

  /**
   * Assert on dashboard
   */
  async assertOnDashboard() {
    await this.assertElementVisible(this.navigationMenu);
    await this.assertURLContains('/dashboard');
  }

  /**
   * Navigate to Employees module
   */
  async navigateToEmployees() {
    await this.navigateToModule('Employees');
  }

  /**
   * Navigate to Leave module
   */
  async navigateToLeave() {
    await this.navigateToModule('Leave');
  }

  /**
   * Navigate to Attendance module
   */
  async navigateToAttendance() {
    await this.navigateToModule('Attendance');
  }

  /**
   * Navigate to Payroll module
   */
  async navigateToPayroll() {
    await this.navigateToModule('Payroll');
  }

  /**
   * Check if user is logged in
   */
  async isUserLoggedIn(): Promise<boolean> {
    return await this.isElementVisible(this.userProfileButton);
  }

  /**
   * Assert user is logged in
   */
  async assertUserLoggedIn() {
    await this.assertElementVisible(this.userProfileButton);
  }
}
