import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { employeeMasterActivationService } from '@/lib/services/employee-master-activation.service';

export const dynamic = 'force-dynamic';

function hasPermission(permissions: string[], action: 'read' | 'write') {
  const required = action === 'read' ? 'onboarding:read' : 'onboarding:write';
  return (
    permissions.includes(required) ||
    permissions.includes('employee:update') ||
    permissions.includes('employees:read') ||
    (action === 'write' && permissions.includes('employees:create'))
  );
}

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!hasPermission(context.permissions, 'read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'Forbidden' } },
        { status: 403 }
      );
    }

    try {
      const url = new URL(request.url);
      const status = url.searchParams.get('status') ?? undefined;
      const employeeId = url.searchParams.get('employeeId') ?? undefined;
      const data = await employeeMasterActivationService.list(context.user.tenantId, {
        status,
        employeeId,
      });
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to load employee master drafts',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withEnhancedAuth(
  async (
    request: NextRequest,
    context: { user: { id: string; tenantId: string }; permissions: string[] }
  ) => {
    if (!hasPermission(context.permissions, 'write')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'Forbidden' } },
        { status: 403 }
      );
    }

    try {
      const body = await request.json();
      const data = await employeeMasterActivationService.createDraft(body, {
        tenantId: context.user.tenantId,
        userId: context.user.id,
      });
      return NextResponse.json(
        { success: true, data, message: 'Employee master-data draft created' },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to create employee master-data draft',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
