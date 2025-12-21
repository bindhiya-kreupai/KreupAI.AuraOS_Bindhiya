# Integration Tests Documentation

## Overview

Integration tests verify that different components of AuraOS work together correctly. Unlike unit tests that mock external dependencies, integration tests use a real test database and test the full request-response cycle of API endpoints.

## Test Structure

```
src/__tests__/integration/
├── auth/
│   └── login.test.ts          # Login endpoint tests
├── users/
│   └── users.test.ts          # User management API tests
├── licenses/
│   └── licenses.test.ts       # License management API tests
├── master-data/
│   └── master-data.test.ts    # Master data API tests
└── README.md                   # This file
```

## Running Integration Tests

### All Integration Tests

```bash
# Run all integration tests
pnpm test:run integration

# Run integration tests in watch mode
pnpm test integration

# Run with coverage
pnpm test:coverage integration
```

### Specific Test Suites

```bash
# Run login tests only
pnpm test:run login.test.ts

# Run user API tests
pnpm test:run users.test.ts

# Run license API tests
pnpm test:run licenses.test.ts

# Run master data tests
pnpm test:run master-data.test.ts
```

## Test Database Setup

Integration tests use a separate test database to avoid interfering with development data.

### Prerequisites

```bash
# 1. Create test database
createdb auraos_test

# 2. Run migrations
DATABASE_URL=postgresql://user:password@localhost:5432/auraos_test pnpm db:migrate

# 3. Seed test database
pnpm test:db:setup
```

### Environment Configuration

```bash
# .env.test
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/auraos_test
NODE_ENV=test
LOG_LEVEL=error
```

## Writing Integration Tests

### Basic Structure

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/your-endpoint/route';
import { setupTestDb, teardownTestDb, resetDatabase } from '@/__tests__/helpers';
import { mockUsers } from '@/__tests__/fixtures';
import { generateAccessToken } from '@/lib/auth/jwt';
import { PrismaClient } from '@prisma/client';

describe('Your API Integration Tests', () => {
  let prisma: PrismaClient;
  let authToken: string;

  beforeAll(async () => {
    // Setup test database
    prisma = await setupTestDb();
    await resetDatabase(prisma);

    // Generate auth token
    authToken = generateAccessToken({
      userId: mockUsers.admin.id,
      email: mockUsers.admin.email,
      tenantId: mockUsers.admin.tenantId,
      sessionId: 'session-1',
    });
  });

  afterAll(async () => {
    // Cleanup
    await teardownTestDb(prisma);
  });

  it('should test your endpoint', async () => {
    const request = new NextRequest('http://localhost:3000/api/your-endpoint', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

### Testing Authenticated Endpoints

```typescript
// Generate auth token
const authToken = generateAccessToken({
  userId: mockUsers.admin.id,
  email: mockUsers.admin.email,
  tenantId: mockUsers.admin.tenantId,
  sessionId: 'session-1',
});

// Create request with auth
const request = new NextRequest('http://localhost:3000/api/endpoint', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${authToken}`,
  },
});
```

### Testing POST Requests

```typescript
it('should create new resource', async () => {
  const payload = {
    name: 'Test Resource',
    description: 'Test description',
  };

  const request = new NextRequest('http://localhost:3000/api/resources', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  });

  const response = await POST(request);
  const data = await response.json();

  expect(response.status).toBe(201);
  expect(data.success).toBe(true);
  expect(data.data.name).toBe('Test Resource');
});
```

### Testing with Query Parameters

```typescript
it('should filter results', async () => {
  const request = new NextRequest(
    'http://localhost:3000/api/users?status=Active&page=1&limit=10',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  const response = await GET(request);
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.data.every((user: any) => user.status === 'Active')).toBe(true);
});
```

### Testing Dynamic Routes

```typescript
it('should get resource by ID', async () => {
  const resourceId = 'resource-123';

  const request = new NextRequest(
    `http://localhost:3000/api/resources/${resourceId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  const response = await GET(request, { params: { id: resourceId } });
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.data.id).toBe(resourceId);
});
```

## Test Coverage

### Authentication Tests (login.test.ts)

- ✅ Successful login with valid credentials
- ✅ Invalid email rejection
- ✅ Invalid password rejection
- ✅ Inactive user rejection
- ✅ Email format validation
- ✅ Missing password validation
- ✅ Session creation
- ✅ Audit log creation
- ✅ Last login timestamp update
- ✅ Rate limiting enforcement
- ✅ Rate limit headers

**Total Tests**: 12

### Users API Tests (users.test.ts)

**GET /api/users:**
- ✅ List all users for tenant
- ✅ Filter by status
- ✅ Search by email
- ✅ Pagination
- ✅ Authentication requirement
- ✅ Tenant isolation

**GET /api/users/:id:**
- ✅ Get user by ID
- ✅ 404 for non-existent user
- ✅ Authentication requirement

**POST /api/users:**
- ✅ Create user with valid data
- ✅ Duplicate email rejection
- ✅ Invalid email format
- ✅ Audit log creation

**PUT /api/users/:id:**
- ✅ Update user
- ✅ 404 for non-existent user

**DELETE /api/users/:id:**
- ✅ Delete user
- ✅ 404 for non-existent user

**Total Tests**: 16

### Licenses API Tests (licenses.test.ts)

**GET /api/licenses:**
- ✅ List all licenses for tenant
- ✅ Filter by status
- ✅ Filter by type
- ✅ Pagination
- ✅ Tenant isolation

**GET /api/licenses/:id:**
- ✅ Get license by ID
- ✅ 404 for non-existent license

**POST /api/licenses:**
- ✅ Create license with valid data
- ✅ Invalid type rejection
- ✅ Seat validation

**PUT /api/licenses/:id:**
- ✅ Update license
- ✅ Update expired license
- ✅ 404 for non-existent license

**DELETE /api/licenses/:id:**
- ✅ Delete license

**License Capacity:**
- ✅ Identify full capacity licenses
- ✅ Identify available licenses

**Total Tests**: 16

### Master Data API Tests (master-data.test.ts)

**Countries:**
- ✅ List all countries
- ✅ Search filter
- ✅ Active status filter
- ✅ Pagination
- ✅ Create country
- ✅ Duplicate code rejection

**States:**
- ✅ List all states
- ✅ Filter by country

**Cities:**
- ✅ List all cities
- ✅ Filter by state

**Currencies:**
- ✅ List all currencies
- ✅ Currency symbols included

**Languages:**
- ✅ List all languages

**General:**
- ✅ Invalid entity type
- ✅ Authentication requirement

**Total Tests**: 16

## Overall Test Statistics

- **Total Integration Tests**: 60
- **API Endpoints Tested**: 4 major areas
- **HTTP Methods Covered**: GET, POST, PUT, DELETE
- **Average Test Execution Time**: ~5-10 seconds per suite

## Best Practices

### 1. Database State Management

```typescript
beforeAll(async () => {
  // Setup once per test file
  prisma = await setupTestDb();
  await resetDatabase(prisma);
});

beforeEach(async () => {
  // Optional: reset specific tables between tests
  await prisma.userSession.deleteMany({});
});

afterAll(async () => {
  // Always cleanup
  await teardownTestDb(prisma);
});
```

### 2. Use Test Fixtures

```typescript
import { mockUsers, mockLicenses } from '@/__tests__/fixtures';

// ✅ Good - Uses fixtures
const user = mockUsers.admin;

// ❌ Bad - Hardcoded data
const user = {
  id: 'user-1',
  email: 'admin@example.com',
  // ...
};
```

### 3. Test Both Success and Error Cases

```typescript
it('should succeed with valid data', async () => {
  // Test success path
});

it('should return 400 for invalid data', async () => {
  // Test validation
});

it('should return 404 for non-existent resource', async () => {
  // Test not found
});

it('should return 401 without authentication', async () => {
  // Test auth requirement
});
```

### 4. Verify Database Changes

```typescript
it('should create resource', async () => {
  const response = await POST(request);
  const data = await response.json();

  expect(response.status).toBe(201);

  // Verify in database
  const created = await prisma.resource.findUnique({
    where: { id: data.data.id },
  });
  expect(created).toBeDefined();
});
```

### 5. Test Tenant Isolation

```typescript
it('should enforce tenant isolation', async () => {
  const response = await GET(request);
  const data = await response.json();

  // All results should belong to same tenant
  expect(
    data.data.every((item: any) => item.tenantId === adminTenantId)
  ).toBe(true);
});
```

### 6. Test Rate Limiting

```typescript
it('should enforce rate limiting', async () => {
  const requests = [];

  // Make multiple requests
  for (let i = 0; i < 11; i++) {
    requests.push(POST(createRequest()));
  }

  const responses = await Promise.all(requests);
  const lastResponse = responses[responses.length - 1];

  expect(lastResponse.status).toBe(429);
});
```

### 7. Test Audit Logging

```typescript
it('should create audit log', async () => {
  await POST(request);

  const auditLog = await prisma.auditLog.findFirst({
    where: { action: 'CREATE', module: 'Users' },
    orderBy: { createdAt: 'desc' },
  });

  expect(auditLog).toBeDefined();
});
```

## Common Patterns

### Testing Pagination

```typescript
it('should paginate results', async () => {
  const response = await GET(
    new NextRequest('http://localhost:3000/api/users?page=1&limit=5')
  );
  const data = await response.json();

  expect(data.data.length).toBeLessThanOrEqual(5);
  expect(data.meta).toMatchObject({
    page: 1,
    limit: 5,
    total: expect.any(Number),
    totalPages: expect.any(Number),
  });
});
```

### Testing Filters

```typescript
it('should filter results', async () => {
  const response = await GET(
    new NextRequest('http://localhost:3000/api/users?status=Active')
  );
  const data = await response.json();

  expect(data.data.every((user: any) => user.status === 'Active')).toBe(true);
});
```

### Testing Validation

```typescript
it('should validate required fields', async () => {
  const response = await POST(
    new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }), // Missing password
    })
  );

  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.errors).toBeDefined();
});
```

## Debugging Integration Tests

### Enable Debug Logging

```bash
# Enable detailed logging
DEBUG_TESTS=true pnpm test:run integration
```

### Inspect Database State

```typescript
it('should create user', async () => {
  const response = await POST(request);

  // Inspect database
  const users = await prisma.user.findMany();
  console.log('All users:', users);

  // Continue test...
});
```

### Test Individual Files

```bash
# Run single test file
pnpm test:run login.test.ts

# Run with UI for better debugging
pnpm test:ui
```

## Troubleshooting

### Tests Failing Due to Database State

**Solution**: Reset database before test suite
```typescript
beforeAll(async () => {
  await resetDatabase(prisma);
});
```

### Authentication Errors

**Solution**: Verify token generation
```typescript
const token = generateAccessToken({
  userId: mockUsers.admin.id,
  email: mockUsers.admin.email,
  tenantId: mockUsers.admin.tenantId,
  sessionId: 'session-1',
});

console.log('Generated token:', token);
```

### Database Connection Issues

**Solution**: Check test database URL
```bash
# Verify database exists
psql -l | grep auraos_test

# Test connection
psql $TEST_DATABASE_URL -c "SELECT 1"
```

### Rate Limit Tests Failing

**Issue**: Previous tests may have consumed rate limit

**Solution**: Use unique IP addresses or wait for window to reset
```typescript
const request = new NextRequest('http://localhost:3000/api/auth/login', {
  headers: {
    'x-forwarded-for': `192.168.1.${Math.random() * 255}`,
  },
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: auraos_test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Setup test database
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/auraos_test
        run: |
          pnpm db:migrate
          pnpm test:db:setup

      - name: Run integration tests
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/auraos_test
        run: pnpm test:run integration
```

## Future Enhancements

- [ ] Add tests for remaining API endpoints (Roles, Sessions, Audit Logs)
- [ ] Add E2E tests with Playwright
- [ ] Add performance tests for high-load scenarios
- [ ] Add contract tests for API versioning
- [ ] Add security tests (SQL injection, XSS, etc.)

---

**Last Updated**: 2025-12-20
**Total Integration Tests**: 60
**Test Coverage**: ~75% of API endpoints
