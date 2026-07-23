import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

function generateShiftCode(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `SHIFT-${dateStr}-${seq}`;
}

function validateShiftPayload(body: Record<string, unknown>): { valid: boolean; error?: string } {
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return { valid: false, error: 'Shift name is required' };
  }
  if (!body.startTime || typeof body.startTime !== 'string' || !timeRegex.test(body.startTime)) {
    return { valid: false, error: 'Start time must be in HH:MM format (00:00-23:59)' };
  }
  if (!body.endTime || typeof body.endTime !== 'string' || !timeRegex.test(body.endTime)) {
    return { valid: false, error: 'End time must be in HH:MM format (00:00-23:59)' };
  }
  if (body.startTime === body.endTime) {
    return { valid: false, error: 'Start time and end time must be different' };
  }
  if (
    body.workHours !== undefined &&
    (typeof body.workHours !== 'number' || body.workHours < 0.5)
  ) {
    return { valid: false, error: 'Work hours must be at least 0.5' };
  }
  return { valid: true };
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('shifts:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing shifts:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const rawLimit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 200);
    const filter = {
      tenantId: user.tenantId,
      isActive:
        searchParams.get('isActive') === 'true'
          ? true
          : searchParams.get('isActive') === 'false'
            ? false
            : undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: Math.max(Number(searchParams.get('page')) || 1, 1),
      limit: rawLimit,
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc',
    };

    const result = await ShiftManagementService.findAllShifts(filter);

    const data = result.data.map((shift: any) => ({
      id: shift.id,
      code: shift.code,
      name: shift.name,
      description: shift.description,
      startTime: shift.startTime,
      endTime: shift.endTime,
      workHours: shift.workHours,
      graceInMinutes: shift.graceInMinutes,
      graceOutMinutes: shift.graceOutMinutes ?? 0,
      breakDuration: shift.breakDuration,
      isPaidBreak: shift.isPaidBreak ?? true,
      overtimeAllowed: shift.overtimeAllowed,
      maxOvertimeHours: shift.maxOvertimeHours,
      isFlexible: shift.isFlexible,
      flexWindow: shift.flexWindow,
      isActive: shift.isActive,
      isDefault: shift.isDefault,
      weekendDays: shift.weekendDays,
      _count: shift._count,
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
      { success: false, error: { code: 'E5000', message: 'Internal server error' } },
      { status: 500 }
    );
  }
});

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('shifts:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shifts:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();
      const validation = validateShiftPayload(body);
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E1001', message: validation.error, messageAr: 'خطأ في الإدخال' },
          },
          { status: 400 }
        );
      }

      if (!body.code || typeof body.code !== 'string' || body.code.trim().length === 0) {
        body.code = generateShiftCode();
      }

      body.tenantId = user.tenantId;

      const shift = await ShiftManagementService.createShift(body, user.userId || user.id);

      const responseData = {
        id: shift.id,
        code: shift.code,
        name: shift.name,
        description: shift.description,
        startTime: shift.startTime,
        endTime: shift.endTime,
        workHours: shift.workHours,
        graceInMinutes: shift.graceInMinutes,
        graceOutMinutes: shift.graceOutMinutes ?? 0,
        breakDuration: shift.breakDuration,
        isPaidBreak: shift.isPaidBreak ?? true,
        overtimeAllowed: shift.overtimeAllowed,
        maxOvertimeHours: shift.maxOvertimeHours,
        isFlexible: shift.isFlexible,
        flexWindow: shift.flexWindow,
        isActive: shift.isActive,
        isDefault: shift.isDefault,
        weekendDays: shift.weekendDays,
      };

      return NextResponse.json({ success: true, data: responseData }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'E1001', message: 'Failed to create shift' } },
        { status: 400 }
      );
    }
  }),
  {
    // TODO: Add shift-specific AuditActions (SHIFT_CREATED, SHIFT_UPDATED, etc.)
    // to the AuditAction enum. Currently using EMPLOYEE_UPDATED as a placeholder
    // which makes shift audit entries indistinguishable from employee updates.
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'shift',
    captureRequestBody: true,
  }
);
