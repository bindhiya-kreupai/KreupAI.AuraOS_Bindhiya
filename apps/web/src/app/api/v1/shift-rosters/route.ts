import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('shift-rosters:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing shift-rosters:read permission',
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
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 100,
    };

    const result = await ShiftManagementService.findAllRosters(filter);

    const data = result.data.map((roster: any) => ({
      id: roster.id,
      employeeId: roster.employeeId,
      shiftId: roster.shiftId,
      rosterDate:
        roster.rosterDate instanceof Date ? roster.rosterDate.toISOString() : roster.rosterDate,
      customStartTime: roster.customStartTime,
      customEndTime: roster.customEndTime,
      isWeekOff: roster.isWeekOff,
      isHoliday: roster.isHoliday,
      status: roster.status,
      shift: roster.shift ? { id: roster.shift.id, name: roster.shift.name } : null,
      employee: roster.employee
        ? {
            id: roster.employee.id,
            firstName: roster.employee.firstName,
            lastName: roster.employee.lastName,
            employeeCode: roster.employee.employeeCode,
          }
        : null,
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
      if (!permissions.includes('shift-rosters:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shift-rosters:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      if (Array.isArray(body)) {
        const rosters = body.map((r) => ({
          ...r,
          tenantId: user.tenantId,
          createdBy: user.userId,
        }));
        const result = await ShiftManagementService.bulkCreateRosters(rosters);
        return NextResponse.json({ success: true, data: result }, { status: 201 });
      } else {
        body.tenantId = user.tenantId;
        body.createdBy = user.userId;
        const roster = await ShiftManagementService.createRoster(body);
        return NextResponse.json({ success: true, data: roster }, { status: 201 });
      }
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
    resourceType: 'shiftRoster',
    captureRequestBody: true,
    captureResponseBody: true,
  }
);
