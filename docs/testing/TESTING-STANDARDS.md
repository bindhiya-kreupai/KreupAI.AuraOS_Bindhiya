# AuraOS Testing Standards & Guidelines
**Version:** 1.0
**Last Updated:** December 27, 2024
**Owner:** QA Team (Dev A & Dev B)
**Status:** Draft - Pending Approval

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Coverage Requirements](#test-coverage-requirements)
3. [Testing Standards by Type](#testing-standards-by-type)
4. [Code Review Process for Tests](#code-review-process-for-tests)
5. [Test Naming Conventions](#test-naming-conventions)
6. [Test Data Management](#test-data-management)
7. [Critical Modules](#critical-modules)
8. [Accessibility Testing Standards](#accessibility-testing-standards)

---

## 1. Testing Philosophy

### 1.1 Core Principles

**"Testing is not just QA's responsibility - it's everyone's responsibility"**

- **Shift-Left Testing**: Write tests as you write code, not after
- **Test Pyramid**: 65% Unit → 25% Integration → 10% E2E
- **Fast Feedback**: Unit tests should run in < 2 minutes
- **Reliable Tests**: Zero tolerance for flaky tests
- **Meaningful Coverage**: Focus on business logic, not just coverage percentage

### 1.2 Quality Gates

All code must pass these gates before merging:

| Gate | Requirement | Blocking |
|------|-------------|----------|
| Unit Tests | All passing | ✅ Yes |
| Coverage (New Code) | ≥ 80% | ✅ Yes |
| Coverage (Total) | ≥ 70% | ✅ Yes |
| Lint Errors | 0 errors | ✅ Yes |
| Type Errors | 0 errors | ✅ Yes |
| Security (High) | 0 high/critical | ✅ Yes |

---

## 2. Test Coverage Requirements

### 2.1 Coverage Targets by Module Type

| Module Type | Target Coverage | Priority |
|-------------|-----------------|----------|
| Authentication & Authorization | 95% | Critical |
| Payment Processing | 95% | Critical |
| Payroll Calculations | 95% | Critical |
| Multi-tenant Isolation | 95% | Critical |
| Compliance & Regulatory | 90% | High |
| Core Business Logic | 85% | High |
| API Endpoints | 80% | High |
| UI Components | 75% | Medium |
| Utilities & Helpers | 90% | High |

### 2.2 Coverage Measurement

```bash
# Run coverage for all tests
pnpm test:coverage

# Coverage thresholds (vitest.config.ts)
{
  lines: 70,       # Overall line coverage
  functions: 70,   # Function coverage
  branches: 60,    # Branch coverage
  statements: 70   # Statement coverage
}
```

**Coverage Exclusions:**
- Type definition files (*.d.ts)
- Configuration files (*.config.*)
- Test files themselves
- Mock data
- Next.js build files (.next/)

---

## 3. Testing Standards by Type

### 3.1 Unit Tests

**Purpose:** Test individual functions, components, or classes in isolation

**Standards:**
- ✅ **Fast**: < 10ms per test
- ✅ **Isolated**: No external dependencies (use mocks)
- ✅ **Independent**: Can run in any order
- ✅ **Repeatable**: Same input = same output
- ✅ **Self-validating**: Clear pass/fail

**Example Structure:**
```typescript
// src/utils/salary-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateNetSalary } from './salary-calculator';

describe('calculateNetSalary', () => {
  it('calculates net salary correctly with basic tax', () => {
    const result = calculateNetSalary({
      basic: 10000,
      allowances: 2000,
      taxRate: 0.15
    });

    expect(result.netSalary).toBe(10200); // (12000 * 0.85)
    expect(result.tax).toBe(1800);
  });

  it('handles zero tax rate', () => {
    const result = calculateNetSalary({
      basic: 10000,
      allowances: 0,
      taxRate: 0
    });

    expect(result.netSalary).toBe(10000);
    expect(result.tax).toBe(0);
  });

  it('throws error for negative salary', () => {
    expect(() => calculateNetSalary({
      basic: -1000,
      allowances: 0,
      taxRate: 0.15
    })).toThrow('Salary cannot be negative');
  });
});
```

### 3.2 Component Tests

**Purpose:** Test React components with user interactions

**Standards:**
- ✅ Test user behavior, not implementation details
- ✅ Use `@testing-library/react` queries by priority: `getByRole` > `getByLabelText` > `getByText`
- ✅ Avoid testing CSS classes or inline styles
- ✅ Test accessibility (aria labels, roles, keyboard navigation)

**Example:**
```typescript
// src/components/EmployeeCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeCard } from './EmployeeCard';

describe('EmployeeCard', () => {
  const mockEmployee = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    position: 'Software Engineer',
    status: 'ACTIVE'
  };

  it('renders employee information', () => {
    render(<EmployeeCard employee={mockEmployee} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const handleEdit = vi.fn();
    render(<EmployeeCard employee={mockEmployee} onEdit={handleEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(handleEdit).toHaveBeenCalledWith('1');
  });
});
```

### 3.3 Integration Tests

**Purpose:** Test multiple modules working together

**Standards:**
- ✅ Test real database interactions (test database)
- ✅ Test API contracts
- ✅ Test service layer integrations
- ✅ Clean up test data after each test

**Example:**
```typescript
// src/__tests__/integration/employee-creation.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@aura/database';
import { EmployeeService } from '@/services/employee.service';

describe('Employee Creation Integration', () => {
  let tenantId: string;

  beforeEach(async () => {
    // Setup test tenant
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Company' }
    });
    tenantId = tenant.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.employee.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
  });

  it('creates employee with complete profile', async () => {
    const employeeData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@test.com',
      departmentId: 'dept-123',
      tenantId
    };

    const employee = await EmployeeService.create(employeeData);

    expect(employee.id).toBeDefined();
    expect(employee.email).toBe('jane.smith@test.com');

    // Verify in database
    const dbEmployee = await prisma.employee.findUnique({
      where: { id: employee.id }
    });
    expect(dbEmployee).not.toBeNull();
  });
});
```

### 3.4 E2E Tests

**Purpose:** Test complete user workflows from UI to database

**Standards:**
- ✅ Test critical user journeys only
- ✅ Use Page Object Model pattern
- ✅ Run in CI/CD with real database
- ✅ Use stable selectors (data-testid, role, label)
- ✅ Maximum 20 minutes execution time

**Example:**
```typescript
// tests/e2e/leave-application.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { LeavePage } from './pages/LeavePage';

test.describe('Leave Application Flow', () => {
  test('employee can apply for annual leave', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const leavePage = new LeavePage(page);

    // Login
    await loginPage.goto();
    await loginPage.login('employee@test.com', 'Password123!');

    // Navigate to leave page
    await leavePage.goto();
    await leavePage.clickApplyLeave();

    // Fill form
    await leavePage.fillLeaveForm({
      type: 'Annual Leave',
      startDate: '2025-02-01',
      endDate: '2025-02-03',
      reason: 'Family vacation'
    });

    await leavePage.submitLeaveRequest();

    // Verify
    await expect(page.getByText('Leave request submitted')).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();
  });
});
```

---

## 4. Code Review Process for Tests

### 4.1 Test Review Checklist

**Before Submitting PR:**
- [ ] All tests pass locally
- [ ] Coverage meets minimum thresholds
- [ ] No flaky tests (run 10x to verify)
- [ ] Test names are descriptive
- [ ] Edge cases covered
- [ ] Error cases tested
- [ ] Cleanup code present (afterEach/afterAll)

**Reviewer Responsibilities:**
- [ ] Verify tests actually test what they claim
- [ ] Check for proper assertions
- [ ] Ensure tests are maintainable
- [ ] Validate test data setup
- [ ] Check for hardcoded values
- [ ] Ensure proper mocking

### 4.2 Common Test Code Smells

🚫 **Avoid:**
- Testing implementation details (internal state)
- Hardcoded IDs or dates
- Tests that depend on execution order
- Overly complex test setup
- Multiple concerns in one test
- Assertions without clear meaning

✅ **Prefer:**
- Testing user-facing behavior
- Using factories for test data
- Independent, isolated tests
- Simple, focused test setup
- One concern per test
- Descriptive assertion messages

---

## 5. Test Naming Conventions

### 5.1 File Naming

```
Component Tests:    ComponentName.test.tsx
Unit Tests:         functionName.test.ts
Integration Tests:  feature-name.integration.test.ts
E2E Tests:          feature-name.spec.ts
```

### 5.2 Test Description Format

**Pattern:** `[Unit/Function] should [expected behavior] when [condition]`

**Examples:**
```typescript
✅ Good:
- "calculateSalary should return correct net amount when tax is applied"
- "EmployeeCard should call onDelete when delete button is clicked"
- "LoginForm should show error when password is invalid"

❌ Bad:
- "test 1"
- "it works"
- "handles edge case"
```

---

## 6. Test Data Management

### 6.1 Test Factories

Use factories to generate consistent test data:

```typescript
// src/__tests__/factories/employee.factory.ts
import { faker } from '@faker-js/faker';

export const EmployeeFactory = {
  build(overrides = {}) {
    return {
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      status: 'ACTIVE',
      joinDate: faker.date.past(),
      ...overrides
    };
  },

  buildMany(count: number, overrides = {}) {
    return Array.from({ length: count }, () => this.build(overrides));
  }
};
```

### 6.2 Test Fixtures

Define reusable test data:

```typescript
// src/__tests__/fixtures/users.ts
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    role: 'ADMIN',
    permissions: ['*']
  },
  hrManager: {
    email: 'hr@test.com',
    role: 'HR_MANAGER',
    permissions: ['employees:read', 'employees:write', 'leaves:approve']
  },
  employee: {
    email: 'employee@test.com',
    role: 'EMPLOYEE',
    permissions: ['self:read']
  }
};
```

---

## 7. Critical Modules

### 7.1 Priority 1 (Critical) - Requires 95% Coverage

**Authentication & Authorization**
- `/src/lib/auth/`
- `/src/middleware/auth.middleware.ts`
- Multi-factor authentication
- Session management

**Payroll Processing**
- `/src/services/payroll/`
- Salary calculations
- Tax calculations
- Statutory compliance (GOSI, EOSB, etc.)

**Multi-tenant Isolation**
- `/src/middleware/tenant.middleware.ts`
- Tenant data isolation logic

### 7.2 Priority 2 (High) - Requires 85% Coverage

**Leave Management**
- Leave application workflows
- Leave balance calculations
- Approval chains

**Employee Management**
- Employee CRUD operations
- Employee lifecycle (onboarding, termination)

**Attendance & Time Tracking**
- Clock in/out logic
- Overtime calculations
- Shift management

### 7.3 Priority 3 (Medium) - Requires 75% Coverage

**Recruitment**
- Job posting
- Application tracking

**Performance Management**
- Goal setting
- Review cycles

**Reports & Analytics**
- Report generation
- Dashboard widgets

---

## 8. Accessibility Testing Standards

### 8.1 Automated Accessibility Tests

**Required for all UI components:**

```typescript
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 8.2 Manual Accessibility Checklist

**Dev B Responsibility - Manual Testing:**

- [ ] Keyboard Navigation
  - [ ] All interactive elements reachable via Tab
  - [ ] Tab order is logical
  - [ ] Focus indicators visible
  - [ ] Escape key closes modals/dropdowns
  - [ ] Enter/Space activates buttons

- [ ] Screen Reader Testing
  - [ ] Test with NVDA (Windows)
  - [ ] Test with JAWS (Windows)
  - [ ] Test with VoiceOver (macOS)
  - [ ] All images have alt text
  - [ ] Form labels properly associated
  - [ ] ARIA landmarks used correctly

- [ ] Color & Contrast
  - [ ] Text contrast ratio ≥ 4.5:1 (normal text)
  - [ ] Text contrast ratio ≥ 3:1 (large text)
  - [ ] Information not conveyed by color alone
  - [ ] Focus indicators have sufficient contrast

- [ ] WCAG 2.1 AA Compliance
  - [ ] All Level A criteria met
  - [ ] All Level AA criteria met

### 8.3 Accessibility Test Tools

**Automated Tools:**
- axe-core (in tests)
- Lighthouse (in CI)
- Pa11y (automated scans)

**Manual Tools:**
- Chrome DevTools Accessibility Panel
- WAVE Browser Extension
- Screen readers (NVDA, JAWS, VoiceOver)

---

## 9. Test Execution

### 9.1 Local Development

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e
```

### 9.2 CI/CD Pipeline

Tests run automatically on:
- Every push to feature branches
- Pull request creation
- Merge to main/develop
- Nightly (full suite + performance tests)

---

## 10. Best Practices

### 10.1 Do's ✅

- Write tests before fixing bugs (TDD for bug fixes)
- Keep tests simple and focused
- Use descriptive test names
- Test edge cases and error scenarios
- Clean up resources (database, files, mocks)
- Use TypeScript for type safety in tests
- Mock external dependencies
- Test user-facing behavior

### 10.2 Don'ts ❌

- Don't test framework code (React, Next.js)
- Don't test third-party libraries
- Don't share state between tests
- Don't use real external APIs in tests
- Don't hardcode dates or IDs
- Don't skip cleanup
- Don't test implementation details
- Don't write flaky tests

---

## Approval & Sign-off

**Status:** ⏳ Pending Approval

**Required Approvals:**
- [ ] Dev A (Claude - QA Engineer)
- [ ] Dev B (Human - QA Specialist) 👈 **YOUR REVIEW NEEDED**
- [ ] Engineering Manager
- [ ] Tech Lead

**Feedback & Comments:**

_Add your feedback below:_

---

**Last Updated:** December 27, 2024
**Next Review:** January 3, 2025
