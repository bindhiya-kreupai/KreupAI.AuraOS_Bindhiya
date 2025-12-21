# Test Database Documentation

## Overview

AuraOS uses a separate test database for running integration and unit tests. This ensures that test data does not interfere with development or production data.

## Database Setup

### 1. Database Configuration

The test database URL is configured via environment variables:

```bash
# .env.test
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/auraos_test

# Or it will auto-generate from DATABASE_URL
# Replaces 'auraos' with 'auraos_test'
DATABASE_URL=postgresql://user:password@localhost:5432/auraos
# → TEST_DATABASE_URL=postgresql://user:password@localhost:5432/auraos_test
```

### 2. Create Test Database

```bash
# Using PostgreSQL CLI
createdb auraos_test

# Or using psql
psql -U postgres
CREATE DATABASE auraos_test;
\q
```

### 3. Run Migrations

```bash
# Apply database migrations to test database
DATABASE_URL=postgresql://user:password@localhost:5432/auraos_test pnpm db:migrate
```

### 4. Seed Test Database

```bash
# Seed with test fixtures
pnpm test:db:setup

# Or reset and reseed
pnpm test:db:reset
```

## Test Fixtures

### Directory Structure

```
src/__tests__/
├── fixtures/
│   ├── users.ts           # User test data
│   ├── licenses.ts        # License test data
│   ├── master-data.ts     # Countries, states, cities, currencies, languages
│   └── index.ts           # Central export
├── helpers/
│   ├── seed-database.ts   # Database seeding utilities
│   ├── test-db.ts         # Database connection helpers
│   └── index.ts           # Central export
└── DATABASE.md            # This file
```

### Available Fixtures

#### Users (`fixtures/users.ts`)

```typescript
import { mockUsers, mockUsersList } from '@/__tests__/fixtures';

// Individual users
mockUsers.admin         // Administrator user
mockUsers.user1         // John Doe (active, MFA enabled)
mockUsers.user2         // Jane Smith (active)
mockUsers.inactiveUser  // Inactive user
mockUsers.tenant2User   // User in different tenant

// All users as array
mockUsersList           // Array of all users
```

**Available Users:**
- `admin@auraos.com` - Administrator (tenant-1)
- `john.doe@auraos.com` - Active user with MFA (tenant-1)
- `jane.smith@auraos.com` - Active user (tenant-1)
- `inactive@auraos.com` - Inactive user (tenant-1)
- `user@tenant2.com` - Active user (tenant-2)

#### Licenses (`fixtures/licenses.ts`)

```typescript
import { mockLicenses, mockLicensesList } from '@/__tests__/fixtures';

// Individual licenses
mockLicenses.active         // Professional license (45/100 seats)
mockLicenses.enterprise     // Enterprise license (250/500 seats)
mockLicenses.trial          // Trial license (8/10 seats)
mockLicenses.expired        // Expired license
mockLicenses.suspended      // Suspended license
mockLicenses.fullCapacity   // License at full capacity (25/25)
mockLicenses.tenant2        // License for tenant-2

// All licenses as array
mockLicensesList            // Array of all licenses
```

#### Master Data (`fixtures/master-data.ts`)

```typescript
import {
  mockCountries,
  mockStates,
  mockCities,
  mockCurrencies,
  mockLanguages,
  mockMasterData,
} from '@/__tests__/fixtures';

// Individual entities
mockCountries    // US, UK, Canada, Germany, France
mockStates       // California, New York, Texas, Ontario, BC
mockCities       // LA, SF, NYC, Houston, Toronto
mockCurrencies   // USD, EUR, GBP, CAD
mockLanguages    // English, Spanish, French, German

// All master data grouped
mockMasterData.countries
mockMasterData.states
mockMasterData.cities
mockMasterData.currencies
mockMasterData.languages
```

## Database Helpers

### Seeding Utilities

```typescript
import {
  seedDatabase,
  clearDatabase,
  resetDatabase,
  seedEntity,
} from '@/__tests__/helpers';

// Seed entire database with all fixtures
await seedDatabase(prisma);

// Clear all data
await clearDatabase(prisma);

// Reset: clear + seed
await resetDatabase(prisma);

// Seed specific entity
await seedEntity(prisma, 'users', customUserData);
await seedEntity(prisma, 'licenses', customLicenseData);
```

### Test Database Connection

```typescript
import {
  setupTestDb,
  teardownTestDb,
  createTestDbConnection,
  waitForDb,
  isDatabaseEmpty,
} from '@/__tests__/helpers';

// Setup in beforeAll
let prisma: PrismaClient;

beforeAll(async () => {
  prisma = await setupTestDb();
  await seedDatabase(prisma);
});

afterAll(async () => {
  await teardownTestDb(prisma);
});

// Or create custom connection
const prisma = createTestDbConnection();

// Wait for database to be ready
await waitForDb(prisma);

// Check if empty
const empty = await isDatabaseEmpty(prisma);
```

## Usage in Tests

### Integration Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDb, teardownTestDb, seedDatabase } from '@/__tests__/helpers';
import { mockUsers } from '@/__tests__/fixtures';
import { PrismaClient } from '@prisma/client';

describe('User API Integration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Setup test database
    prisma = await setupTestDb();
    await seedDatabase(prisma);
  });

  afterAll(async () => {
    // Cleanup
    await teardownTestDb(prisma);
  });

  it('should fetch user by ID', async () => {
    const user = await prisma.user.findUnique({
      where: { id: mockUsers.admin.id },
    });

    expect(user).toBeDefined();
    expect(user?.email).toBe(mockUsers.admin.email);
  });

  it('should list all users for tenant', async () => {
    const users = await prisma.user.findMany({
      where: { tenantId: 'tenant-1' },
    });

    expect(users).toHaveLength(4); // admin, user1, user2, inactiveUser
  });
});
```

### Unit Test with Fixtures

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from '@/lib/services';
import { prisma } from '@aura/database';
import { mockUsers } from '@/__tests__/fixtures';

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user by ID', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUsers.admin);

    const result = await userService.getUserById(
      mockUsers.admin.id,
      'admin-1'
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockUsers.admin);
  });
});
```

## Seeded Data Summary

### Tenants
- **tenant-1**: Acme Corporation
- **tenant-2**: Tech Innovations Inc

### Roles
- **role-admin**: Administrator (full access)
- **role-user**: Standard User
- **role-manager**: Manager (team management)

### Users (5 total)
- 4 users in tenant-1
- 1 user in tenant-2
- 1 admin user
- 1 inactive user
- 2 users with MFA enabled

### Licenses (7 total)
- 6 licenses for tenant-1
- 1 license for tenant-2
- 3 active licenses
- 1 expired license
- 1 suspended license
- 1 trial license
- 1 at full capacity

### Master Data
- **Countries**: 5 (US, UK, Canada, Germany, France)
- **States**: 5 (CA, NY, TX, ON, BC)
- **Cities**: 5 (LA, SF, NYC, Houston, Toronto)
- **Currencies**: 4 (USD, EUR, GBP, CAD)
- **Languages**: 4 (English, Spanish, French, German)

## Environment Variables

### Required for Tests

```bash
# Test database URL
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/auraos_test

# Or use DATABASE_URL with auto-conversion
DATABASE_URL=postgresql://user:password@localhost:5432/auraos

# Enable debug logging (optional)
DEBUG_TESTS=true
```

### .env.test Example

```bash
# Database
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/auraos_test

# JWT (same as dev for tests)
JWT_SECRET=test-jwt-secret-min-32-characters-long
JWT_REFRESH_SECRET=test-refresh-secret-min-32-characters

# Other settings
NODE_ENV=test
LOG_LEVEL=error
```

## Scripts

### Available Commands

```bash
# Setup test database (migrate + seed)
pnpm test:db:setup

# Reset test database (clear + seed)
pnpm test:db:reset

# Run tests
pnpm test              # Watch mode
pnpm test:run          # Run once
pnpm test:ui           # UI mode
pnpm test:coverage     # With coverage

# Database migrations (on test DB)
DATABASE_URL=$TEST_DATABASE_URL pnpm db:migrate
DATABASE_URL=$TEST_DATABASE_URL pnpm db:studio
```

## Best Practices

### 1. Isolate Test Data

Always use the test database, never the development database:

```typescript
// ✅ Good - Uses TEST_DATABASE_URL
const prisma = createTestDbConnection();

// ❌ Bad - Uses production DATABASE_URL
const prisma = new PrismaClient();
```

### 2. Clean Between Tests

Reset database state between test suites if needed:

```typescript
beforeEach(async () => {
  await clearDatabase(prisma);
  await seedDatabase(prisma);
});
```

### 3. Use Transactions for Isolation

Wrap tests in transactions and rollback:

```typescript
it('should create user', async () => {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    expect(user).toBeDefined();
    // Transaction automatically rolls back after test
  });
});
```

### 4. Leverage Fixtures

Use pre-defined fixtures instead of creating data in tests:

```typescript
// ✅ Good - Uses fixtures
vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUsers.admin);

// ❌ Bad - Creates data inline
vi.mocked(prisma.user.findUnique).mockResolvedValue({
  id: 'user-1',
  email: 'test@example.com',
  // ... lots of fields
});
```

### 5. Test Multiple Scenarios

Use different fixtures to test various scenarios:

```typescript
it('should work with active user', async () => {
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUsers.user1);
  // test logic
});

it('should reject inactive user', async () => {
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUsers.inactiveUser);
  // test logic
});

it('should handle missing user', async () => {
  vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
  // test logic
});
```

## Troubleshooting

### Database Connection Fails

**Error**: `Can't reach database server`

**Solutions**:
1. Ensure PostgreSQL is running: `pg_ctl status`
2. Check database exists: `psql -l | grep auraos_test`
3. Verify credentials in TEST_DATABASE_URL
4. Test connection: `psql $TEST_DATABASE_URL`

### Migrations Not Applied

**Error**: `Table does not exist`

**Solution**:
```bash
# Apply migrations to test database
DATABASE_URL=$TEST_DATABASE_URL pnpm db:migrate
```

### Seeding Fails

**Error**: `Foreign key constraint violation`

**Solution**: Ensure tables are seeded in dependency order (the seed script handles this automatically).

### Stale Data in Tests

**Issue**: Tests fail due to unexpected data

**Solution**:
```bash
# Reset test database
pnpm test:db:reset

# Or in test
beforeEach(async () => {
  await resetDatabase(prisma);
});
```

## Performance Tips

### 1. Parallel Test Execution

Vitest runs tests in parallel by default. For database tests, consider sequential execution:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Sequential execution
      },
    },
  },
});
```

### 2. Connection Pooling

Configure Prisma connection pool for tests:

```typescript
const prisma = new PrismaClient({
  datasources: { db: { url: testDatabaseUrl } },
  log: ['error'],
  // Connection pool settings
  __internal: {
    engine: {
      connection_limit: 5,
    },
  },
});
```

### 3. Minimize Database Resets

Only reset database when necessary:

```typescript
// ✅ Reset once per test file
beforeAll(async () => {
  await resetDatabase(prisma);
});

// ❌ Reset before every test (slow)
beforeEach(async () => {
  await resetDatabase(prisma);
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
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
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
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

      - name: Run tests
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/auraos_test
        run: pnpm test:run
```

## Resources

- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Vitest Documentation](https://vitest.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Last Updated**: 2025-12-20
**Test Database**: PostgreSQL 15+
**Fixture Count**: 26 entities across 5 tables
