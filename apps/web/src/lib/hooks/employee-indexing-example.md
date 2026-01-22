# Employee Indexing Integration Guide

This guide shows how to integrate Elasticsearch indexing into your employee management API routes.

## Overview

The employee indexing hooks automatically sync employee data to Elasticsearch for fast search capabilities. You should call these hooks after any employee create/update/delete operation.

## Import the Hooks

```typescript
import {
  indexEmployeeOnCreate,
  updateEmployeeIndex,
  removeEmployeeFromIndex,
  bulkIndexEmployees,
} from '@/lib/hooks/employee-indexing.hooks';
```

## Example 1: Create Employee with Indexing

**Location:** `apps/web/src/app/api/employees/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withSessionAndTenant } from '@/lib/middleware/session.middleware';
import { indexEmployeeOnCreate } from '@/lib/hooks/employee-indexing.hooks';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

/**
 * POST /api/employees
 * Create a new employee and index in Elasticsearch
 */
export const POST = withSessionAndTenant(async (request, { user, tenantId }) => {
  try {
    const body = await request.json();

    // 1. Create employee in database
    const employee = await prisma.employee.create({
      data: {
        ...body,
        tenantId,
      },
      include: {
        department: true,
        position: true,
        employmentType: true,
      },
    });

    // 2. Index in Elasticsearch (async, non-blocking)
    indexEmployeeOnCreate(employee).catch((error) => {
      logger.error(
        { error, employeeId: employee.id },
        'Failed to index employee in Elasticsearch'
      );
      // Don't fail the request if indexing fails
    });

    logger.info(
      { employeeId: employee.id, email: employee.email },
      'Employee created and queued for indexing'
    );

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Employee created successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Error creating employee');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create employee',
        },
      },
      { status: 500 }
    );
  }
});
```

## Example 2: Update Employee with Re-indexing

**Location:** `apps/web/src/app/api/employees/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withSessionAndTenant } from '@/lib/middleware/session.middleware';
import { updateEmployeeIndex } from '@/lib/hooks/employee-indexing.hooks';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

/**
 * PUT /api/employees/:id
 * Update employee and re-index in Elasticsearch
 */
export const PUT = withSessionAndTenant(
  async (request, { user, tenantId, params }) => {
    try {
      const employeeId = params.id;
      const body = await request.json();

      // 1. Update employee in database
      const employee = await prisma.employee.update({
        where: {
          id: employeeId,
          tenantId, // Ensure tenant isolation
        },
        data: body,
        include: {
          department: true,
          position: true,
          employmentType: true,
        },
      });

      // 2. Update Elasticsearch index (async, non-blocking)
      updateEmployeeIndex(employee).catch((error) => {
        logger.error(
          { error, employeeId: employee.id },
          'Failed to update employee index'
        );
      });

      logger.info(
        { employeeId: employee.id },
        'Employee updated and index refresh queued'
      );

      return NextResponse.json({
        success: true,
        data: employee,
        message: 'Employee updated successfully',
      });
    } catch (error) {
      logger.error({ error }, 'Error updating employee');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to update employee',
          },
        },
        { status: 500 }
      );
    }
  }
);
```

## Example 3: Delete Employee with Index Removal

```typescript
/**
 * DELETE /api/employees/:id
 * Delete employee and remove from Elasticsearch
 */
export const DELETE = withSessionAndTenant(
  async (request, { user, tenantId, params }) => {
    try {
      const employeeId = params.id;

      // 1. Delete from database
      await prisma.employee.delete({
        where: {
          id: employeeId,
          tenantId,
        },
      });

      // 2. Remove from Elasticsearch (async, non-blocking)
      removeEmployeeFromIndex(employeeId, tenantId).catch((error) => {
        logger.error(
          { error, employeeId },
          'Failed to remove employee from index'
        );
      });

      logger.info({ employeeId }, 'Employee deleted and removed from index');

      return NextResponse.json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      logger.error({ error }, 'Error deleting employee');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to delete employee',
          },
        },
        { status: 500 }
      );
    }
  }
);
```

## Example 4: Bulk Re-indexing

Create a background job or admin endpoint for bulk re-indexing:

**Location:** `apps/web/src/app/api/admin/reindex-employees/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withSession } from '@/lib/middleware/session.middleware';
import { bulkIndexEmployees } from '@/lib/hooks/employee-indexing.hooks';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/reindex-employees
 * Bulk re-index all employees (admin only)
 */
export const POST = withSession(async (request, { user }) => {
  try {
    // TODO: Add admin role check here
    // if (user.role !== 'ADMIN') return 403

    const { tenantId } = await request.json();

    // Fetch all employees
    const employees = await prisma.employee.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        department: true,
        position: true,
        employmentType: true,
      },
    });

    // Bulk index
    const result = await bulkIndexEmployees(employees);

    logger.info(
      {
        total: result.total,
        indexed: result.indexed,
        failed: result.failed,
      },
      'Bulk employee re-indexing completed'
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Re-indexed ${result.indexed} employees`,
    });
  } catch (error) {
    logger.error({ error }, 'Error during bulk re-indexing');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Bulk re-indexing failed',
        },
      },
      { status: 500 }
    );
  }
});
```

## Example 5: Using with RabbitMQ Queue

For high-volume operations, queue the indexing:

```typescript
import { messagingService } from '@/lib/queue/messaging.service';

/**
 * POST /api/employees/bulk-create
 * Bulk create employees and queue indexing
 */
export const POST = withSessionAndTenant(async (request, { user, tenantId }) => {
  try {
    const { employees } = await request.json();

    // 1. Create employees in database
    const created = await prisma.employee.createMany({
      data: employees.map((emp) => ({
        ...emp,
        tenantId,
      })),
    });

    // 2. Queue bulk indexing job
    await messagingService.enqueue(
      'search',
      'employee:bulk-index',
      {
        tenantId,
        count: created.count,
      },
      {
        tenantId,
        userId: user.userId,
      }
    );

    logger.info(
      { count: created.count },
      'Bulk employee creation completed, indexing queued'
    );

    return NextResponse.json({
      success: true,
      data: { count: created.count },
      message: `Created ${created.count} employees, indexing in progress`,
    });
  } catch (error) {
    logger.error({ error }, 'Error in bulk create');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Bulk creation failed',
        },
      },
      { status: 500 }
    );
  }
});
```

## Best Practices

### 1. **Non-Blocking Indexing**
Always call indexing hooks asynchronously and catch errors:
```typescript
indexEmployeeOnCreate(employee).catch((error) => {
  logger.error({ error }, 'Indexing failed');
});
```

### 2. **Don't Fail Requests**
If Elasticsearch is down, the database operation should still succeed:
```typescript
// ✅ Good: Database succeeds even if indexing fails
await prisma.employee.create(data);
indexEmployeeOnCreate(employee).catch(() => {});

// ❌ Bad: Database operation fails if indexing fails
await prisma.employee.create(data);
await indexEmployeeOnCreate(employee); // Throws if ES is down
```

### 3. **Tenant Isolation**
Always include `tenantId` for multi-tenant indexing:
```typescript
removeEmployeeFromIndex(employeeId, tenantId);
```

### 4. **Include Related Data**
Use Prisma `include` to get department/position for rich search:
```typescript
const employee = await prisma.employee.findUnique({
  where: { id },
  include: {
    department: true,
    position: true,
    employmentType: true,
  },
});
```

### 5. **Queue for Bulk Operations**
For bulk operations (>100 records), use RabbitMQ queue:
```typescript
// For large batch operations
if (employees.length > 100) {
  await messagingService.enqueue('search', 'employee:bulk-index', data);
} else {
  await bulkIndexEmployees(employees);
}
```

## Monitoring

Check indexing status:
```typescript
import { employeeSearchService } from '@/lib/search/employee-search.service';

// Check if search service is ready
const isReady = employeeSearchService.isReady();

// Get index statistics
const stats = await employeeSearchService.getIndexStatistics('tenant-123');
```

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `Elasticsearch connection refused` | ES not running | Start Elasticsearch or disable feature |
| `Index does not exist` | Index not created | Run `employeeSearchService.createIndex()` |
| `Document not found` | Employee not indexed | Call `indexEmployeeOnCreate()` |
| `Timeout` | ES slow/overloaded | Increase timeout or queue indexing |

## Testing

Test indexing integration:
```typescript
import { employeeSearchService } from '@/lib/search/employee-search.service';

// After creating employee
const employee = await prisma.employee.create(data);
await indexEmployeeOnCreate(employee);

// Wait for indexing (ES refresh interval is ~1s)
await new Promise((resolve) => setTimeout(resolve, 1500));

// Search for the employee
const results = await employeeSearchService.searchEmployees({
  tenantId,
  query: employee.firstName,
});

expect(results.employees).toContainEqual(
  expect.objectContaining({ id: employee.id })
);
```

## Complete Example Route File

See [`examples/employee-route-with-indexing.ts`](./examples/employee-route-with-indexing.ts) for a complete working example with all CRUD operations.
