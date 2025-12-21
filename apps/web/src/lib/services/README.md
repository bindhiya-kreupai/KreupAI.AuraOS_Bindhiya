# Service Layer Architecture

## Overview

The service layer provides a clean separation between business logic and API routes. This architecture improves:

- **Maintainability**: Business logic is centralized and easy to find
- **Testability**: Services can be unit tested independently of HTTP layers
- **Reusability**: Business logic can be shared across multiple endpoints
- **Transaction Management**: Complex operations are handled consistently
- **Error Handling**: Standardized error responses across the application

## Architecture

```
┌─────────────────┐
│   API Routes    │  (HTTP layer - validation, auth, response formatting)
│  /api/users     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Services     │  (Business logic layer)
│  UserService    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Prisma      │  (Data access layer)
│   Database      │
└─────────────────┘
```

## Base Service

All services extend `BaseService` which provides common utilities:

### Key Features

1. **Audit Logging**: `createAuditLog()`
2. **Transaction Management**: `executeTransaction()`
3. **Pagination**: `buildPaginationMeta()`
4. **IP Extraction**: `extractIpAddress()`

### Example

```typescript
import { BaseService, ServiceResponse } from './base.service';

export class MyService extends BaseService {
  async myMethod(): Promise<ServiceResponse> {
    return await this.executeTransaction(async (tx) => {
      // Your transactional operations here
      const result = await tx.model.create({ data });

      await this.createAuditLog({
        userId: 'user-id',
        action: 'CREATE',
        module: 'My Module',
        details: 'Created entity',
        ipAddress: 'ip-address',
      });

      return result;
    });
  }
}
```

## Service Response Pattern

All service methods return a standardized `ServiceResponse`:

```typescript
interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
```

### Success Response
```typescript
{
  success: true,
  data: { id: '123', name: 'John' },
  meta: { total: 100, page: 1, limit: 20, totalPages: 5 }
}
```

### Error Response
```typescript
{
  success: false,
  error: 'User not found'
}
```

## Available Services

### 1. UserService

Manages user operations with tenant isolation and audit trails.

**Methods:**
- `listUsers(options, requestingUserId)` - List users with filters
- `getUserById(userId)` - Get single user
- `createUser(input, createdBy, ipAddress)` - Create new user
- `updateUser(userId, input, updatedBy, ipAddress)` - Update user
- `deleteUser(userId, deletedBy, ipAddress)` - Soft delete user
- `userExistsByEmail(email)` - Check email existence

**Example:**
```typescript
import { userService } from '@/lib/services';

// In API route
const result = await userService.listUsers({
  search: 'john',
  status: 'Active',
  tenantId: 'tenant-123',
  page: 1,
  limit: 20,
}, requestingUserId);

if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 500 });
}

return NextResponse.json({ data: result.data, meta: result.meta });
```

### 2. LicenseService

Manages software license tracking and allocation.

**Methods:**
- `listLicenses(options)` - List licenses with utilization metrics
- `getLicenseById(licenseId)` - Get single license
- `createLicense(input, createdBy, ipAddress)` - Create license
- `updateLicense(licenseId, input, updatedBy, ipAddress)` - Update license
- `deleteLicense(licenseId, deletedBy, ipAddress)` - Soft delete license
- `allocateLicense(licenseId, allocatedBy, ipAddress, count)` - Allocate licenses
- `releaseLicense(licenseId, releasedBy, ipAddress, count)` - Release licenses

**Automatic Features:**
- Calculates `utilization` percentage
- Calculates `available` count
- Validates used ≤ total

**Example:**
```typescript
import { licenseService } from '@/lib/services';

// Allocate a license
const result = await licenseService.allocateLicense(
  'license-id',
  'user-id',
  '192.168.1.1',
  1  // count
);

if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}

console.log(result.data.utilization); // Auto-calculated
console.log(result.data.available);   // Auto-calculated
```

### 3. MasterDataService

Generic service for managing master data entities (countries, states, cities, currencies, languages).

**Methods:**
- `listEntities(entityType, options)` - List entities with filters
- `getEntityById(entityType, entityId)` - Get single entity
- `createEntity(entityType, data, createdBy, ipAddress)` - Create entity
- `updateEntity(entityType, entityId, data, updatedBy, ipAddress)` - Update entity
- `deleteEntity(entityType, entityId, deletedBy, ipAddress)` - Delete entity
- `getStatesByCountry(countryId)` - Get states for a country
- `getCitiesByState(stateId)` - Get cities for a state

**Supported Entities:**
- `countries` - Countries with ISO codes
- `states` - States/provinces with country relationship
- `cities` - Cities with state relationship
- `currencies` - Currency definitions
- `languages` - Language definitions

**Example:**
```typescript
import { masterDataService } from '@/lib/services';

// List all active countries
const result = await masterDataService.listEntities('countries', {
  status: 'Active',
  page: 1,
  limit: 50,
});

// Create a new state
const stateResult = await masterDataService.createEntity(
  'states',
  { countryId: 'country-id', code: 'CA', name: 'California' },
  'user-id',
  '192.168.1.1'
);
```

## Usage in API Routes

### Before (Without Service Layer)

```typescript
export const POST = withEnhancedAuth(async (request, { user, permissions }) => {
  const permissionError = requirePermission(Resource.USERS, Action.CREATE, permissions);
  if (permissionError) return permissionError;

  const body = await request.json();
  const validatedData = CreateUserSchema.parse(body);

  // Direct Prisma calls mixed with business logic
  const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
  if (existingUser) {
    return NextResponse.json({ error: 'User exists' }, { status: 400 });
  }

  const hashedPassword = await hashPassword(validatedData.password);
  const newUser = await prisma.user.create({ data: { ...validatedData, password: hashedPassword } });

  await prisma.auditLog.create({ data: { ... } });

  return NextResponse.json({ data: newUser }, { status: 201 });
});
```

### After (With Service Layer)

```typescript
export const POST = withEnhancedAuth(async (request, { user, permissions }) => {
  const permissionError = requirePermission(Resource.USERS, Action.CREATE, permissions);
  if (permissionError) return permissionError;

  const body = await request.json();
  const validatedData = CreateUserSchema.parse(body);
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

  // Clean delegation to service layer
  const result = await userService.createUser(validatedData, user.userId, ipAddress);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
});
```

## Benefits

### 1. Separation of Concerns
- API routes handle HTTP-specific logic (headers, status codes, validation)
- Services handle business logic (data operations, audit trails, transactions)
- Database layer handles data persistence

### 2. Transaction Safety
All database operations within services use transactions:
```typescript
await this.executeTransaction(async (tx) => {
  await tx.user.create({ data });
  await tx.auditLog.create({ data });
  // Both succeed or both fail
});
```

### 3. Consistent Audit Logging
Every create/update/delete operation automatically creates an audit log entry.

### 4. Easy Testing
Services can be unit tested without HTTP mocking:
```typescript
describe('UserService', () => {
  it('should create user', async () => {
    const result = await userService.createUser(input, userId, ip);
    expect(result.success).toBe(true);
    expect(result.data.email).toBe(input.email);
  });
});
```

### 5. Code Reusability
Same business logic can be called from:
- API routes
- Background jobs
- CLI scripts
- GraphQL resolvers

## Best Practices

### 1. Keep Services Focused
Each service should handle a single domain entity or related group of entities.

### 2. Return ServiceResponse
Always return the standardized `ServiceResponse` format.

### 3. Handle Errors Gracefully
```typescript
try {
  // Operations
  return { success: true, data: result };
} catch (error) {
  console.error('Service error:', error);
  return { success: false, error: 'Operation failed' };
}
```

### 4. Use Transactions for Multi-Step Operations
```typescript
return await this.executeTransaction(async (tx) => {
  const user = await tx.user.create({ data });
  await tx.auditLog.create({ data });
  return user;
});
```

### 5. Validate Business Rules
Services should validate business rules, not just data shape:
```typescript
if (newUsed > newTotal) {
  return { success: false, error: 'Used cannot exceed total' };
}
```

## Migration Guide

To migrate an existing API route to use services:

1. **Create or extend a service class**
   ```typescript
   export class MyService extends BaseService {
     async myMethod() { ... }
   }
   ```

2. **Move business logic from route to service**
   - Database queries
   - Business rule validation
   - Transaction management
   - Audit logging

3. **Update API route to use service**
   ```typescript
   const result = await myService.myMethod(params);
   if (!result.success) {
     return NextResponse.json({ error: result.error }, { status: 400 });
   }
   return NextResponse.json({ data: result.data });
   ```

4. **Test the refactored code**
   - Unit test the service
   - Integration test the API route

## File Structure

```
apps/web/src/lib/services/
├── README.md                  # This file
├── base.service.ts            # Base class with common utilities
├── user.service.ts            # User management service
├── license.service.ts         # License management service
├── master-data.service.ts     # Master data service
└── index.ts                   # Central exports
```

## Adding a New Service

1. Create `my-service.service.ts`:
```typescript
import { BaseService, ServiceResponse } from './base.service';

export class MyService extends BaseService {
  async myOperation(input: any): Promise<ServiceResponse> {
    // Implementation
  }
}

export const myService = new MyService();
```

2. Export from `index.ts`:
```typescript
export { MyService, myService } from './my-service.service';
```

3. Use in API routes:
```typescript
import { myService } from '@/lib/services';

const result = await myService.myOperation(input);
```

## Performance Considerations

- Services use Prisma's connection pooling automatically
- Transaction overhead is minimal with Prisma
- Pagination is handled efficiently with `skip` and `take`
- Consider caching for frequently accessed read-only data

## Security

- Services receive pre-validated input from API routes
- Tenant isolation is enforced at the route level before calling services
- Sensitive data (passwords) is hashed within services
- All operations are logged for audit trail

## Future Enhancements

- [ ] Add Redis caching layer in services
- [ ] Implement pub/sub for real-time updates
- [ ] Add rate limiting at service level
- [ ] Implement background job queue integration
- [ ] Add comprehensive error classification
- [ ] Implement service-level metrics and monitoring
