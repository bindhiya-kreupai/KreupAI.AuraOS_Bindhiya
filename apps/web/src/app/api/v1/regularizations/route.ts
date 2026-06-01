import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { OvertimeService } from '@/lib/services/overtime.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('regularizations:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing regularizations:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const filter = {
      tenantId: user.tenantId,
      employeeId: searchParams.get('employeeId') || undefined,
      status: searchParams.get('status') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 50,
    };

    const result = await OvertimeService.findAllRegularizations(filter);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('regularizations:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing regularizations:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();
      body.tenantId = user.tenantId;

      const regularization = await OvertimeService.createRegularization(body);
      return NextResponse.json({ success: true, data: regularization }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'E1001', message: error.message } },
        { status: 400 }
      );
    }
  }),
  {
    action: AuditAction.ATTENDANCE_REGULARIZED,
    resourceType: 'attendance_regularization',
    captureRequestBody: true,
  }
);
