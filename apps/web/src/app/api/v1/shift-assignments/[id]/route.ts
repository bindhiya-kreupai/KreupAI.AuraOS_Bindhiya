import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('shift-assignments:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shift-assignments:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;
      const body = await request.json();

      const assignment = await ShiftManagementService.updateAssignment(
        id,
        user.tenantId,
        body,
        user.userId || user.id
      );
      if (!assignment) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'Assignment not found',
              messageAr: 'التكليف غير موجود',
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: assignment });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E5000', message: 'Internal server error', messageAr: 'خطأ في الخادم' },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'shiftAssignment',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);

export const DELETE = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('shift-assignments:delete')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shift-assignments:delete permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;

      const assignment = await ShiftManagementService.deleteAssignment(id, user.tenantId);
      if (!assignment) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'Assignment not found',
              messageAr: 'التكليف غير موجود',
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: assignment });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E5000', message: 'Internal server error', messageAr: 'خطأ في الخادم' },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_DELETED,
    resourceType: 'shiftAssignment',
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
