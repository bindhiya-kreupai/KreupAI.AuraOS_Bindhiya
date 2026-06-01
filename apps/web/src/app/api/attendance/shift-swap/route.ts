import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const ShiftSwapSchema = z.object({
  requestorId: z.string().optional(),
  targetEmployeeId: z.string().optional(),
  requestorDate: z.string(),
  targetDate: z.string(),
  reason: z.string().min(1),
  requestorShiftId: z.string().optional(),
  requestorTime: z.string().optional(),
  requestorShiftType: z.string().optional(),
  requestorLocation: z.string().optional(),
});

// GET - Fetch shift swap requests
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const requestedEmployeeId = searchParams.get('employeeId');
    const employeeId =
      !requestedEmployeeId || ['current-user', 'current-user-id'].includes(requestedEmployeeId)
        ? user.employeeId || user.userId
        : requestedEmployeeId;

    const mockSwaps = [
      {
        id: '1',
        requestorId: employeeId,
        requestorName: 'John Doe',
        targetEmployeeId: 'emp-2',
        targetEmployeeName: 'Jane Smith',
        requestorDate: '2024-08-25',
        targetDate: '2024-08-26',
        requestorShiftId: 'shift-assignment-1',
        requestorTime: '09:00 - 18:00',
        requestorShiftType: 'Morning',
        requestorLocation: 'Main Office',
        reason: 'Personal emergency',
        status: 'PENDING',
        requestedAt: '2024-08-20',
      },
      {
        id: '2',
        requestorId: 'emp-3',
        requestorName: 'Mike Ross',
        targetEmployeeId: employeeId,
        targetEmployeeName: 'John Doe',
        requestorDate: '2024-08-30',
        targetDate: '2024-08-31',
        requestorShiftId: 'shift-assignment-2',
        requestorTime: '14:00 - 22:00',
        requestorShiftType: 'Evening',
        requestorLocation: 'HQ',
        reason: 'Medical appointment',
        status: 'APPROVED',
        requestedAt: '2024-08-28',
        approvedAt: '2024-08-29',
        approvedBy: 'manager-1',
      },
    ];

    let filteredData = mockSwaps;
    if (status) {
      filteredData = mockSwaps.filter((s) => s.status === status);
    }
    if (requestedEmployeeId) {
      filteredData = filteredData.filter(
        (s) => s.requestorId === employeeId || s.targetEmployeeId === employeeId
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      meta: { total: filteredData.length },
    });
  } catch (error) {
    logger.error({ error }, '');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shift swaps' },
      { status: 500 }
    );
  }
});

// POST - Request shift swap
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const data = ShiftSwapSchema.parse({
      requestorId: body.requestorId || body.fromEmployeeId,
      targetEmployeeId: body.targetEmployeeId || body.toEmployeeId,
      requestorDate: body.requestorDate || body.date,
      targetDate: body.targetDate || body.date || body.requestorDate,
      reason: body.reason,
      requestorShiftId: body.requestorShiftId || body.shiftId,
      requestorTime: body.requestorTime || body.time,
      requestorShiftType: body.requestorShiftType || body.shiftType,
      requestorLocation: body.requestorLocation || body.location,
    });
    const requestorId =
      !data.requestorId || ['current-user', 'current-user-id'].includes(data.requestorId)
        ? user.employeeId || user.userId
        : data.requestorId;
    const targetEmployeeId =
      !data.targetEmployeeId || ['current-user', 'current-user-id'].includes(data.targetEmployeeId)
        ? undefined
        : data.targetEmployeeId;

    const newSwap = {
      id: crypto.randomUUID(),
      ...data,
      requestorId,
      targetEmployeeId,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      requestorShiftId: data.requestorShiftId || 'shift-assignment',
      requestorTime: data.requestorTime || '09:00 - 18:00',
      requestorShiftType: data.requestorShiftType || 'Morning',
      requestorLocation: data.requestorLocation || 'Main Office',
    };

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'CREATE',
        entityType: 'Attendance - Shift Swapping',
        details: `Requested shift swap for ${data.requestorDate}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true, data: newSwap }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error({ error }, '');
    return NextResponse.json(
      { success: false, error: 'Failed to create shift swap' },
      { status: 500 }
    );
  }
});

// PUT - Approve/Reject shift swap
export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const actingEmployeeId =
      !body.employeeId || ['current-user', 'current-user-id'].includes(body.employeeId)
        ? user.employeeId || user.userId
        : body.employeeId;
    const { id, status, reason } = body;

    const updated = {
      id,
      status,
      approvedBy: user.userId,
      approvedAt: new Date().toISOString(),
      targetEmployeeId: actingEmployeeId,
      rejectionReason: reason,
    };

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'UPDATE',
        entityType: 'Attendance - Shift Swapping',
        details: `${status} shift swap request: ${id}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error({ error }, '');
    return NextResponse.json(
      { success: false, error: 'Failed to update shift swap' },
      { status: 500 }
    );
  }
});
