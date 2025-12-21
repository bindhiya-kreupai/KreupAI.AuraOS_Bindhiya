# Tenant Isolation Guide

## Overview

Tenant isolation ensures that users can only access data belonging to their own organization (tenant). This is critical for multi-tenant SaaS applications to prevent data leaks and unauthorized access.

## Why Tenant Isolation Matters

### Security Risks Without Proper Isolation
- **Data Leaks**: Users accessing other tenants' sensitive data
- **Privacy Violations**: GDPR, HIPAA, and other compliance failures
- **Business Risk**: Loss of customer trust and potential legal issues
- **Competitive Intelligence**: Competitors accessing each other's data

### Real-World Impact
```typescript
// ❌ DANGEROUS - No tenant isolation
const users = await prisma.user.findMany();
// Returns users from ALL tenants!

// ✅ SAFE - Tenant isolated
const users = await prisma.user.findMany({
  where: { tenantId: user.tenantId },
});
// Returns only users from authenticated user's tenant
```

## Implementation Strategy

### 1. Always Filter by Tenant

**Every database query MUST include tenant filter:**

```typescript
import { addTenantFilter } from '@/lib/middleware/tenant-isolation';

// ❌ WRONG - Missing tenant filter
const users = await prisma.user.findMany({
  where: { status: 'Active' },
});

// ✅ CORRECT - Includes tenant filter
const users = await prisma.user.findMany({
  where: {
    ...addTenantFilter(user.tenantId),
    status: 'Active',
  },
});
```

### 2. Validate Resource Access

**Before returning any resource, validate it belongs to user's tenant:**

```typescript
import { validateTenantAccess } from '@/lib/middleware/tenant-isolation';

// Get resource
const license = await prisma.license.findUnique({
  where: { id: licenseId },
});

if (!license) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// ✅ Validate tenant access BEFORE returning
validateTenantAccess(
  license.tenantId,
  user.tenantId,
  'License',
  license.id
);

// Safe to return
return NextResponse.json({ data: license });
```

### 3. Validate Multiple Resources

**For batch operations:**

```typescript
import { validateMultipleTenantAccess } from '@/lib/middleware/tenant-isolation';

// Get multiple licenses
const licenses = await prisma.license.findMany({
  where: { id: { in: licenseIds } },
});

// ✅ Validate ALL belong to user's tenant
validateMultipleTenantAccess(licenses, user.tenantId, 'License');

// Safe to proceed
await processBatch(licenses);
```

## API Route Patterns

### List Endpoint (GET /api/resources)

```typescript
export const GET = withEnhancedAuth(async (request: NextRequest, { user }) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // ✅ ALWAYS include tenant filter
  const resources = await prisma.resource.findMany({
    where: {
      ...addTenantFilter(user.tenantId),  // ← CRITICAL
      // ... other filters
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({ data: resources });
});
```

### Get by ID Endpoint (GET /api/resources/:id)

```typescript
export const GET = withEnhancedAuth(async (
  request: NextRequest,
  { user, params }
) => {
  const { id } = params;

  // Option 1: Filter by tenant in query
  const resource = await prisma.resource.findFirst({
    where: {
      id,
      ...addTenantFilter(user.tenantId),  // ← Ensures tenant match
    },
  });

  if (!resource) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Option 2: Validate after query
  const resource2 = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource2) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // ✅ Validate tenant before returning
  validateTenantAccess(resource2.tenantId, user.tenantId, 'Resource', id);

  return NextResponse.json({ data: resource2 });
});
```

### Create Endpoint (POST /api/resources)

```typescript
export const POST = withEnhancedAuth(async (request: NextRequest, { user }) => {
  const body = await request.json();

  // ✅ FORCE user's tenant ID (don't trust client)
  const resource = await prisma.resource.create({
    data: {
      ...body,
      tenantId: user.tenantId,  // ← Override any tenant ID from client
    },
  });

  return NextResponse.json({ data: resource }, { status: 201 });
});
```

### Update Endpoint (PUT /api/resources/:id)

```typescript
export const PUT = withEnhancedAuth(async (
  request: NextRequest,
  { user, params }
) => {
  const { id } = params;
  const body = await request.json();

  // ✅ Validate tenant access BEFORE updating
  const existing = await prisma.resource.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  validateTenantAccess(existing.tenantId, user.tenantId, 'Resource', id);

  // ✅ Prevent tenant ID modification
  const { tenantId, ...updateData } = body;

  const updated = await prisma.resource.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ data: updated });
});
```

### Delete Endpoint (DELETE /api/resources/:id)

```typescript
export const DELETE = withEnhancedAuth(async (
  request: NextRequest,
  { user, params }
) => {
  const { id } = params;

  // ✅ Validate tenant access BEFORE deleting
  const existing = await prisma.resource.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  validateTenantAccess(existing.tenantId, user.tenantId, 'Resource', id);

  await prisma.resource.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
});
```

## Advanced Patterns

### Nested Relations

```typescript
// ✅ Validate parent AND child tenants
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true,
    sessions: true,
  },
});

if (user) {
  // Validate user tenant
  validateTenantAccess(user.tenantId, authUser.tenantId, 'User', userId);

  // Validate all sessions belong to same tenant
  if (user.sessions.length > 0) {
    validateMultipleTenantAccess(
      user.sessions,
      authUser.tenantId,
      'Session'
    );
  }
}
```

### Cross-Tenant References

```typescript
// When resources reference other tenants (e.g., shared resources)
const sharedResource = await prisma.sharedResource.findUnique({
  where: { id },
  include: {
    sharedWith: true,  // Tenants this is shared with
  },
});

// ✅ Check if user's tenant has access
const hasAccess =
  sharedResource.ownerTenantId === user.tenantId ||
  sharedResource.sharedWith.some((share) => share.tenantId === user.tenantId);

if (!hasAccess) {
  throw new TenantIsolationError('Access denied');
}
```

### Super Admin Bypass

```typescript
import { validateTenantAccessWithBypass } from '@/lib/middleware/tenant-isolation';

// Super admins can access any tenant
const resource = await prisma.resource.findUnique({
  where: { id },
});

if (!resource) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// ✅ Bypasses tenant check for super admins
validateTenantAccessWithBypass(
  resource.tenantId,
  user,
  'Resource',
  id
);
```

## Service Layer Integration

```typescript
// In your service layer
export class ResourceService extends BaseService {
  async getResource(id: string, userTenantId: string) {
    const resource = await this.prisma.resource.findFirst({
      where: {
        id,
        ...addTenantFilter(userTenantId),  // ← Always filter
      },
    });

    if (!resource) {
      return { success: false, error: 'Resource not found' };
    }

    return { success: true, data: resource };
  }

  async listResources(tenantId: string, filters: any) {
    const resources = await this.prisma.resource.findMany({
      where: {
        ...addTenantFilter(tenantId),  // ← Always filter
        ...filters,
      },
    });

    return { success: true, data: resources };
  }
}
```

## Testing Tenant Isolation

### Unit Tests

```typescript
import { validateTenantAccess } from '@/lib/middleware/tenant-isolation';
import { TenantIsolationError } from '@/lib/errors';

describe('Tenant Isolation', () => {
  it('should allow same tenant access', () => {
    expect(() => {
      validateTenantAccess('tenant-1', 'tenant-1', 'User', 'user-1');
    }).not.toThrow();
  });

  it('should block different tenant access', () => {
    expect(() => {
      validateTenantAccess('tenant-1', 'tenant-2', 'User', 'user-1');
    }).toThrow(TenantIsolationError);
  });
});
```

### Integration Tests

```typescript
it('should enforce tenant isolation in API', async () => {
  // User from tenant-1
  const tenant1Token = generateToken({ tenantId: 'tenant-1' });

  // Resource from tenant-2
  const tenant2Resource = await prisma.resource.create({
    data: { tenantId: 'tenant-2', name: 'Secret' },
  });

  // Try to access cross-tenant resource
  const response = await fetch(`/api/resources/${tenant2Resource.id}`, {
    headers: { Authorization: `Bearer ${tenant1Token}` },
  });

  // ✅ Should return 403 or 404, not the resource
  expect(response.status).toBe(403);
  const data = await response.json();
  expect(data.data).toBeUndefined();
});
```

## Common Mistakes

### 1. Trusting Client Input

```typescript
// ❌ DANGEROUS - Client can send any tenant ID
const resource = await prisma.resource.create({
  data: {
    ...body,  // Contains tenantId from client
  },
});

// ✅ SAFE - Force server-side tenant ID
const resource = await prisma.resource.create({
  data: {
    ...body,
    tenantId: user.tenantId,  // Override with authenticated user's tenant
  },
});
```

### 2. Missing Validation on Read

```typescript
// ❌ DANGEROUS - Returns resource without tenant check
const resource = await prisma.resource.findUnique({ where: { id } });
return NextResponse.json({ data: resource });

// ✅ SAFE - Validates before returning
const resource = await prisma.resource.findUnique({ where: { id } });
validateTenantAccess(resource.tenantId, user.tenantId, 'Resource', id);
return NextResponse.json({ data: resource });
```

### 3. Forgetting Update/Delete Checks

```typescript
// ❌ DANGEROUS - Deletes without checking tenant
await prisma.resource.delete({ where: { id } });

// ✅ SAFE - Validates before deleting
const existing = await prisma.resource.findUnique({ where: { id } });
validateTenantAccess(existing.tenantId, user.tenantId, 'Resource', id);
await prisma.resource.delete({ where: { id } });
```

### 4. Batch Operations Without Validation

```typescript
// ❌ DANGEROUS - Updates all matching IDs regardless of tenant
await prisma.resource.updateMany({
  where: { id: { in: ids } },
  data: { status: 'Archived' },
});

// ✅ SAFE - Validates AND filters by tenant
const resources = await prisma.resource.findMany({
  where: {
    id: { in: ids },
    ...addTenantFilter(user.tenantId),
  },
});
validateMultipleTenantAccess(resources, user.tenantId, 'Resource');
await prisma.resource.updateMany({
  where: {
    id: { in: resources.map((r) => r.id) },
    ...addTenantFilter(user.tenantId),
  },
  data: { status: 'Archived' },
});
```

## Monitoring and Alerts

### Log Violations

```typescript
import { logTenantViolation } from '@/lib/middleware/tenant-isolation';

try {
  validateTenantAccess(resource.tenantId, user.tenantId, 'Resource', id);
} catch (error) {
  if (error instanceof TenantIsolationError) {
    // Log to audit trail
    await logTenantViolation(prisma, {
      userId: user.userId,
      resourceType: 'Resource',
      resourceId: id,
      resourceTenantId: resource.tenantId,
      userTenantId: user.tenantId,
      ipAddress: request.headers.get('x-forwarded-for'),
    });

    // Alert security team
    await alertSecurityTeam(error);
  }
  throw error;
}
```

### Metrics Dashboard

Track tenant violations in your monitoring system:

```typescript
// Increment violation counter
metrics.increment('tenant_isolation.violations', {
  resourceType: 'User',
  severity: 'HIGH',
});

// Alert if violations exceed threshold
if (violationsLastHour > 10) {
  await notifySecurityTeam({
    alert: 'High rate of tenant isolation violations',
    count: violationsLastHour,
  });
}
```

## Database Constraints

Add database-level constraints as additional safety:

```sql
-- Row-level security (PostgreSQL)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON users
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Check constraints
ALTER TABLE resources
  ADD CONSTRAINT check_tenant_not_null
  CHECK (tenant_id IS NOT NULL);
```

## Checklist

Before deploying to production, verify:

- [ ] All database queries include tenant filter
- [ ] All GET endpoints validate tenant before returning
- [ ] All UPDATE/DELETE endpoints validate tenant before modifying
- [ ] POST endpoints force authenticated user's tenant ID
- [ ] Batch operations validate all resources
- [ ] Tenant violations are logged to audit trail
- [ ] Integration tests cover cross-tenant access attempts
- [ ] Database constraints enforce tenant presence
- [ ] Monitoring alerts on isolation violations

## Resources

- [OWASP: Insecure Direct Object Reference](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References)
- [Multi-tenancy Best Practices](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models)
- [Row-Level Security in PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**Last Updated**: 2025-12-20
**Severity**: CRITICAL
**Priority**: HIGHEST
