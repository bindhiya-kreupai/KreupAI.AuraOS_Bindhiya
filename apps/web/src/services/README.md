# Service Layer Documentation

## Overview

The service layer contains all business logic for the AuraOS application. This architecture separates concerns, making the codebase more maintainable, testable, and scalable.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Routes (HTTP Layer)               │
│  - Request validation                                    │
│  - Response formatting                                   │
│  - HTTP-specific concerns                                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Service Layer (Business Logic)          │
│  - Authentication & Authorization                        │
│  - User Management                                       │
│  - Role & Permission Management                          │
│  - MFA Operations                                        │
│  - Business Rules & Validation                           │
│  - Audit Logging                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Data Layer (Prisma ORM)                 │
│  - Database Queries                                      │
│  - Transactions                                          │
│  - Relationships                                         │
└─────────────────────────────────────────────────────────┘
```

## Services

### Authentication Services

#### AuthService
**File:** `apps/web/src/services/auth/auth.service.ts`

Handles all authentication operations:
- User login/logout
- Token generation and refresh
- Password reset flow
- Session management

**Example Usage:**
```typescript
import { authService } from '@/services/auth';

// Login user
const result = await authService.login(
  { email: 'user@example.com', password: 'password123' },
  '192.168.1.1',
  'Mozilla/5.0...'
);

if (result.success) {
  if (result.mfaRequired) {
    // Redirect to MFA page
  } else {
    // Login successful, use tokens
    const { accessToken, refreshToken } = result;
  }
}
```

#### MFAService
**File:** `apps/web/src/services/auth/mfa.service.ts`

Handles Multi-Factor Authentication:
- TOTP setup and verification
- Backup code generation
- MFA validation during login
- MFA disable operations

**Example Usage:**
```typescript
import { mfaService } from '@/services/auth';

// Setup MFA for user
const setupResult = await mfaService.setupMFA(userId, userEmail);

if (setupResult.success) {
  // Display QR code to user
  const { qrCodeUrl, backupCodes } = setupResult;
}

// Verify setup with TOTP code
const verifyResult = await mfaService.verifyMFASetup(
  userId,
  totpCode,
  ipAddress
);

if (verifyResult.success) {
  // MFA is now enabled
}
```

---

### User Management

#### UserService
**File:** `apps/web/src/services/user.service.ts`

Handles user operations with tenant isolation:
- User CRUD operations
- Password changes
- Status management
- User statistics

**Example Usage:**
```typescript
import { userService } from '@/services/user.service';

// Create new user
const result = await userService.createUser(
  {
    email: 'newuser@example.com',
    password: 'SecurePass123!',
    tenantId: 'tenant-123',
  },
  createdByUserId,
  ipAddress
);

// List users with pagination
const users = await userService.listUsers({
  tenantId: 'tenant-123',
  page: 1,
  limit: 20,
  search: 'john',
  status: 'Active',
});

// Update user
const updateResult = await userService.updateUser(
  userId,
  { email: 'updated@example.com' },
  updatedByUserId,
  tenantId,
  ipAddress
);
```

---

### Role & Permission Management

#### RoleService
**File:** `apps/web/src/services/role.service.ts`

Handles RBAC operations:
- Role CRUD operations
- Permission management
- Role assignments
- Temporal role assignments

**Example Usage:**
```typescript
import { roleService } from '@/services/role.service';

// Create role with permissions
const result = await roleService.createRole(
  {
    code: 'HR_MANAGER',
    name: 'HR Manager',
    description: 'Human Resources Manager',
    tenantId: 'tenant-123',
    permissionIds: ['perm-1', 'perm-2', 'perm-3'],
  },
  createdByUserId,
  ipAddress
);

// Assign role to user (with optional expiration)
const assignResult = await roleService.assignRole(
  {
    userId: 'user-123',
    roleId: 'role-456',
    tenantId: 'tenant-123',
    assignedBy: adminUserId,
    expiresAt: new Date('2025-12-31'), // Optional temporal assignment
  },
  ipAddress
);

// Get user's roles
const userRoles = await roleService.getUserRoles(userId, tenantId);
```

---

## Design Principles

### 1. Tenant Isolation
All services enforce tenant isolation by default:

```typescript
async getUserById(userId: string, requestorTenantId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId: requestorTenantId, // Always enforce tenant boundary
    },
  });
  return user;
}
```

### 2. Audit Logging
All operations that modify data create audit logs:

```typescript
await prisma.auditLog.create({
  data: {
    userId: performedBy,
    action: 'USER_CREATED',
    module: 'User Management',
    details: `Created user: ${email}`,
    ipAddress,
  },
});
```

### 3. Security First
- Password hashing with bcrypt (cost 12)
- Token encryption for sensitive data
- Email enumeration prevention
- Status enumeration prevention
- Rate limiting considerations
- IP address tracking

### 4. Error Handling
Services return structured responses:

```typescript
interface ServiceResult {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}
```

### 5. Type Safety
All services use TypeScript interfaces:

```typescript
export interface CreateUserInput {
  email: string;
  password: string;
  tenantId: string;
  employeeId?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
}
```

---

## Testing Services

Services are designed to be easily testable:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userService } from '@/services/user.service';
import { createTestTenant, createTestUser, cleanupTestData } from '../helpers/test-utils';

describe('UserService', () => {
  let tenant;
  let user;

  beforeEach(async () => {
    await cleanupTestData();
    tenant = await createTestTenant();
    user = await createTestUser('test@example.com', 'Pass123!', tenant.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('should create user successfully', async () => {
    const result = await userService.createUser(
      {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        tenantId: tenant.id,
      },
      user.id,
      '127.0.0.1'
    );

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('newuser@example.com');
  });
});
```

---

## Common Patterns

### 1. Service Method Structure

```typescript
async methodName(
  // Required parameters
  param1: string,
  param2: number,

  // Context parameters
  performedBy: string,
  tenantId: string,
  ipAddress: string
): Promise<ServiceResult> {
  try {
    // 1. Validate input
    // 2. Check permissions/tenant isolation
    // 3. Perform business logic
    // 4. Update database
    // 5. Create audit log
    // 6. Log operation
    // 7. Return result

    return {
      success: true,
      message: 'Operation successful',
      data: result,
    };
  } catch (error) {
    logger.error({ error }, 'Error in methodName');
    return {
      success: false,
      message: 'Operation failed',
      error: 'Error description',
    };
  }
}
```

### 2. Tenant Isolation Pattern

```typescript
// Always filter by tenantId
const data = await prisma.model.findFirst({
  where: {
    id: resourceId,
    tenantId: requestorTenantId, // Enforce isolation
  },
});

if (!data) {
  // Return error - don't reveal if resource exists in other tenant
  return {
    success: false,
    message: 'Resource not found or access denied',
    error: 'Not found',
  };
}
```

### 3. Audit Logging Pattern

```typescript
// After successful operation
await prisma.auditLog.create({
  data: {
    userId: performedBy,
    action: 'RESOURCE_ACTION',
    module: 'Module Name',
    details: `Description of what happened`,
    ipAddress,
  },
});

logger.info({
  userId: performedBy,
  resourceId,
  ipAddress
}, 'Operation completed successfully');
```

---

## Adding New Services

### Step 1: Create Service File

Create a new file in `apps/web/src/services/`:

```typescript
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

export class MyService {
  async myMethod(params) {
    // Implementation
  }
}

export const myService = new MyService();
```

### Step 2: Define Interfaces

```typescript
export interface MyInput {
  field1: string;
  field2: number;
}

export interface MyResult {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}
```

### Step 3: Implement Methods

Follow the common patterns above.

### Step 4: Create Tests

Create test file in `apps/web/src/__tests__/services/`:

```typescript
import { describe, it, expect } from 'vitest';
import { myService } from '@/services/my.service';

describe('MyService', () => {
  it('should do something', async () => {
    const result = await myService.myMethod(params);
    expect(result.success).toBe(true);
  });
});
```

### Step 5: Use in API Routes

```typescript
import { myService } from '@/services/my.service';

export async function POST(request: NextRequest) {
  const data = await request.json();
  const result = await myService.myMethod(data);
  return NextResponse.json(result);
}
```

---

## Best Practices

### Do's ✅
- Always enforce tenant isolation
- Create audit logs for modifications
- Use structured logging
- Return consistent result objects
- Handle errors gracefully
- Use TypeScript interfaces
- Write tests for all methods
- Document complex logic

### Don'ts ❌
- Don't mix HTTP concerns with business logic
- Don't expose internal errors to users
- Don't skip tenant validation
- Don't forget audit logging
- Don't use plain text for sensitive data
- Don't reveal user existence in errors
- Don't skip input validation

---

## Security Checklist

When creating services, ensure:

- [ ] Tenant isolation is enforced
- [ ] Passwords are hashed (bcrypt cost 12+)
- [ ] Sensitive data is encrypted
- [ ] Email enumeration is prevented
- [ ] Status enumeration is prevented
- [ ] Audit logs are created
- [ ] IP addresses are tracked
- [ ] Input is validated
- [ ] Errors don't leak information
- [ ] Transactions are used for multi-step operations
- [ ] Sessions are revoked when appropriate

---

## Migration Guide

### Migrating API Routes to Use Services

**Before:**
```typescript
// apps/web/src/app/api/users/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();

  // All business logic here
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: await bcrypt.hash(body.password, 12),
      // ...
    },
  });

  await prisma.auditLog.create({
    // ...
  });

  return NextResponse.json({ user });
}
```

**After:**
```typescript
// apps/web/src/app/api/users/route.ts
import { userService } from '@/services/user.service';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

  const result = await userService.createUser(
    body,
    userId, // from auth middleware
    ipAddress
  );

  return NextResponse.json(result);
}
```

---

## Performance Considerations

### Database Queries
- Use `select` to limit fields
- Use `include` strategically
- Consider pagination for lists
- Use indexes appropriately
- Avoid N+1 queries

### Caching
Services are designed to work with caching layers:

```typescript
// Future: Add caching
const cacheKey = `user:${userId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const user = await prisma.user.findUnique({ where: { id: userId } });
await redis.setex(cacheKey, 300, JSON.stringify(user));
return user;
```

---

## Troubleshooting

### Common Issues

**Issue: Tenant isolation not working**
- Verify `tenantId` is passed to all service methods
- Check Prisma queries include tenant filter
- Review middleware for tenant extraction

**Issue: Audit logs not created**
- Ensure audit log creation is after successful operation
- Check for transaction rollbacks
- Verify audit log permissions

**Issue: Tests failing**
- Run `cleanupTestData()` in beforeEach/afterEach
- Check for hardcoded IDs
- Verify test database is accessible

---

## Contributing

When contributing to the service layer:

1. Follow existing patterns
2. Write comprehensive tests
3. Document complex logic
4. Update this README if needed
5. Ensure tenant isolation
6. Add audit logging
7. Use structured logging

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

---

**Last Updated:** December 21, 2024
**Maintainers:** AuraOS Development Team
