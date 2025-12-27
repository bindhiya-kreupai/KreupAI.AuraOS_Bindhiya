# E2E Testing - Page Object Model Guide
**Version:** 1.0
**Last Updated:** December 27, 2024
**Owner:** Dev B (QA Specialist)
**Framework:** Playwright

---

## Table of Contents

1. [What is Page Object Model (POM)?](#what-is-page-object-model-pom)
2. [Why Use POM?](#why-use-pom)
3. [POM Structure](#pom-structure)
4. [Creating Page Objects](#creating-page-objects)
5. [Writing E2E Tests](#writing-e2e-tests)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## What is Page Object Model (POM)?

Page Object Model is a design pattern that creates an object repository for web UI elements. Each page in the application has a corresponding Page Class that encapsulates:

- Page elements (locators)
- Page actions (methods)
- Page validations

**Key Principle:** Separate test logic from page structure

```
Test Files → Call methods → Page Objects → Interact with → UI Elements
```

---

## Why Use POM?

### Benefits

✅ **Maintainability**: UI changes only require updating page objects, not all tests
✅ **Reusability**: Page methods can be reused across multiple tests
✅ **Readability**: Tests read like user stories
✅ **Reduced Duplication**: Common actions defined once
✅ **Easy Debugging**: Clear separation of concerns

### Without POM ❌

```typescript
// BAD - Tightly coupled to UI structure
test('user can apply for leave', async ({ page }) => {
  await page.goto('http://localhost:3006/login');
  await page.locator('#email').fill('user@test.com');
  await page.locator('#password').fill('password');
  await page.locator('button[type="submit"]').click();
  await page.locator('a[href="/leave"]').click();
  await page.locator('button:has-text("Apply Leave")').click();
  // ... 50 more lines
});
```

### With POM ✅

```typescript
// GOOD - Readable, maintainable
test('user can apply for leave', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const leavePage = new LeavePage(page);

  await loginPage.login('user@test.com', 'password');
  await leavePage.goto();
  await leavePage.applyForLeave({
    type: 'Annual Leave',
    startDate: '2025-02-01',
    endDate: '2025-02-03'
  });

  await expect(leavePage.successMessage).toBeVisible();
});
```

---

## POM Structure

### Project Structure

```
tests/
├── e2e/
│   ├── pages/                    # Page Objects
│   │   ├── BasePage.ts           # Base page class
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── EmployeePage.ts
│   │   ├── LeavePage.ts
│   │   └── PayrollPage.ts
│   ├── fixtures/                 # Test data
│   │   ├── users.ts
│   │   └── employees.ts
│   ├── helpers/                  # Helper functions
│   │   ├── auth.ts
│   │   └── database.ts
│   └── specs/                    # Test files
│       ├── leave-management.spec.ts
│       ├── employee-management.spec.ts
│       └── authentication.spec.ts
└── playwright.config.ts          # Playwright configuration
```

---

## Creating Page Objects

### 1. Base Page Class

Create a base class with common functionality:

```typescript
// tests/e2e/pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string = '') {
    await this.page.goto(`http://localhost:3006${path}`);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 5000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Fill form field by label
   */
  async fillByLabel(label: string, value: string) {
    await this.page.getByLabel(label).fill(value);
  }

  /**
   * Click button by text
   */
  async clickButton(text: string) {
    await this.page.getByRole('button', { name: new RegExp(text, 'i') }).click();
  }
}
```

### 2. Login Page Object

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);

    // Define all locators
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /sign in|login/i });
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await super.goto('/login');
    await this.waitForPageLoad();
  }

  /**
   * Perform login
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Quick login with default credentials
   */
  async loginAsEmployee() {
    await this.login('employee@test.com', 'Password123!');
  }

  async loginAsManager() {
    await this.login('manager@test.com', 'Password123!');
  }

  async loginAsAdmin() {
    await this.login('admin@test.com', 'Password123!');
  }

  /**
   * Attempt login with invalid credentials
   */
  async loginWithInvalidCredentials() {
    await this.login('invalid@test.com', 'wrongpassword');
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorText(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Check if user is on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    const title = await this.getTitle();
    return title.includes('Login') || title.includes('Sign In');
  }

  /**
   * Logout
   */
  async logout() {
    await this.page.getByRole('button', { name: /logout|sign out/i }).click();
  }
}
```

### 3. Leave Management Page Object

```typescript
// tests/e2e/pages/LeavePage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface LeaveFormData {
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export class LeavePage extends BasePage {
  // Locators - List view
  readonly applyLeaveButton: Locator;
  readonly leaveTable: Locator;
  readonly balanceCard: Locator;
  readonly searchInput: Locator;

  // Locators - Form
  readonly leaveTypeSelect: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly reasonTextarea: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Locators - Messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // List view locators
    this.applyLeaveButton = page.getByRole('button', { name: /apply leave/i });
    this.leaveTable = page.getByRole('table');
    this.balanceCard = page.getByTestId('leave-balance-card');
    this.searchInput = page.getByPlaceholder(/search/i);

    // Form locators
    this.leaveTypeSelect = page.getByLabel(/leave type/i);
    this.startDateInput = page.getByLabel(/start date/i);
    this.endDateInput = page.getByLabel(/end date/i);
    this.reasonTextarea = page.getByLabel(/reason/i);
    this.submitButton = page.getByRole('button', { name: /submit|apply/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });

    // Message locators
    this.successMessage = page.getByRole('alert').filter({ hasText: /success/i });
    this.errorMessage = page.getByRole('alert').filter({ hasText: /error/i });
  }

  /**
   * Navigate to leave page
   */
  async goto() {
    await super.goto('/dashboard/leave');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to approvals page
   */
  async gotoApprovals() {
    await super.goto('/dashboard/leave/approvals');
    await this.waitForPageLoad();
  }

  /**
   * Click apply leave button
   */
  async clickApplyLeave() {
    await this.applyLeaveButton.click();
  }

  /**
   * Fill leave application form
   */
  async fillLeaveForm(data: LeaveFormData) {
    await this.leaveTypeSelect.selectOption(data.type);
    await this.startDateInput.fill(data.startDate);
    await this.endDateInput.fill(data.endDate);

    if (data.reason) {
      await this.reasonTextarea.fill(data.reason);
    }
  }

  /**
   * Submit leave request
   */
  async submitLeaveRequest() {
    await this.submitButton.click();
  }

  /**
   * Apply for leave (complete flow)
   */
  async applyForLeave(data: LeaveFormData) {
    await this.clickApplyLeave();
    await this.fillLeaveForm(data);
    await this.submitLeaveRequest();
  }

  /**
   * Get leave balance for a specific type
   */
  async getLeaveBalance(type: string): Promise<number> {
    const balanceText = await this.balanceCard
      .filter({ hasText: type })
      .getByTestId('balance-value')
      .textContent();

    return parseInt(balanceText || '0', 10);
  }

  /**
   * Get annual leave balance
   */
  async getAnnualLeaveBalance(): Promise<number> {
    return await this.getLeaveBalance('Annual Leave');
  }

  /**
   * Search for leave records
   */
  async searchLeave(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
  }

  /**
   * Get all leave rows
   */
  async getLeaveRows() {
    return await this.leaveTable.getByRole('row').all();
  }

  /**
   * Get leave row by reason
   */
  getLeaveRowByReason(reason: string) {
    return this.leaveTable.getByRole('row').filter({ hasText: reason });
  }

  /**
   * Approve leave request
   */
  async approveLeave(reason: string) {
    const row = this.getLeaveRowByReason(reason);
    await row.getByRole('button', { name: /approve/i }).click();
    await this.page.getByRole('button', { name: /confirm/i }).click();
  }

  /**
   * Reject leave request
   */
  async rejectLeave(reason: string, rejectionReason: string) {
    const row = this.getLeaveRowByReason(reason);
    await row.getByRole('button', { name: /reject/i }).click();
    await this.page.getByLabel(/rejection reason/i).fill(rejectionReason);
    await this.page.getByRole('button', { name: /confirm/i }).click();
  }

  /**
   * Cancel leave request
   */
  async cancelLeave(reason: string) {
    const row = this.getLeaveRowByReason(reason);
    await row.getByRole('button', { name: /cancel/i }).click();
    await this.page.getByRole('button', { name: /confirm/i }).click();
  }

  /**
   * Get leave status
   */
  async getLeaveStatus(reason: string): Promise<string> {
    const row = this.getLeaveRowByReason(reason);
    const statusBadge = row.getByTestId('leave-status');
    return await statusBadge.textContent() || '';
  }

  /**
   * Check if success message is visible
   */
  async hasSuccessMessage(): Promise<boolean> {
    return await this.successMessage.isVisible();
  }

  /**
   * Check if error message is visible
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }
}
```

---

## Writing E2E Tests

### Test Structure

```typescript
// tests/e2e/specs/leave-management.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LeavePage } from '../pages/LeavePage';

test.describe('Leave Management', () => {
  let loginPage: LoginPage;
  let leavePage: LeavePage;

  // Setup before each test
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    leavePage = new LeavePage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.loginAsEmployee();
  });

  test('employee can apply for annual leave', async ({ page }) => {
    // Navigate to leave page
    await leavePage.goto();

    // Get initial balance
    const initialBalance = await leavePage.getAnnualLeaveBalance();

    // Apply for leave
    await leavePage.applyForLeave({
      type: 'Annual Leave',
      startDate: '2025-02-01',
      endDate: '2025-02-03',
      reason: 'Family vacation'
    });

    // Verify success
    await expect(leavePage.successMessage).toBeVisible();

    // Verify leave appears in list
    const leaveRow = leavePage.getLeaveRowByReason('Family vacation');
    await expect(leaveRow).toBeVisible();

    // Verify status is pending
    const status = await leavePage.getLeaveStatus('Family vacation');
    expect(status.toLowerCase()).toContain('pending');
  });

  test('manager can approve leave request', async ({ page, context }) => {
    // Employee applies for leave
    await leavePage.goto();
    await leavePage.applyForLeave({
      type: 'Annual Leave',
      startDate: '2025-02-01',
      endDate: '2025-02-03',
      reason: 'Team building'
    });

    // Logout as employee
    await loginPage.logout();

    // Login as manager
    await loginPage.goto();
    await loginPage.loginAsManager();

    // Navigate to approvals
    await leavePage.gotoApprovals();

    // Approve the leave
    await leavePage.approveLeave('Team building');

    // Verify success message
    await expect(leavePage.successMessage).toBeVisible();

    // Verify status changed
    const status = await leavePage.getLeaveStatus('Team building');
    expect(status.toLowerCase()).toContain('approved');
  });

  test('cannot apply leave with insufficient balance', async ({ page }) => {
    await leavePage.goto();

    // Try to apply for more days than available
    await leavePage.applyForLeave({
      type: 'Annual Leave',
      startDate: '2025-01-01',
      endDate: '2025-12-31', // 365 days
      reason: 'Extended sabbatical'
    });

    // Verify error message
    await expect(leavePage.errorMessage).toBeVisible();
    await expect(leavePage.errorMessage).toContainText(/insufficient.*balance/i);
  });
});
```

---

## Best Practices

### 1. Use Descriptive Method Names

```typescript
// ✅ Good
async applyForLeave(data: LeaveFormData)
async approveLeaveRequest(id: string)
async getAnnualLeaveBalance(): Promise<number>

// ❌ Bad
async doAction(data: any)
async click()
async get(): Promise<any>
```

### 2. Return Page Objects for Chaining

```typescript
class EmployeePage extends BasePage {
  async fillEmployeeForm(data: EmployeeData): Promise<this> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    return this; // Enable chaining
  }

  async submit(): Promise<this> {
    await this.submitButton.click();
    return this;
  }
}

// Usage
await employeePage
  .fillEmployeeForm({ firstName: 'John', lastName: 'Doe' })
  .submit();
```

### 3. Handle Waits Properly

```typescript
class PayrollPage extends BasePage {
  async processPayroll() {
    await this.processButton.click();

    // Wait for processing to complete
    await this.page.waitForSelector('[data-status="completed"]', {
      timeout: 30000 // 30 seconds for long-running operation
    });
  }

  async waitForReportGeneration() {
    await this.page.waitForResponse(
      response => response.url().includes('/api/reports') && response.status() === 200
    );
  }
}
```

### 4. Use Data-Driven Tests

```typescript
// Test data
const leaveTypes = [
  { type: 'Annual Leave', days: 3 },
  { type: 'Sick Leave', days: 2 },
  { type: 'Emergency Leave', days: 1 }
];

leaveTypes.forEach(({ type, days }) => {
  test(`employee can apply for ${type}`, async ({ page }) => {
    const leavePage = new LeavePage(page);

    await leavePage.applyForLeave({
      type,
      startDate: '2025-02-01',
      endDate: new Date(2025, 1, days + 1).toISOString().split('T')[0]
    });

    await expect(leavePage.successMessage).toBeVisible();
  });
});
```

### 5. Create Helper Methods

```typescript
class LeavePage extends BasePage {
  /**
   * Complete flow: Apply and approve leave
   */
  async applyAndApproveLeave(data: LeaveFormData) {
    // Apply
    await this.applyForLeave(data);

    // Switch to manager
    await this.page.context().newPage();
    const loginPage = new LoginPage(this.page);
    await loginPage.loginAsManager();

    // Approve
    await this.gotoApprovals();
    await this.approveLeave(data.reason!);
  }
}
```

---

## Common Patterns

### Pattern 1: Navigation

```typescript
class NavigationComponent {
  constructor(private page: Page) {}

  async goToEmployees() {
    await this.page.getByRole('link', { name: /employees/i }).click();
  }

  async goToLeave() {
    await this.page.getByRole('link', { name: /leave/i }).click();
  }

  async goToPayroll() {
    await this.page.getByRole('link', { name: /payroll/i }).click();
  }
}

// Use in page objects
class EmployeePage extends BasePage {
  private nav: NavigationComponent;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationComponent(page);
  }
}
```

### Pattern 2: Assertions

```typescript
class LeavePage extends BasePage {
  /**
   * Assert leave is in pending state
   */
  async assertLeavePending(reason: string) {
    const status = await this.getLeaveStatus(reason);
    expect(status.toLowerCase()).toContain('pending');
  }

  /**
   * Assert success message is shown
   */
  async assertSuccess() {
    await expect(this.successMessage).toBeVisible();
  }
}
```

---

## Summary

**Key Takeaways:**
1. ✅ One page object per page/component
2. ✅ Encapsulate locators and actions
3. ✅ Use descriptive method names
4. ✅ Keep tests clean and readable
5. ✅ Reuse page objects across tests
6. ✅ Handle waits properly
7. ✅ Create helper methods for common flows

**Project Checklist:**
- [ ] Create BasePage with common functionality
- [ ] Create page object for each major page
- [ ] Define all locators in constructor
- [ ] Create methods for all user actions
- [ ] Add assertions where appropriate
- [ ] Document complex methods
- [ ] Write tests using page objects

---

**Next Steps:**
- Create page objects for your application
- Write E2E tests using the page objects
- Run tests: `pnpm test:e2e`
- Review test reports

**Last Updated:** December 27, 2024
**Next Review:** January 3, 2025
