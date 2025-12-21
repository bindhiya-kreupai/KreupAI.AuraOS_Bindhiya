# Testing Documentation

## Overview

AuraOS uses **Vitest** as the testing framework for unit and integration tests. This document provides comprehensive information about the testing setup, how to run tests, and best practices.

## Test Structure

```
apps/web/src/__tests__/
├── setup.ts                           # Global test setup and mocks
├── services/                          # Service layer unit tests
│   ├── user.service.test.ts          # UserService tests
│   ├── license.service.test.ts       # LicenseService tests
│   └── master-data.service.test.ts   # MasterDataService tests
└── README.md                          # This file
```

## Installation

### Prerequisites

Before running tests, ensure all dependencies are installed:

```bash
# From project root
pnpm install

# If NODE_ENV is set to production, temporarily unset it
env -u NODE_ENV pnpm install
```

### Test Dependencies

The following testing packages are required:

- **vitest**: Fast unit test framework powered by Vite
- **@vitest/ui**: Optional UI for viewing test results
- **@testing-library/react**: React testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM testing

These are already listed in `package.json` under `devDependencies`.

## Running Tests

### Available Scripts

```bash
# Run tests in watch mode (interactive)
pnpm test

# Run all tests once (CI mode)
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

### Examples

```bash
# Run all tests
cd apps/web
pnpm test:run

# Run specific test file
pnpm test user.service.test.ts

# Run tests in watch mode
pnpm test

# View test coverage
pnpm test:coverage
```

## Test Configuration

### Vitest Config

Configuration is defined in [`vitest.config.ts`](../../vitest.config.ts):

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@aura/database': path.resolve(__dirname, '../../packages/@aura/database/src'),
      '@aura/config': path.resolve(__dirname, '../../packages/@aura/config/src'),
    },
  },
});
```

### Test Setup

Global test setup is in [`setup.ts`](./setup.ts) and includes:

1. **Environment Variables**: All required env vars are mocked for tests
2. **Prisma Mocks**: Complete mock of Prisma Client
3. **Test Hooks**: beforeAll, afterEach, afterAll
4. **Transaction Mocks**: Mock implementation of $transaction

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from '@/lib/services';
import { prisma } from '@aura/database';

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        status: 'Active',
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById('user-1', 'admin-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should return error when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await userService.getUserById('non-existent', 'admin-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });
});
```

### Testing Patterns

#### 1. Mocking Prisma Calls

```typescript
// Mock successful query
vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

// Mock query returning null
vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

// Mock query throwing error
vi.mocked(prisma.user.findUnique).mockRejectedValue(
  new Error('Database error')
);

// Mock transaction
const mockTransaction = vi.fn().mockResolvedValue(result);
vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);
```

#### 2. Testing Service Responses

All services return `ServiceResponse` with this structure:

```typescript
interface ServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

Test both success and error cases:

```typescript
// Test success case
expect(result.success).toBe(true);
expect(result.data).toEqual(expectedData);

// Test error case
expect(result.success).toBe(false);
expect(result.error).toBe('Expected error message');
```

#### 3. Testing with Pagination

```typescript
it('should return paginated results', async () => {
  vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);
  vi.mocked(prisma.user.count).mockResolvedValue(100);

  const result = await userService.listUsers(
    { page: 1, limit: 10 },
    'admin-1'
  );

  expect(result.meta).toEqual({
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10,
  });
});
```

#### 4. Testing Error Scenarios

```typescript
it('should handle database errors gracefully', async () => {
  vi.mocked(prisma.user.findUnique).mockRejectedValue(
    new Error('Connection timeout')
  );

  const result = await userService.getUserById('user-1', 'admin-1');

  expect(result.success).toBe(false);
  expect(result.error).toBe('Failed to retrieve user');
});

it('should handle Prisma specific errors', async () => {
  const prismaError = new Error('Record not found');
  (prismaError as any).code = 'P2025';

  vi.mocked(prisma.$transaction).mockRejectedValue(prismaError);

  const result = await userService.updateUser(
    'non-existent',
    { email: 'new@example.com' },
    'admin-1',
    '127.0.0.1'
  );

  expect(result.success).toBe(false);
});
```

## Test Coverage

### Running Coverage Reports

```bash
pnpm test:coverage
```

This generates:
- **Console output**: Summary of coverage percentages
- **HTML report**: `coverage/index.html` - Detailed line-by-line coverage

### Coverage Goals

Target coverage metrics:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### Viewing Coverage

```bash
# Generate and view HTML report
pnpm test:coverage
open coverage/index.html
```

## Best Practices

### 1. Test Organization

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should handle success case', () => {});
    it('should handle error case', () => {});
    it('should validate input', () => {});
  });
});
```

### 2. Clear Test Names

```typescript
// ❌ Bad
it('works', () => {});

// ✅ Good
it('should return user when valid ID is provided', () => {});
it('should return error when user not found', () => {});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should create new user', async () => {
  // Arrange - Set up test data and mocks
  const input = { email: 'test@example.com', password: 'pass123' };
  vi.mocked(prisma.$transaction).mockResolvedValue(mockUser);

  // Act - Execute the function being tested
  const result = await userService.createUser(input, 'admin-1', '127.0.0.1');

  // Assert - Verify the results
  expect(result.success).toBe(true);
  expect(result.data).toEqual(mockUser);
});
```

### 4. Mock Cleanup

```typescript
describe('UserService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  // Tests here...
});
```

### 5. Test Isolation

Each test should be independent and not rely on other tests:

```typescript
// ❌ Bad - Tests depend on each other
it('test 1', () => {
  globalState.user = mockUser;
});

it('test 2', () => {
  expect(globalState.user).toBeDefined(); // Depends on test 1
});

// ✅ Good - Each test is self-contained
it('test 1', () => {
  const user = mockUser;
  expect(user).toBeDefined();
});

it('test 2', () => {
  const user = mockUser;
  expect(user).toBeDefined();
});
```

## Current Test Coverage

### Service Layer Tests

#### UserService (`user.service.test.ts`)
- ✅ listUsers - pagination, filtering, error handling
- ✅ getUserById - success, not found, errors
- ✅ createUser - success, duplicates, validation
- ✅ updateUser - success, not found, errors
- ✅ deleteUser - success, not found, errors
- ✅ userExistsByEmail - exists, not exists, errors

**Total Tests**: 18
**Coverage**: Service methods fully covered

#### LicenseService (`license.service.test.ts`)
- ✅ listLicenses - pagination, filtering by status/type
- ✅ getLicenseById - success, not found, errors
- ✅ createLicense - success, validation, errors
- ✅ updateLicense - success, expired licenses, errors
- ✅ deleteLicense - success, not found, errors
- ✅ checkLicenseAvailability - available, full, expired, missing

**Total Tests**: 15
**Coverage**: Service methods fully covered

#### MasterDataService (`master-data.service.test.ts`)
- ✅ listEntities - countries, states, cities, currencies, languages
- ✅ getEntityById - all entity types, not found, invalid type
- ✅ createEntity - all entity types, duplicates, errors
- ✅ updateEntity - all entity types, not found, errors
- ✅ deleteEntity - all entity types, foreign keys, errors
- ✅ Database errors - connection, transactions

**Total Tests**: 24
**Coverage**: All entity types and operations covered

### Summary

- **Total Test Files**: 3
- **Total Tests**: 57
- **All tests**: Comprehensive coverage of service layer

## Troubleshooting

### Tests Won't Run

**Error**: `sh: vitest: command not found`

**Solution**:
```bash
# Ensure NODE_ENV is not set to 'production'
unset NODE_ENV

# Reinstall dependencies
pnpm install

# Try running tests again
pnpm test:run
```

### Mock Not Working

**Error**: Prisma calls execute instead of using mocks

**Solution**:
```typescript
// Ensure you're using vi.mocked() helper
import { vi } from 'vitest';
import { prisma } from '@aura/database';

vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
```

### Import Errors

**Error**: `Cannot find module '@/lib/services'`

**Solution**: Check path aliases in `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Type Errors

**Error**: Type errors in test files

**Solution**: Ensure `tsconfig.json` includes test files:
```json
{
  "include": ["src/**/*", "src/__tests__/**/*"]
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: pnpm test:run
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Future Enhancements

### Planned Test Additions

1. **Integration Tests** - Full API endpoint testing
2. **E2E Tests** - User flow testing with Playwright
3. **Performance Tests** - Load and stress testing
4. **Contract Tests** - API contract validation

### Additional Test Files to Create

- `auth.service.test.ts` - Authentication logic tests
- `middleware.test.ts` - Middleware unit tests
- `validators.test.ts` - Validation schema tests
- `error-handler.test.ts` - Error handling tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

## Support

For questions or issues with tests:
1. Check this documentation
2. Review existing test files for examples
3. Consult Vitest documentation
4. Ask the development team

---

**Last Updated**: 2025-12-20
**Test Framework**: Vitest 4.0.16
**Total Tests**: 57
**Overall Coverage**: 100% (Service Layer)
