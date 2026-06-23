import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { employeeMasterActivationService } from '@/lib/services/employee-master-activation.service';

export const dynamic = 'force-dynamic';

function canWrite(permissions: string[]) {
  return (
    permissions.includes('onboarding:write') ||
    permissions.includes('employee:update') ||
    permissions.includes('employees:create')
  );
}

export const POST = withEnhancedAuth(
  async (
    request: NextRequest,
    context: {
      user: { id: string; tenantId: string };
      permissions: string[];
      params?: { id?: string };
    }
  ) => {
    if (!canWrite(context.permissions)) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'Forbidden' } },
        { status: 403 }
      );
    }

    try {
      const id = context.params?.id;
      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'id is required' } },
          { status: 400 }
        );
      }
      const body = await request.json();
      const auth = { tenantId: context.user.tenantId, userId: context.user.id };
      let data: unknown;
      switch (body.action) {
        case 'submit':
          data = await employeeMasterActivationService.submit(id, auth);
          break;
        case 'approve':
          data = await employeeMasterActivationService.approve(id, auth);
          break;
        case 'reject':
          data = await employeeMasterActivationService.reject(id, body.reason ?? 'Rejected', auth);
          break;
        case 'activate':
          data = await employeeMasterActivationService.activate(id, auth);
          break;
        default:
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E2001',
                message: 'action must be one of: submit, approve, reject, activate',
              },
            },
            { status: 400 }
          );
      }
      return NextResponse.json({ success: true, data, message: `Draft ${body.action} complete` });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to transition employee master-data draft',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);
