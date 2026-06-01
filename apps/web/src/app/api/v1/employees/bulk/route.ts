import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/employees/bulk
 * Bulk import employees from CSV/JSON data
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('employees:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing employees:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.employees || !Array.isArray(body.employees) || body.employees.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'employees array is required and must not be empty' },
        },
        { status: 400 }
      );
    }

    if (body.employees.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'Maximum 500 employees can be imported at once' },
        },
        { status: 400 }
      );
    }

    // Proxy to the employee microservice for bulk import
    const result = await ServiceProxy.post('employee', '/employees/bulk', {
      tenantId: user.tenantId,
      employees: body.employees,
      options: {
        updateExisting: body.options?.updateExisting ?? false,
        sendWelcomeEmail: body.options?.sendWelcomeEmail ?? false,
        dryRun: body.options?.dryRun ?? false,
      },
      importedBy: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 202 }
    );
  } catch (_error) {
    console.error('[Employees Bulk Import API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to process bulk employee import',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
