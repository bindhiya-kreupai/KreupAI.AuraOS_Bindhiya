# Repository Pattern Documentation

## Overview

The Repository Pattern provides an abstraction layer between the service layer and the database (Prisma). This separation of concerns offers several benefits:

- **Testability**: Easy to mock repositories in unit tests
- **Maintainability**: Centralized data access logic
- **Flexibility**: Can switch database implementations without changing services
- **Reusability**: Common query patterns defined once
- **Type Safety**: Full TypeScript support with Prisma types

## Architecture

```
API Routes
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access) ← YOU ARE HERE
    ↓
Prisma Client (ORM)
    ↓
PostgreSQL Database
```

## Repository Structure

### Base Repository

The `BaseRepository` class provides common CRUD operations that all repositories inherit:

```typescript
import { BaseRepository } from '@/lib/repositories';

class MyRepository extends BaseRepository<MyModel> {
  constructor() {
    super('myModel'); // Prisma model name (lowercase)
  }
}
```

### Common Operations

#### Find Operations
```typescript
// Find by ID
const user = await repository.findById('user-123');

// Find one by criteria
const user = await repository.findOne({ email: 'user@example.com' });

// Find many with filters
const users = await repository.findMany({
  where: { status: 'Active' },
  orderBy: { createdAt: 'desc' },
  take: 10,
});

// Find with pagination
const result = await repository.findManyPaginated(
  {
    where: { tenantId: 'tenant-1' },
    orderBy: { createdAt: 'desc' },
  },
  page: 1,
  limit: 10
);
// Returns: { data: T[], total: number, page: number, limit: number, totalPages: number }
```

#### Count & Existence
```typescript
// Count records
const count = await repository.count({ status: 'Active' });

// Check existence
const exists = await repository.exists({ email: 'user@example.com' });
```

#### Create Operations
```typescript
// Create single record
const user = await repository.create({
  email: 'new@example.com',
  password: 'hashed_password',
  tenantId: 'tenant-1',
});

// Create many records
const result = await repository.createMany([
  { name: 'User 1', email: 'user1@example.com' },
  { name: 'User 2', email: 'user2@example.com' },
]);
// Returns: { count: number }
```

#### Update Operations
```typescript
// Update by ID
const user = await repository.updateById('user-123', {
  status: 'Inactive',
});

// Update one by criteria
const user = await repository.updateOne(
  { email: 'user@example.com' },
  { status: 'Active' }
);

// Update many
const result = await repository.updateMany(
  { tenantId: 'tenant-1' },
  { status: 'Inactive' }
);
// Returns: { count: number }
```

#### Delete Operations
```typescript
// Delete by ID
const user = await repository.deleteById('user-123');

// Delete one by criteria
const user = await repository.deleteOne({ email: 'user@example.com' });

// Delete many
const result = await repository.deleteMany({ status: 'Inactive' });
// Returns: { count: number }

// Soft delete (set status to Inactive)
const user = await repository.softDeleteById('user-123');
```

#### Transactions
```typescript
const result = await repository.transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.auditLog.create({ data: auditData });
  return user;
});
```

## Creating a New Repository

### Step 1: Create Repository Class

```typescript
// lib/repositories/employee.repository.ts
import { BaseRepository, type PaginatedResult } from './base.repository';
import type { Employee } from '@prisma/client';

export interface FindEmployeesOptions {
  companyId: string;
  departmentId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class EmployeeRepository extends BaseRepository<Employee> {
  constructor() {
    super('employee'); // Must match Prisma model name (lowercase)
  }

  /**
   * Find employees by company with filters
   */
  async findByCompany(options: FindEmployeesOptions): Promise<PaginatedResult<Employee>> {
    const { companyId, departmentId, status, page = 1, limit = 10 } = options;

    const where: any = { companyId };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    return this.findManyPaginated(
      {
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          department: true,
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      page,
      limit
    );
  }

  /**
   * Find employees by manager
   */
  async findDirectReports(managerId: string): Promise<Employee[]> {
    return this.findMany({
      where: { managerId },
      orderBy: { firstName: 'asc' },
    });
  }

  /**
   * Count employees by department
   */
  async countByDepartment(departmentId: string): Promise<number> {
    return this.count({ departmentId });
  }
}

// Export singleton instance
export const employeeRepository = new EmployeeRepository();
```

### Step 2: Add to Index

```typescript
// lib/repositories/index.ts
export { EmployeeRepository, employeeRepository } from './employee.repository';
export type { FindEmployeesOptions } from './employee.repository';
```

### Step 3: Use in Service

```typescript
// lib/services/employee.service.ts
import { employeeRepository } from '@/lib/repositories';

export class EmployeeService {
  async listEmployees(options: FindEmployeesOptions): Promise<ServiceResponse> {
    try {
      const result = await employeeRepository.findByCompany(options);

      return {
        success: true,
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      console.error('Failed to list employees:', error);
      return {
        success: false,
        error: 'Failed to fetch employees',
      };
    }
  }
}
```

## Best Practices

### 1. Keep Repositories Focused on Data Access
```typescript
// ✅ GOOD - Pure data access
async findActiveUsers(tenantId: string): Promise<User[]> {
  return this.findMany({
    where: { tenantId, status: 'Active' },
  });
}

// ❌ BAD - Business logic in repository
async deactivateInactiveUsers(tenantId: string): Promise<void> {
  // Business logic belongs in service layer
  const users = await this.findMany({ where: { tenantId, lastLogin: { lt: thirtyDaysAgo } } });
  await this.updateMany({ id: { in: users.map(u => u.id) } }, { status: 'Inactive' });
  await this.sendNotifications(users); // ❌ Side effects don't belong here
}
```

### 2. Use Type-Safe Interfaces
```typescript
// Define clear interfaces for options
export interface FindUsersOptions {
  tenantId: string;
  search?: string;
  status?: UserStatus; // Use Prisma enums
  page?: number;
  limit?: number;
}

// Use typed returns
async findUsers(options: FindUsersOptions): Promise<PaginatedResult<User>> {
  // Implementation
}
```

### 3. Don't Expose Sensitive Data
```typescript
// Create safe select objects
private get safeUserSelect() {
  return {
    id: true,
    email: true,
    status: true,
    // password: EXCLUDED - never include in default selects
    createdAt: true,
    updatedAt: true,
  };
}

// Use in queries
async findByIdSafe(id: string): Promise<SafeUser | null> {
  return this.findById(id, { select: this.safeUserSelect });
}
```

### 4. Include Related Data When Needed
```typescript
async findWithRelations(id: string): Promise<UserWithRelations | null> {
  return this.findById(id, {
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      sessions: {
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}
```

### 5. Use Transactions for Multi-Step Operations
```typescript
async createUserWithEmployee(userData: any, employeeData: any): Promise<User> {
  return this.transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    await tx.employee.create({
      data: {
        ...employeeData,
        userId: user.id,
      },
    });
    return user;
  });
}
```

### 6. Implement Tenant Isolation
```typescript
// ALWAYS filter by tenant for multi-tenant models
async findByTenant(tenantId: string, options?: FindOptions): Promise<T[]> {
  return this.findMany({
    where: {
      tenantId, // CRITICAL for security
      ...options?.where,
    },
    ...options,
  });
}
```

## Testing Repositories

### Unit Tests with Mock Prisma

```typescript
// __tests__/repositories/user.repository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '@/lib/repositories';

vi.mock('@aura/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
    vi.clearAllMocks();
  });

  it('should find user by email', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser);

    const result = await repository.findByEmail('test@example.com');

    expect(result).toEqual(mockUser);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
  });

  it('should create user', async () => {
    const userData = { email: 'new@example.com', password: 'hashed', tenantId: 't1' };
    const mockUser = { id: '1', ...userData };
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

    const result = await repository.createUser(userData);

    expect(result).toEqual(mockUser);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: userData,
      select: expect.any(Object),
    });
  });
});
```

### Integration Tests with Real Database

```typescript
// __tests__/integration/repositories/user.repository.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { userRepository } from '@/lib/repositories';
import { setupTestDb, resetDatabase } from '@/__tests__/helpers';

describe('UserRepository Integration', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await resetDatabase();
  });

  it('should create and find user', async () => {
    const userData = {
      email: 'integration@example.com',
      password: 'hashed_password',
      tenantId: 'tenant-test',
    };

    const created = await userRepository.createUser(userData);
    expect(created.id).toBeDefined();

    const found = await userRepository.findByEmail(userData.email);
    expect(found?.email).toBe(userData.email);
  });
});
```

## Migration from Direct Prisma Usage

### Before (Direct Prisma)
```typescript
// service.ts
import { prisma } from '@aura/database';

async listUsers(tenantId: string) {
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: {
      id: true,
      email: true,
      // ... lots of repeated select logic
    },
  });
  return users;
}
```

### After (Repository Pattern)
```typescript
// repository.ts
export class UserRepository extends BaseRepository<User> {
  async findByTenant(tenantId: string): Promise<UserWithRelations[]> {
    return this.findMany({
      where: { tenantId },
      select: this.safeUserSelect, // Reusable select
    });
  }
}

// service.ts
import { userRepository } from '@/lib/repositories';

async listUsers(tenantId: string) {
  const users = await userRepository.findByTenant(tenantId);
  return users;
}
```

## Common Patterns

### Soft Delete Pattern
```typescript
export class BaseRepository<T> {
  async softDelete(id: string): Promise<T> {
    return this.updateById(id, { deletedAt: new Date(), status: 'Deleted' });
  }

  async findActiveOnly(where?: any): Promise<T[]> {
    return this.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }
}
```

### Audit Trail Pattern
```typescript
async updateWithAudit(
  id: string,
  data: any,
  auditData: { userId: string; ipAddress: string }
): Promise<T> {
  return this.transaction(async (tx) => {
    const updated = await tx[this.modelName].update({
      where: { id },
      data,
    });

    await tx.auditLog.create({
      data: {
        userId: auditData.userId,
        action: 'UPDATE',
        module: this.modelName,
        details: `Updated ${this.modelName} ${id}`,
        ipAddress: auditData.ipAddress,
      },
    });

    return updated;
  });
}
```

### Search Pattern
```typescript
async search(query: string, fields: string[]): Promise<T[]> {
  const orConditions = fields.map((field) => ({
    [field]: {
      contains: query,
      mode: 'insensitive',
    },
  }));

  return this.findMany({
    where: {
      OR: orConditions,
    },
  });
}
```

## Performance Considerations

### 1. Use Select to Limit Fields
```typescript
// Only fetch needed fields
await repository.findMany({
  select: {
    id: true,
    name: true,
    // Don't fetch large text fields unless needed
  },
});
```

### 2. Use Pagination for Large Datasets
```typescript
// Always paginate when returning multiple records to UI
const result = await repository.findManyPaginated(options, page, limit);
```

### 3. Eager Load Related Data
```typescript
// Avoid N+1 queries by including relations
await repository.findMany({
  include: {
    department: true, // Single query with JOIN
  },
});
```

### 4. Use Indexes
```typescript
// Ensure database has indexes on commonly queried fields
// See: packages/@aura/database/DATABASE_INDEXES.md
```

## Error Handling

Repositories should let Prisma errors bubble up to the service layer:

```typescript
// Repository - No try/catch, let errors propagate
async findById(id: string): Promise<User | null> {
  return this.model.findUnique({ where: { id } });
}

// Service - Handle errors with appropriate messages
async getUserById(id: string): Promise<ServiceResponse> {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, data: user };
  } catch (error) {
    logger.error({ error, id }, 'Failed to get user');
    return { success: false, error: 'Failed to fetch user' };
  }
}
```

## Next Steps

1. Create repositories for remaining models (Employee, Department, Session, etc.)
2. Update existing services to use repositories instead of direct Prisma
3. Add comprehensive tests for each repository
4. Document model-specific query patterns
5. Consider adding Redis caching layer in repositories

## References

- [Repository Pattern Overview](https://martinfowler.com/eaaCatalog/repository.html)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
