/**
 * Shared E2E Testing Utilities
 * Week 7: Secondary E2E Flows
 *
 * Reusable utilities for all E2E tests:
 * - Data generators
 * - Date utilities
 * - Validation helpers
 * - Wait utilities
 * - File download helpers
 * - Screenshot helpers
 */

import { Page, Locator, Download } from '@playwright/test';

/**
 * Generate unique email for testing
 */
export function generateUniqueEmail(prefix = 'test.user'): string {
  return `${prefix}.${Date.now()}@e2etest.com`;
}

/**
 * Generate unique employee code
 */
export function generateEmployeeCode(prefix = 'EMP'): string {
  return `${prefix}-${Date.now()}`;
}

/**
 * Generate unique ID with prefix
 */
export function generateUniqueId(prefix = 'ID'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date N days from now
 */
export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return formatDateForInput(date);
}

/**
 * Get date N days ago
 */
export function getPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDateForInput(date);
}

/**
 * Get current month and year
 */
export function getCurrentMonthYear(): { month: string; year: string } {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1).padStart(2, '0'),
    year: String(now.getFullYear()),
  };
}

/**
 * Get first and last day of current month
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    start: formatDateForInput(firstDay),
    end: formatDateForInput(lastDay),
  };
}

/**
 * Wait for element with custom polling
 */
export async function waitForElementWithPolling(
  locator: Locator,
  options: {
    timeout?: number;
    pollInterval?: number;
    state?: 'visible' | 'hidden' | 'attached' | 'detached';
  } = {}
): Promise<void> {
  const {
    timeout = 10000,
    pollInterval = 500,
    state = 'visible',
  } = options;

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      await locator.waitFor({ state, timeout: pollInterval });
      return;
    } catch (error) {
      // Element not found, continue polling
    }
  }

  throw new Error(`Element did not reach state "${state}" within ${timeout}ms`);
}

/**
 * Wait for any of multiple locators to be visible
 */
export async function waitForAnyElement(
  page: Page,
  locators: Locator[],
  timeout = 10000
): Promise<number> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    for (let i = 0; i < locators.length; i++) {
      try {
        await locators[i].waitFor({ state: 'visible', timeout: 100 });
        return i; // Return index of first visible locator
      } catch (error) {
        // Continue to next locator
      }
    }

    await page.waitForTimeout(100);
  }

  throw new Error('None of the expected elements became visible');
}

/**
 * Retry action until success or timeout
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    retryCondition?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = () => true,
  } = options;

  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;

      if (!retryCondition(lastError)) {
        throw lastError;
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError || new Error('Action failed after retries');
}

/**
 * Wait for download and verify
 */
export async function waitAndVerifyDownload(
  downloadPromise: Promise<Download>,
  expectedFileName?: string | RegExp
): Promise<Download> {
  const download = await downloadPromise;
  const fileName = download.suggestedFilename();

  if (expectedFileName) {
    if (typeof expectedFileName === 'string') {
      if (!fileName.includes(expectedFileName)) {
        throw new Error(`Expected filename to contain "${expectedFileName}", got "${fileName}"`);
      }
    } else {
      if (!expectedFileName.test(fileName)) {
        throw new Error(`Filename "${fileName}" does not match pattern ${expectedFileName}`);
      }
    }
  }

  return download;
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(
  page: Page,
  baseName: string,
  path = 'screenshots'
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${baseName}-${timestamp}.png`;
  await page.screenshot({ path: `${path}/${fileName}`, fullPage: true });
}

/**
 * Get table data as array of objects
 */
export async function getTableData(
  page: Page,
  tableSelector = 'table'
): Promise<Record<string, string>[]> {
  const table = page.locator(tableSelector);

  // Get headers
  const headerCells = await table.locator('thead th, thead td').all();
  const headers = await Promise.all(
    headerCells.map(cell => cell.textContent().then(text => text?.trim() || ''))
  );

  // Get rows
  const rows = await table.locator('tbody tr').all();
  const data: Record<string, string>[] = [];

  for (const row of rows) {
    const cells = await row.locator('td').all();
    const rowData: Record<string, string> = {};

    for (let i = 0; i < cells.length && i < headers.length; i++) {
      const cellText = await cells[i].textContent();
      rowData[headers[i]] = cellText?.trim() || '';
    }

    data.push(rowData);
  }

  return data;
}

/**
 * Fill form from object
 */
export async function fillFormFromObject(
  page: Page,
  data: Record<string, string | boolean>,
  fieldPrefix = ''
): Promise<void> {
  for (const [key, value] of Object.entries(data)) {
    const fieldName = fieldPrefix ? `${fieldPrefix}.${key}` : key;

    // Try input field
    const input = page.locator(`input[name="${fieldName}"]`);
    if (await input.isVisible({ timeout: 100 }).catch(() => false)) {
      const inputType = await input.getAttribute('type');

      if (inputType === 'checkbox' && typeof value === 'boolean') {
        if (value) {
          await input.check();
        } else {
          await input.uncheck();
        }
      } else {
        await input.fill(String(value));
      }
      continue;
    }

    // Try select field
    const select = page.locator(`select[name="${fieldName}"]`);
    if (await select.isVisible({ timeout: 100 }).catch(() => false)) {
      await select.selectOption(String(value));
      continue;
    }

    // Try textarea
    const textarea = page.locator(`textarea[name="${fieldName}"]`);
    if (await textarea.isVisible({ timeout: 100 }).catch(() => false)) {
      await textarea.fill(String(value));
      continue;
    }
  }
}

/**
 * Extract form data to object
 */
export async function extractFormData(
  page: Page,
  formSelector = 'form'
): Promise<Record<string, string>> {
  const form = page.locator(formSelector);
  const data: Record<string, string> = {};

  // Get all inputs
  const inputs = await form.locator('input').all();
  for (const input of inputs) {
    const name = await input.getAttribute('name');
    if (name) {
      const type = await input.getAttribute('type');
      if (type === 'checkbox') {
        data[name] = (await input.isChecked()) ? 'true' : 'false';
      } else if (type !== 'submit' && type !== 'button') {
        const value = await input.inputValue();
        data[name] = value;
      }
    }
  }

  // Get all selects
  const selects = await form.locator('select').all();
  for (const select of selects) {
    const name = await select.getAttribute('name');
    if (name) {
      const value = await select.inputValue();
      data[name] = value;
    }
  }

  // Get all textareas
  const textareas = await form.locator('textarea').all();
  for (const textarea of textareas) {
    const name = await textarea.getAttribute('name');
    if (name) {
      const value = await textarea.inputValue();
      data[name] = value;
    }
  }

  return data;
}

/**
 * Check if toast/notification is visible
 */
export async function waitForToastMessage(
  page: Page,
  expectedMessage?: string | RegExp,
  timeout = 5000
): Promise<string> {
  const toastLocator = page.locator('[role="status"], [role="alert"], .toast, .notification').first();

  await toastLocator.waitFor({ state: 'visible', timeout });

  const toastText = await toastLocator.textContent() || '';

  if (expectedMessage) {
    if (typeof expectedMessage === 'string') {
      if (!toastText.includes(expectedMessage)) {
        throw new Error(`Expected toast to contain "${expectedMessage}", got "${toastText}"`);
      }
    } else {
      if (!expectedMessage.test(toastText)) {
        throw new Error(`Toast text "${toastText}" does not match pattern ${expectedMessage}`);
      }
    }
  }

  return toastText;
}

/**
 * Wait for modal to appear
 */
export async function waitForModal(
  page: Page,
  titleText?: string,
  timeout = 5000
): Promise<Locator> {
  const modalSelector = titleText
    ? `[role="dialog"]:has-text("${titleText}")`
    : '[role="dialog"]';

  const modal = page.locator(modalSelector).first();
  await modal.waitFor({ state: 'visible', timeout });
  return modal;
}

/**
 * Close modal
 */
export async function closeModal(
  page: Page,
  modal?: Locator
): Promise<void> {
  const targetModal = modal || page.locator('[role="dialog"]').first();

  // Try close button
  const closeButton = targetModal.locator('button:has-text("Close"), button[aria-label="Close"]').first();

  if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await closeButton.click();
  } else {
    // Try pressing Escape
    await page.keyboard.press('Escape');
  }

  await targetModal.waitFor({ state: 'hidden', timeout: 5000 });
}

/**
 * Verify element text matches pattern
 */
export async function verifyElementText(
  locator: Locator,
  expected: string | RegExp
): Promise<void> {
  const actualText = await locator.textContent() || '';

  if (typeof expected === 'string') {
    if (!actualText.includes(expected)) {
      throw new Error(`Expected element to contain "${expected}", got "${actualText}"`);
    }
  } else {
    if (!expected.test(actualText)) {
      throw new Error(`Element text "${actualText}" does not match pattern ${expected}`);
    }
  }
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  return parseFloat(currencyString.replace(/[$,]/g, '')) || 0;
}

/**
 * Format number as currency
 */
export function formatCurrency(amount: number, currency = '$'): string {
  return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Generate random name
 */
export function generateRandomName(): { firstName: string; lastName: string } {
  const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

  const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
  const timestamp = Date.now().toString().slice(-4);

  return {
    firstName: `${randomFirst}${timestamp}`,
    lastName: `${randomLast}${timestamp}`,
  };
}

/**
 * Generate random phone number
 */
export function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${prefix}${lineNumber}`;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mask sensitive data in logs
 */
export function maskSensitiveData(data: string, fieldsToMask: string[] = ['password', 'token', 'secret']): string {
  let masked = data;

  for (const field of fieldsToMask) {
    const regex = new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'gi');
    masked = masked.replace(regex, `"${field}": "***MASKED***"`);
  }

  return masked;
}

/**
 * Assert array contains item matching predicate
 */
export function assertArrayContains<T>(
  array: T[],
  predicate: (item: T) => boolean,
  errorMessage = 'Array does not contain matching item'
): void {
  if (!array.some(predicate)) {
    throw new Error(errorMessage);
  }
}

/**
 * Assert array length
 */
export function assertArrayLength(
  array: unknown[],
  expectedLength: number,
  comparison: 'equal' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' = 'equal'
): void {
  const actualLength = array.length;

  switch (comparison) {
    case 'equal':
      if (actualLength !== expectedLength) {
        throw new Error(`Expected array length ${expectedLength}, got ${actualLength}`);
      }
      break;
    case 'greaterThan':
      if (actualLength <= expectedLength) {
        throw new Error(`Expected array length > ${expectedLength}, got ${actualLength}`);
      }
      break;
    case 'lessThan':
      if (actualLength >= expectedLength) {
        throw new Error(`Expected array length < ${expectedLength}, got ${actualLength}`);
      }
      break;
    case 'greaterThanOrEqual':
      if (actualLength < expectedLength) {
        throw new Error(`Expected array length >= ${expectedLength}, got ${actualLength}`);
      }
      break;
    case 'lessThanOrEqual':
      if (actualLength > expectedLength) {
        throw new Error(`Expected array length <= ${expectedLength}, got ${actualLength}`);
      }
      break;
  }
}
