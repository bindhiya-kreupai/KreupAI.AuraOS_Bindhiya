import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('shift-assignments:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing shift-assignments:read permission',
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
      shiftId: searchParams.get('shiftId') || undefined,
      isActive:
        searchParams.get('isActive') === 'true'
          ? true
          : searchParams.get('isActive') === 'false'
            ? false
            : undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 50,
    };

    const result = await ShiftManagementService.findAllAssignments(filter);

    const data = result.data.map((assignment: any) => ({
      id: assignment.id,
      employeeId: assignment.employeeId,
      shiftId: assignment.shiftId,
      effectiveFrom:
        assignment.effectiveFrom instanceof Date
          ? assignment.effectiveFrom.toISOString()
          : assignment.effectiveFrom,
      effectiveTo: assignment.effectiveTo
        ? assignment.effectiveTo instanceof Date
          ? assignment.effectiveTo.toISOString()
          : assignment.effectiveTo
        : null,
      reason: assignment.reason,
      isActive: assignment.isActive,
      shift: assignment.shift ? { id: assignment.shift.id, name: assignment.shift.name } : null,
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5000', message: 'Internal server error', messageAr: 'خطأ في الخادم' },
      },
      { status: 500 }
    );
  }
});

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('shift-assignments:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shift-assignments:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();
      body.tenantId = user.tenantId;

      const assignment = await ShiftManagementService.createAssignment(body, user.userId);
      return NextResponse.json({ success: true, data: assignment }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E1001', message: 'Invalid input', messageAr: 'خطأ في الإدخال' },
        },
        { status: 400 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'shiftAssignment',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);
