# E2E Testing with Playwright

**Week 5: E2E Testing Setup**
**AuraOS HCM Platform - QA Implementation**

This directory contains end-to-end (E2E) tests for the AuraOS HCM platform using Playwright.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Page Object Model](#page-object-model)
- [Writing Tests](#writing-tests)
- [Test Data](#test-data)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Our E2E tests use [Playwright](https://playwright.dev/) for cross-browser testing with the Page Object Model (POM) design pattern. This approach provides:

- **Cross-browser testing**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Maintainable tests**: Page Object Model separates page logic from test logic
- **Type safety**: Full TypeScript support
- **Automatic waiting**: Smart waiting for elements and network requests
- **Detailed reporting**: HTML reports, screenshots, videos on failure
- **CI/CD ready**: JUnit XML reports for CI pipelines

## Setup

### 1. Install Dependencies

```bash
# From root directory
pnpm install

# Install Playwright browsers
cd apps/web
npx playwright install
```

### 2. Environment Setup

Ensure you have the following environment variables set:

```env
# Test database URL (separate from development database)
TEST_DATABASE_URL="postgresql://user:password@localhost:5432/auraos_test"

# Or use the development database (will be cleaned during tests)
DATABASE_URL="postgresql://user:password@localhost:5432/auraos_dev"

# Application URL (optional, defaults to http://localhost:3006)
PLAYWRIGHT_TEST_BASE_URL="http://localhost:3006"
```

### 3. Database Setup

The test database is automatically set up and cleaned before each test run via `global-setup.ts`. The setup:

- Cleans existing test data
- Creates test tenant: `test-tenant-e2e`
- Creates test users:
  - Admin: `admin@e2etest.com` / `Test@1234`
  - Manager: `manager@e2etest.com` / `Test@1234`
  - User: `user@e2etest.com` / `Test@1234`

## Running Tests

### All Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run in headed mode (see browser)
pnpm test:e2e --headed

# Run in UI mode (interactive)
pnpm test:e2e --ui
```

### Specific Browser

```bash
# Run on Chromium only
pnpm test:e2e --project=chromium

# Run on Firefox only
pnpm test:e2e --project=firefox

# Run on WebKit (Safari) only
pnpm test:e2e --project=webkit

# Run on mobile Chrome
pnpm test:e2e --project=mobile-chrome
```

### Specific Tests

```bash
# Run login tests only
pnpm test:e2e auth/login.spec.ts

# Run employee management tests only
pnpm test:e2e employees/employee-management.spec.ts

# Run tests matching pattern
pnpm test:e2e --grep "should create"
```

### Debug Mode

```bash
# Debug mode with Playwright Inspector
pnpm test:e2e --debug

# Debug specific test
pnpm test:e2e --debug auth/login.spec.ts
```

### View Reports

```bash
# View last HTML report
npx playwright show-report

# Report is automatically generated in playwright-report/
```

## Project Structure

```
src/__tests__/e2e/
├── README.md                      # This file
├── playwright.config.ts           # Main Playwright configuration
├── global-setup.ts                # Runs before all tests (DB setup)
├── global-teardown.ts             # Runs after all tests (cleanup)
│
├── fixtures/
│   └── test-users.ts              # Test user data fixtures
│
├── pages/                         # Page Object Models
│   ├── BasePage.ts                # Base class with common methods
│   ├── LoginPage.ts               # Login page interactions
│   ├── DashboardPage.ts           # Dashboard navigation
│   └── EmployeesPage.ts           # Employee management page
│
├── auth/
│   └── login.spec.ts              # Authentication E2E tests (15 tests)
│
└── employees/
    └── employee-management.spec.ts # Employee CRUD E2E tests (15+ tests)
```

## Page Object Model

### What is Page Object Model?

Page Object Model (POM) is a design pattern that:
- **Separates concerns**: Page logic vs test logic
- **Reduces duplication**: Reusable page methods
- **Improves maintenance**: Change UI in one place
- **Enhances readability**: Test reads like user actions

### BasePage

All page objects extend `BasePage`, which provides common functionality:

```typescript
import { BasePage } from '../pages/BasePage';

class MyPage extends BasePage {
  // Page-specific methods
}
```

**Common methods available:**
- `goto(path)` - Navigate to path
- `waitForPageLoad()` - Wait for network idle
- `clickElement(locator)` - Click with retry
- `fillInput(locator, value)` - Clear and fill input
- `waitForElement(locator)` - Wait for element visible
- `assertElementVisible(locator)` - Assert element visible
- `waitForToast(message)` - Wait for notification
- `waitForAPIResponse(pattern)` - Wait for API call
- 30+ utility methods total

### Example Page Object

```typescript
export class EmployeesPage extends BasePage {
  // Locators
  private addEmployeeButton: Locator;
  private employeeListTable: Locator;

  constructor(page: Page) {
    super(page);
    this.addEmployeeButton = page.locator('button:has-text("Add Employee")');
    this.employeeListTable = page.locator('table');
  }

  // Actions
  async navigate() {
    await this.goto('/employees');
    await this.waitForPageLoad();
  }

  async clickAddEmployee() {
    await this.clickElement(this.addEmployeeButton);
    await this.waitForPageLoad();
  }

  // High-level workflows
  async createEmployee(data: EmployeeData) {
    await this.clickAddEmployee();
    await this.fillEmployeeForm(data);
    await this.clickSave();
    await this.waitForToast('Employee created successfully');
  }
}
```

## Writing Tests

### Test Structure

Follow the **Arrange-Act-Assert** pattern:

```typescript
test('should create new employee', async ({ page }) => {
  // Arrange - Set up test data
  const employeesPage = new EmployeesPage(page);
  const newEmployee = {
    firstName: 'John',
    lastName: 'Doe',
    email: `john.doe.${Date.now()}@e2etest.com`,
  };

  // Act - Perform action
  await employeesPage.createEmployee(newEmployee);

  // Assert - Verify result
  await employeesPage.assertEmployeeExists(newEmployee.email);
});
```

### Test Independence

Each test must be independent:

```typescript
// ✅ Good - Test creates own data
test('should update employee', async ({ page }) => {
  const employee = { /* ... */ };
  await employeesPage.createEmployee(employee);
  await employeesPage.updateEmployee(employee.email, updatedData);
});

// ❌ Bad - Test depends on previous test
let globalEmployee;
test('create employee', async ({ page }) => {
  globalEmployee = { /* ... */ };
  // Creates employee
});
test('update employee', async ({ page }) => {
  // Uses globalEmployee - will fail if run alone
});
```

### Using Test Fixtures

Use test user fixtures for consistency:

```typescript
import { testUsers } from '../fixtures/test-users';

test('admin should see all employees', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginWithTestUser(testUsers.admin);

  // Test admin functionality
});
```

### Dynamic Test Data

Use timestamps to avoid conflicts:

```typescript
const uniqueEmail = `test.user.${Date.now()}@e2etest.com`;
const uniqueCode = `EMP-${Date.now()}`;
```

## Test Data

### Test Users

Three test users are automatically created:

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| Admin | admin@e2etest.com | Test@1234 | Full access tests |
| Manager | manager@e2etest.com | Test@1234 | Manager permission tests |
| User | user@e2etest.com | Test@1234 | Limited access tests |

All users belong to tenant: `test-tenant-e2e`

### Test Tenant

A dedicated test tenant is created:
- **ID**: `test-tenant-e2e`
- **Name**: E2E Test Tenant
- **Subdomain**: e2e-test

### Cleanup

Test data is automatically cleaned up:
- **Before tests**: `global-setup.ts` cleans and recreates test data
- **After tests**: `global-teardown.ts` can perform additional cleanup

## Best Practices

### 1. Use Page Objects

```typescript
// ✅ Good - Use page object
await employeesPage.createEmployee(data);

// ❌ Bad - Direct page interactions in test
await page.click('button:has-text("Add")');
await page.fill('input[name="firstName"]', 'John');
```

### 2. Wait for State, Not Time

```typescript
// ✅ Good - Wait for element or state
await page.waitForSelector('table tbody tr');

// ❌ Bad - Arbitrary sleep
await page.waitForTimeout(3000);
```

### 3. Descriptive Test Names

```typescript
// ✅ Good
test('should prevent duplicate employee codes with 409 error', async () => {});

// ❌ Bad
test('employee test', async () => {});
```

### 4. Test Both Success and Failure

```typescript
test.describe('Employee Creation', () => {
  test('should create employee with valid data', async () => {});
  test('should reject employee with invalid email', async () => {});
  test('should reject employee with missing required fields', async () => {});
});
```

### 5. Isolate Tests

```typescript
// ✅ Good - Each test creates own data
test.beforeEach(async ({ page }) => {
  // Fresh login for each test
  await loginPage.loginAsAdmin();
});

// ❌ Bad - Shared state
let sharedEmployee;
test.beforeAll(async () => {
  sharedEmployee = await createEmployee();
});
```

## Troubleshooting

### Tests Fail to Start

**Problem**: `Cannot find module '@playwright/test'`

**Solution**:
```bash
# Install dependencies
pnpm install

# Install browsers
npx playwright install
```

### Database Connection Errors

**Problem**: `P1001: Can't reach database server`

**Solution**:
```bash
# Check TEST_DATABASE_URL is set
echo $TEST_DATABASE_URL

# Verify database is running
psql -h localhost -p 5432 -U postgres
```

### Web Server Not Starting

**Problem**: `webServer: http://localhost:3006 is not available`

**Solution**:
```bash
# Check if port 3006 is in use
lsof -i :3006

# Kill process if needed
kill -9 <PID>

# Or change port in playwright.config.ts
```

### Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Solutions**:
1. Use `waitForElement()` instead of fixed timeouts
2. Wait for network idle: `await page.waitForLoadState('networkidle')`
3. Increase timeout for slow operations: `await page.waitForSelector('...', { timeout: 10000 })`
4. Use unique test data with timestamps

### Screenshots/Videos Not Captured

**Problem**: No screenshots on failure

**Solution**: Check `playwright.config.ts`:
```typescript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

Artifacts are saved in:
- `test-results/` - Screenshots and videos
- `playwright-report/` - HTML report

### Authentication Issues

**Problem**: Login fails in tests

**Solution**:
1. Check test users were created: Look for `global-setup.ts` logs
2. Verify password hashing: `bcryptjs` should be installed
3. Check session management: Ensure cookies are set correctly

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          TEST_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Environment Variables for CI

Set these in your CI/CD pipeline:
- `TEST_DATABASE_URL` - Test database connection
- `CI=true` - Enables CI-specific config (retries, single worker)

## Test Coverage

### Current Coverage (Week 5)

| Module | Test File | Test Count | Coverage |
|--------|-----------|------------|----------|
| **Authentication** | `auth/login.spec.ts` | 15 | Login, logout, validation, session |
| **Employee Management** | `employees/employee-management.spec.ts` | 15+ | CRUD, search, validation, access control |

**Total**: 30+ E2E tests

### Planned Coverage (Week 5-6)

**Dev B responsibilities (60%)**:
- Leave Management flows (apply, approve, reject, cancel)
- User journey scenarios
- Exploratory testing

## Resources

### Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

### Internal Docs

- [Week 1 Completion Summary](../../../../../docs/testing/WEEK-1-COMPLETION-SUMMARY.md)
- [Week 3 API Testing Patterns](../../../../../docs/testing/API-TESTING-PATTERNS.md)
- [QA Progress Report](../../../../../docs/gps-solutions/QA-PROGRESS-REPORT.md)

### Week 5 Deliverables

**Dev A (40%) - COMPLETE**:
- ✅ Playwright configuration
- ✅ Global setup/teardown
- ✅ Base Page Object Models (4 pages)
- ✅ Authentication E2E tests (15 tests)
- ✅ Employee Management E2E tests (15+ tests)

**Dev B (60%) - PENDING**:
- ⏳ Leave Management E2E flows
- ⏳ User journey test scenarios
- ⏳ Test data scenarios
- ⏳ Exploratory testing

---

**Created**: Week 5 - E2E Testing Setup
**Last Updated**: December 27, 2024
**Status**: ✅ Dev A Complete | ⏳ Dev B Pending
