/**
 * Base Page Object Model
 * Week 5: E2E Testing Setup
 *
 * Provides common functionality for all page objects:
 * - Navigation helpers
 * - Wait utilities
 * - Common assertions
 * - Error handling
 */

import type { Page, Locator} from '@playwright/test';
import { expect } from '@playwright/test';

export class BasePage {
  protected page: Page;
  protected baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3006';
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string) {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    await this.page.goto(url);
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout = 5000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementToDisappear(locator: Locator, timeout = 5000) {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click element with retry
   */
  async clickElement(locator: Locator) {
    await locator.click();
  }

  /**
   * Fill input field
   */
  async fillInput(locator: Locator, value: string) {
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(locator: Locator, value: string) {
    await locator.selectOption(value);
  }

  /**
   * Get element text
   */
  async getElementText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(action: () => Promise<void>) {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
      action(),
    ]);
  }

  /**
   * Get all error messages on the page
   */
  async getErrorMessages(): Promise<string[]> {
    const errorElements = await this.page.locator('[role="alert"], .error-message, .text-red-500').all();
    const messages: string[] = [];
    for (const element of errorElements) {
      const text = await element.textContent();
      if (text) messages.push(text.trim());
    }
    return messages;
  }

  /**
   * Assert URL contains path
   */
  async assertURLContains(path: string) {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  /**
   * Assert element has text
   */
  async assertElementHasText(locator: Locator, expectedText: string) {
    await expect(locator).toHaveText(expectedText);
  }

  /**
   * Assert element is visible
   */
  async assertElementVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  /**
   * Assert element is hidden
   */
  async assertElementHidden(locator: Locator) {
    await expect(locator).toBeHidden();
  }

  /**
   * Assert page title
   */
  async assertPageTitle(expectedTitle: string) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(urlPattern: string | RegExp, timeout = 5000): Promise<any> {
    const response = await this.page.waitForResponse(
      (response) => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
    return await response.json();
  }

  /**
   * Reload page
   */
  async reload() {
    await this.page.reload();
  }

  /**
   * Go back
   */
  async goBack() {
    await this.page.goBack();
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  /**
   * Hover over element
   */
  async hoverElement(locator: Locator) {
    await locator.hover();
  }

  /**
   * Drag and drop
   */
  async dragAndDrop(sourceLocator: Locator, targetLocator: Locator) {
    await sourceLocator.dragTo(targetLocator);
  }

  /**
   * Check checkbox
   */
  async checkCheckbox(locator: Locator) {
    if (!(await locator.isChecked())) {
      await locator.check();
    }
  }

  /**
   * Uncheck checkbox
   */
  async uncheckCheckbox(locator: Locator) {
    if (await locator.isChecked()) {
      await locator.uncheck();
    }
  }

  /**
   * Wait for toast/notification
   */
  async waitForToast(message?: string, timeout = 5000): Promise<string> {
    const toastLocator = message
      ? this.page.locator(`[role="status"]:has-text("${message}")`)
      : this.page.locator('[role="status"]').first();

    await toastLocator.waitFor({ state: 'visible', timeout });
    return await toastLocator.textContent() || '';
  }
}
