# Remove Hardcoded Session Data - Migration Guide

**Document Version:** 1.0
**Date:** January 22, 2026
**Priority:** 🔴 HIGH
**Status:** In Progress

---

## Overview

This guide helps identify and remove hardcoded tenant IDs, user IDs, and other session data from API routes, replacing them with authenticated session data.

---

## Common Patterns to Find

### 1. Hardcoded Tenant IDs

```typescript
// ❌ BAD: Hardcoded tenant
const tenantId = 'hardcoded-tenant-id';
const tenantId = 'default';
const tenantId = 'test-tenant';

// ✅ GOOD: From authenticated session
import { withSessionAndTenant } from '@/lib/middleware/session.middleware';

export const GET = withSessionAndTenant(async (request, { user, tenantId }) => {
  // tenantId is validated and comes from user's session
});
```

### 2. Hardcoded User IDs

```typescript
// ❌ BAD: Hardcoded user
const userId = 'hardcoded-user-id';
const userId = 'admin-user';

// ✅ GOOD: From authenticated session
import { withSession } from '@/lib/middleware/session.middleware';

export const GET = withSession(async (request, { user }) => {
  const { userId, email, tenantId } = user;
});
```

### 3. Hardcoded Employee IDs

```typescript
// ❌ BAD: Hardcoded employee
const employeeId = 'emp-123';

// ✅ GOOD: From request or database lookup
const employeeId = request.nextUrl.searchParams.get('employeeId');
// Or from user session
const employee = await prisma.employee.findFirst({
  where: {
    userId: user.userId,
    tenantId
  }
});
```

---

## Search Commands

### Find Hardcoded Values

```bash
# Search for hardcoded tenant IDs
grep -r "tenantId = ['\"]" apps/web/src/app/api/
grep -r "tenantId: ['\"]" apps/web/src/app/api/

# Search for hardcoded user IDs
grep -r "userId = ['\"]" apps/web/src/app/api/
grep -r "userId: ['\"]" apps/web/src/app/api/

# Search for hardcoded employee IDs
grep -r "employeeId = ['\"]" apps/web/src/app/api/

# Find TODO comments about hardcoded data
grep -r "TODO.*hardcod" apps/web/src/app/api/
```

---

## Migration Steps

### Step 1: Identify All Hardcoded Values

Run the search commands above and create a list of files that need updating.

### Step 2: Update Route Files

For each file, follow this pattern:

#### Before (Hardcoded)

```typescript
// apps/web/src/app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET(request: NextRequest) {
  // ❌ HARDCODED
  const tenantId = 'default-tenant';
  const userId = 'admin-user';

  const employees = await prisma.employee.findMany({
    where: { tenantId }
  });

  return NextResponse.json({ success: true, data: employees });
}
```

#### After (Session-Based)

```typescript
// apps/web/src/app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withSessionAndTenant } from '@/lib/middleware/session.middleware';
import { prisma } from '@aura/database';

export const GET = withSessionAndTenant(async (request, { user, tenantId }) => {
  // ✅ From authenticated session
  const employees = await prisma.employee.findMany({
    where: { tenantId }
  });

  return NextResponse.json({
    success: true,
    data: employees,
    meta: {
      tenantId,
      requestedBy: user.email
    }
  });
});
```

### Step 3: Test Each Route

```bash
# Test with valid session
curl -X GET http://localhost:3006/api/employees \
  -H "Cookie: accessToken=<valid-token>"

# Test without session (should return 401)
curl -X GET http://localhost:3006/api/employees

# Test with invalid session (should return 401)
curl -X GET http://localhost:3006/api/employees \
  -H "Cookie: accessToken=invalid-token"
```

---

## Migration Priority List

### Critical Routes (Update First)

1. **User Management**
   - `/api/users/*`
   - `/api/users/[id]/*`

2. **Employee Management**
   - `/api/employees/*`
   - `/api/employees/[id]/*`

3. **Payroll**
   - `/api/payroll/*`
   - `/api/payroll/runs/*`

4. **Leave Management**
   - `/api/leave/*`
   - `/api/leave/applications/*`

5. **Attendance**
   - `/api/attendance/*`

### Medium Priority

6. **Recruitment**
   - `/api/recruitment/*`

7. **Performance**
   - `/api/performance/*`

8. **Benefits**
   - `/api/benefits/*`

### Low Priority (Internal/Admin)

9. **Master Data**
   - `/api/master-data/*`

10. **Configuration**
    - `/api/config/*`

---

## Code Templates

### Template 1: Simple GET with Tenant Filtering

```typescript
import { withSessionAndTenant } from '@/lib/middleware/session.middleware';
import { prisma } from '@aura/database';

export const GET = withSessionAndTenant(async (request, { user, tenantId }) => {
  const data = await prisma.MODEL_NAME.findMany({
    where: { tenantId }
  });

  return NextResponse.json({ success: true, data });
});
```

### Template 2: GET with Additional Filters

```typescript
import { withSessionAndTenant } from '@/lib/middleware/session.middleware';
import { prisma } from '@aura/database';

export const GET = withSessionAndTenant(async (request, { user, tenantId }) => {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');

  const data = await prisma.MODEL_NAME.findMany({
    where: {
      tenantId,
      ...(status && { status })
    }
  });

  return NextResponse.json({ success: true, data });
});
```

### Template 3: POST with CSRF Protection

```typescript
import { withCSRFProtection } from '@/lib/middleware/csrf.middleware';
import { prisma } from '@aura/database';
import { z } from 'zod';

const CreateSchema = z.object({
  name: z.string(),
  // ... other fields
});

export const POST = withCSRFProtection(async (request, { user, csrfToken }) => {
  const body = await request.json();
  const validated = CreateSchema.parse(body);

  const data = await prisma.MODEL_NAME.create({
    data: {
      ...validated,
      tenantId: user.tenantId,
      createdBy: user.userId
    }
  });

  return NextResponse.json({ success: true, data });
});
```

### Template 4: Dynamic Route with ID

```typescript
import { withSessionAndTenant } from '@/lib/middleware/session.middleware';
import { prisma } from '@aura/database';

export const GET = withSessionAndTenant(
  async (request, { user, tenantId, params }) => {
    const { id } = params;

    const data = await prisma.MODEL_NAME.findFirst({
      where: {
        id,
        tenantId  // Ensure tenant isolation
      }
    });

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3001',
            message: 'Resource not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  }
);
```

---

## Testing Strategy

### 1. Create Test Script

```typescript
// scripts/test-routes.ts
import axios from 'axios';

const API_BASE = 'http://localhost:3006/api';
let accessToken: string;

async function login() {
  const response = await axios.post(`${API_BASE}/auth/login`, {
    email: 'test@example.com',
    password: 'password123'
  });
  accessToken = response.data.data.accessToken;
}

async function testRoute(method: string, path: string, data?: any) {
  try {
    const response = await axios({
      method,
      url: `${API_BASE}${path}`,
      headers: {
        Cookie: `accessToken=${accessToken}`
      },
      data
    });
    console.log(`✅ ${method} ${path}: ${response.status}`);
    return true;
  } catch (error: any) {
    console.log(`❌ ${method} ${path}: ${error.response?.status || 'ERROR'}`);
    return false;
  }
}

async function runTests() {
  await login();

  await testRoute('GET', '/employees');
  await testRoute('GET', '/employees/emp-123');
  await testRoute('GET', '/payroll/runs');
  await testRoute('GET', '/leave/applications');
  // Add more routes...
}

runTests();
```

### 2. Run Tests

```bash
npx tsx scripts/test-routes.ts
```

---

## Verification Checklist

For each updated route:

- [ ] Removed all hardcoded `tenantId` values
- [ ] Removed all hardcoded `userId` values
- [ ] Removed all hardcoded `employeeId` values
- [ ] Added session middleware (`withSession` or `withSessionAndTenant`)
- [ ] Verified tenant isolation (queries include `tenantId` filter)
- [ ] Tested with valid session (returns 200)
- [ ] Tested without session (returns 401)
- [ ] Tested with different tenant (returns 403 or empty results)
- [ ] Added CSRF protection for state-changing operations
- [ ] Updated TypeScript types if needed
- [ ] Tested error scenarios

---

## Common Pitfalls

### 1. Forgetting Tenant Filter in Queries

```typescript
// ❌ BAD: Missing tenant filter
const employee = await prisma.employee.findUnique({
  where: { id: employeeId }
});

// ✅ GOOD: With tenant filter
const employee = await prisma.employee.findFirst({
  where: {
    id: employeeId,
    tenantId  // Critical for multi-tenant isolation
  }
});
```

### 2. Not Checking for Null Results

```typescript
// ❌ BAD: Assumes data exists
const employee = await prisma.employee.findFirst({ where: { id, tenantId } });
const name = employee.name;  // Could crash if null

// ✅ GOOD: Handle null
const employee = await prisma.employee.findFirst({ where: { id, tenantId } });
if (!employee) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

### 3. Using Wrong Middleware

```typescript
// ❌ BAD: withSession when you need tenant
export const GET = withSession(async (request, { user }) => {
  const tenantId = ???  // Where does this come from?
});

// ✅ GOOD: withSessionAndTenant
export const GET = withSessionAndTenant(async (request, { user, tenantId }) => {
  // tenantId is validated and provided
});
```

---

## Progress Tracking

Track your progress with this checklist:

```bash
# Total routes to update
find apps/web/src/app/api -name "route.ts" | wc -l

# Routes with hardcoded tenantId
grep -r "tenantId = ['\"]" apps/web/src/app/api/ | wc -l

# Routes using session middleware
grep -r "withSession" apps/web/src/app/api/ | wc -l
```

---

## Estimated Effort

- **Critical routes (20-30):** 2-3 days
- **Medium priority (30-40):** 3-4 days
- **Low priority (20-30):** 2-3 days
- **Testing & verification:** 1-2 days

**Total:** 8-12 days (1.5-2.5 weeks)

---

**Document Owner:** Backend Engineering Team
**Last Updated:** January 22, 2026
**Status:** Migration Guide - Ready to Use
