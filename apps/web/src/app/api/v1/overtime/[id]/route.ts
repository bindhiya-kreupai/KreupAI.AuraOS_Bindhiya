import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { OvertimeService } from '@/lib/services/overtime.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('overtime:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing overtime:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const overtime = await OvertimeService.findById(id, user.tenantId);
    if (!overtime) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Overtime not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: overtime });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});

export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('overtime:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing overtime:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;
      const body = await request.json();

      const overtime = await OvertimeService.update(id, user.tenantId, body);
      if (!overtime) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'Overtime not found' } },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: overtime });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'E5000', message: error.message } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.ATTENDANCE_UPDATED,
    resourceType: 'overtime',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);

export const DELETE = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('overtime:delete')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing overtime:delete permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;

      const overtime = await OvertimeService.delete(id, user.tenantId);
      if (!overtime) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'Overtime not found' } },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: overtime });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'E5000', message: error.message } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.ATTENDANCE_UPDATED,
    resourceType: 'overtime',
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
