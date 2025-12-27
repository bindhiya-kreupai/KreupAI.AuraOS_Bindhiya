# Integration Testing Suite - AuraOS HCM

Comprehensive integration testing for validating interactions between different components, services, and external dependencies of the AuraOS HCM platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Categories](#test-categories)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [Environment Setup](#environment-setup)
- [Original Integration Tests](#original-integration-tests)

## 🎯 Overview

Integration tests verify that different components of AuraOS work together correctly. This suite includes:

- **API Integration Tests** (Days 59-60): REST API endpoint interactions
- **Database Integration Tests** (Days 61-62): ORM/database layer operations
- **Third-Party Service Tests** (Days 63-64): External service integrations
- **End-to-End Scenarios** (Days 65-66): Complete business workflows
- **Original Integration Tests**: Auth, Users, Licenses, Master Data APIs

### Integration Testing Philosophy

1. **Test Real Integrations**: Use actual database, cache, and message queue (not mocks where possible)
2. **Isolated Environment**: Each test gets clean state
3. **Fast Feedback**: Tests complete in <10 minutes
4. **Deterministic**: Tests produce same results every run
5. **Comprehensive**: Cover all critical integration points

## 📊 Test Categories

### 1. API Integration Tests ([api-integration.test.ts](api-integration.test.ts:1))

Tests comprehensive API endpoint interactions:

**Authentication Flow** (3 tests)
- ✅ Complete auth workflow: Login → Token → Refresh → Logout
- ✅ Token expiration and refresh cycle
- ✅ Token invalidation on logout

**Employee CRUD Operations** (3 tests)
- ✅ Full CRUD lifecycle: Create → Read → Update → Delete
- ✅ Data consistency across operations
- ✅ Cross-endpoint data verification

**Pagination & Filtering** (4 tests)
- ✅ Multi-page pagination without overlap
- ✅ Filter application (status, department)
- ✅ Combined filters with pagination
- ✅ Sorting (ascending/descending)

**Error Handling** (5 tests)
- ✅ 400 for invalid input
- ✅ 401 for unauthorized access
- ✅ 401 for invalid tokens
- ✅ 404 for non-existent resources
- ✅ 409 for duplicate constraints

**Organization Structure** (2 tests)
- ✅ Department lifecycle management
- ✅ Hierarchical organization structure

**Response Format** (3 tests)
- ✅ Consistent success response format
- ✅ Consistent error response format
- ✅ Proper metadata in list responses

**Total Tests**: 20 API integration tests

### 2. Database Integration Tests ([database-integration.test.ts](database-integration.test.ts:1))

Tests database operations via Prisma ORM:

**Transactions** (3 tests)
- ✅ Transaction commit on success
- ✅ Transaction rollback on error
- ✅ Nested transactions

**Relationships** (3 tests)
- ✅ Loading nested relationships
- ✅ Cascade updates
- ✅ Cascade deletes

**Constraints** (4 tests)
- ✅ Unique constraint enforcement
- ✅ Foreign key constraint enforcement
- ✅ Check constraint validation
- ✅ Not null constraint enforcement

**Query Performance** (4 tests)
- ✅ N+1 query prevention
- ✅ Index usage validation
- ✅ Large dataset pagination efficiency
- ✅ Complex join optimization

**Data Integrity** (2 tests)
- ✅ Referential integrity maintenance
- ✅ Concurrent update handling

**Soft Deletes** (1 test)
- ✅ Soft delete record preservation

**Total Tests**: 17 database integration tests

### 3. Third-Party Service Integration Tests ([third-party-integration.test.ts](third-party-integration.test.ts:1))

Tests external service integrations:

**Email Service** (4 tests)
- ✅ Send email successfully
- ✅ Send email with attachments
- ✅ Handle delivery failures
- ✅ Get email delivery status

**SMS Service** (3 tests)
- ✅ Send SMS successfully
- ✅ Validate phone number format
- ✅ Handle international phone numbers

**Payment Gateway** (5 tests)
- ✅ Create payment intent
- ✅ Process payment successfully
- ✅ Handle failed payments
- ✅ Process refunds
- ✅ Handle webhook events

**File Storage (S3/MinIO)** (4 tests)
- ✅ Upload file successfully
- ✅ Generate signed URLs
- ✅ Handle large file uploads (multipart)
- ✅ Delete file from storage

**Cache Service (Redis)** (3 tests)
- ✅ Cache API responses
- ✅ Invalidate cache on data update
- ✅ Handle cache expiration (TTL)

**Message Queue (RabbitMQ)** (3 tests)
- ✅ Publish message to queue
- ✅ Process background jobs
- ✅ Handle message retry on failure

**Total Tests**: 22 third-party integration tests

### 4. End-to-End Integration Scenarios ([e2e-integration-scenarios.test.ts](e2e-integration-scenarios.test.ts:1))

Tests complete business workflows:

**Employee Lifecycle** (1 comprehensive test)
- ✅ Recruitment → Hiring → Onboarding → Active Employment → Performance Review → Benefits → Operations → Termination → Exit

**Payroll Processing Cycle** (1 test)
- ✅ Employee creation → Attendance → Leave → Payroll calculation → Payment → Payslip → Notification

**Leave Management Workflow** (2 tests)
- ✅ Leave application → Manager approval → HR approval → Calendar update → Balance deduction → Notification
- ✅ Leave rejection workflow

**Cross-Module Integration** (2 tests)
- ✅ Leave ↔ Attendance ↔ Payroll synchronization
- ✅ Performance review ↔ Compensation adjustment

**Total Tests**: 6 end-to-end scenario tests

### 5. Original Integration Tests

**Authentication Tests** ([auth/login.test.ts](auth/login.test.ts:1))
- 12 tests covering login, validation, rate limiting, audit logs

**Users API Tests** ([users/users.test.ts](users/users.test.ts:1))
- 16 tests covering CRUD operations, filters, pagination

**Licenses API Tests** ([licenses/licenses.test.ts](licenses/licenses.test.ts:1))
- 16 tests covering license management, capacity checks

**Master Data API Tests** ([master-data/master-data.test.ts](master-data/master-data.test.ts:1))
- 16 tests covering countries, states, cities, currencies

**Total Original Tests**: 60 integration tests

## 📁 Test Structure

```
integration/
├── README.md                          # This file
├── api-integration.test.ts            # API integration tests (20 tests)
├── database-integration.test.ts       # Database integration tests (17 tests)
├── third-party-integration.test.ts    # Third-party service tests (22 tests)
├── e2e-integration-scenarios.test.ts  # End-to-end scenarios (6 tests)
├── auth/
│   └── login.test.ts                  # Authentication tests (12 tests)
├── users/
│   └── users.test.ts                  # User management tests (16 tests)
├── licenses/
│   └── licenses.test.ts               # License management tests (16 tests)
└── master-data/
    └── master-data.test.ts            # Master data tests (16 tests)
```

## 🚀 Running Tests

### Run All Integration Tests

```bash
# Run complete integration test suite (125 tests)
npx playwright test apps/web/src/__tests__/integration

# Or using npm script
npm run test:integration
```

### Run Specific Test Categories

```bash
# API integration tests only
npx playwright test apps/web/src/__tests__/integration/api-integration.test.ts

# Database integration tests only
npx playwright test apps/web/src/__tests__/integration/database-integration.test.ts

# Third-party service tests only
npx playwright test apps/web/src/__tests__/integration/third-party-integration.test.ts

# End-to-end scenarios only
npx playwright test apps/web/src/__tests__/integration/e2e-integration-scenarios.test.ts

# Original integration tests (auth, users, licenses, master-data)
npx playwright test apps/web/src/__tests__/integration/auth
npx playwright test apps/web/src/__tests__/integration/users
npx playwright test apps/web/src/__tests__/integration/licenses
npx playwright test apps/web/src/__tests__/integration/master-data
```

### Run with Different Options

```bash
# Run with headed browser
npx playwright test apps/web/src/__tests__/integration --headed

# Run in debug mode
npx playwright test apps/web/src/__tests__/integration --debug

# Run specific test
npx playwright test apps/web/src/__tests__/integration -g "should complete full employee lifecycle"

# Run with HTML reporter
npx playwright test apps/web/src/__tests__/integration --reporter=html

# Run in parallel (faster)
npx playwright test apps/web/src/__tests__/integration --workers=4

# Run sequentially (for debugging)
npx playwright test apps/web/src/__tests__/integration --workers=1
```

## 📊 Test Coverage Summary

| Category | Tests | Coverage |
|----------|-------|----------|
| **New Integration Tests** | | |
| API Integration | 20 | Auth flow, CRUD, pagination, filters, errors |
| Database Integration | 17 | Transactions, relations, constraints, performance |
| Third-Party Services | 22 | Email, SMS, payments, storage, cache, queue |
| End-to-End Scenarios | 6 | Employee lifecycle, payroll, leave, cross-module |
| **Original Integration Tests** | | |
| Authentication | 12 | Login, sessions, rate limiting |
| Users API | 16 | User management, CRUD operations |
| Licenses API | 16 | License management, capacity |
| Master Data API | 16 | Countries, states, cities, currencies |
| **TOTAL** | **125** | **Comprehensive** |

## ✅ Best Practices

### 1. Test Isolation

Each test should be independent:

```typescript
test.beforeEach(async () => {
  // Clean database
  await prisma.$executeRaw`TRUNCATE TABLE employees CASCADE`;

  // Clear cache
  await redis.flushdb();

  // Purge queues
  await channel.purgeQueue('payroll-processing');
});
```

### 2. Use Realistic Test Data

```typescript
// ✅ Good - Realistic data
const employee = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  salary: 75000,
  joinDate: new Date('2024-01-15'),
  department: 'Engineering'
};

// ❌ Bad - Magic values
const employee = { name: 'Test User', salary: 1000 };
```

### 3. Test Both Success and Error Cases

```typescript
test('should succeed with valid data', async () => {
  // Test happy path
});

test('should return 400 for invalid data', async () => {
  // Test validation
});

test('should return 404 for non-existent resource', async () => {
  // Test not found
});
```

### 4. Verify Integration Points

Test both sides of integration:

```typescript
test('should sync leave with attendance', async () => {
  // Create leave
  const leave = await createLeave({ employeeId: emp.id });

  // Approve leave
  await approveLeave(leave.id);

  // Verify attendance marked as leave
  const attendance = await getAttendance(emp.id, leave.startDate);
  expect(attendance.status).toBe('on_leave');
});
```

### 5. Handle Async Operations

```typescript
test('should process async job', async ({ request }) => {
  // Trigger async operation
  const jobResponse = await request.post('/api/jobs/create', { data: jobData });
  const jobId = (await jobResponse.json()).data.jobId;

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check status
  const statusResponse = await request.get(`/api/jobs/${jobId}/status`);
  expect((await statusResponse.json()).data.status).toMatch(/completed|failed/);
});
```

## ⚙️ Environment Setup

### Prerequisites

```bash
# Install dependencies
pnpm install

# Install Playwright
npx playwright install

# Setup PostgreSQL test database
createdb auraos_test

# Setup Redis (for cache tests)
docker run -d -p 6379:6379 redis:7-alpine

# Setup RabbitMQ (for queue tests)
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### Environment Variables

Create `.env.test` file:

```bash
# Application
NODE_ENV=test
API_URL=http://localhost:3006
BASE_URL=http://localhost:3006

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/auraos_test

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Email (test mode)
SENDGRID_API_KEY=test_key
EMAIL_FROM=noreply@test.auraos.com

# SMS (test mode)
TWILIO_ACCOUNT_SID=test_sid
TWILIO_AUTH_TOKEN=test_token

# Payments (test mode)
STRIPE_SECRET_KEY=sk_test_...

# Storage (test bucket)
S3_BUCKET=auraos-test
AWS_ACCESS_KEY_ID=test_key
AWS_SECRET_ACCESS_KEY=test_secret
```

### Docker Compose for Test Dependencies

Create `docker-compose.test.yml`:

```yaml
version: '3.8'

services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: auraos_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_pass
    ports:
      - "5433:5432"

  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"

  rabbitmq-test:
    image: rabbitmq:3-management-alpine
    ports:
      - "5673:5672"
      - "15673:15672"
```

Start test dependencies:

```bash
docker-compose -f docker-compose.test.yml up -d
```

## 🐛 Troubleshooting

### Tests Failing with "Connection Refused"

**Solution**: Ensure all dependencies are running

```bash
# Check PostgreSQL
psql -h localhost -p 5432 -U test_user -d auraos_test

# Check Redis
redis-cli -h localhost -p 6379 ping

# Check RabbitMQ
curl http://localhost:15672/api/overview
```

### Slow Test Execution

**Solution**: Run tests in parallel

```bash
npx playwright test --workers=8
```

### Data Conflicts Between Tests

**Solution**: Ensure proper cleanup

```typescript
test.afterEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE employees CASCADE`;
});
```

---

# Original Integration Tests Documentation

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
