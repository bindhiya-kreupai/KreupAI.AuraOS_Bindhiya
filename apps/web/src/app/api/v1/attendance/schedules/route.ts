export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

/**
 * GET /api/v1/attendance/schedules
 * List shift assignments for the tenant, joined with shift and employee info
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('attendance:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing attendance:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const tenantId = context.user.tenantId;

    const assignments = await prisma.shiftAssignment.findMany({
      where: { tenantId },
      include: {
        shift: true,
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    // Look up employee names for all employeeIds in a single query
    const employeeIds = [...new Set(assignments.map((a) => a.employeeId))];
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const employeeMap = new Map(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]));

    const schedules = assignments.map((a) => ({
      id: a.id,
      employeeId: a.employeeId,
      employeeName: employeeMap.get(a.employeeId) || 'Unknown',
      shiftId: a.shiftId,
      shiftName: a.shift.name,
      shiftCode: a.shift.code,
      startTime: a.shift.startTime,
      endTime: a.shift.endTime,
      effectiveFrom: a.effectiveFrom.toISOString().split('T')[0],
      effectiveTo: a.effectiveTo ? a.effectiveTo.toISOString().split('T')[0] : null,
      isActive: a.isActive,
      assignedBy: a.assignedBy,
      reason: a.reason,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        schedules,
        total: schedules.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Schedules API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch schedules',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});

/**
 * POST /api/v1/attendance/schedules
 * Create a new shift assignment
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('attendance:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing attendance:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const tenantId = context.user.tenantId;
    const body = await request.json();

    if (!body.employeeId || !body.shiftId) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'employeeId and shiftId are required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Verify shift exists and belongs to same tenant
    const shift = await prisma.shift.findFirst({
      where: { id: body.shiftId, tenantId },
    });

    if (!shift) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4004',
          message: 'Shift not found',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 404 });
    }

    const assignment = await prisma.shiftAssignment.create({
      data: {
        tenantId,
        employeeId: body.employeeId,
        shiftId: body.shiftId,
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : new Date(),
        effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
        isActive: true,
        assignedBy: context.user.userId,
        reason: body.reason || null,
      },
      include: {
        shift: true,
      },
    });

    // Look up employee name
    const employee = await prisma.employee.findUnique({
      where: { id: body.employeeId },
      select: { firstName: true, lastName: true },
    });

    const mapped = {
      id: assignment.id,
      employeeId: assignment.employeeId,
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
      shiftId: assignment.shiftId,
      shiftName: assignment.shift.name,
      shiftCode: assignment.shift.code,
      startTime: assignment.shift.startTime,
      endTime: assignment.shift.endTime,
      effectiveFrom: assignment.effectiveFrom.toISOString().split('T')[0],
      effectiveTo: assignment.effectiveTo
        ? assignment.effectiveTo.toISOString().split('T')[0]
        : null,
      isActive: assignment.isActive,
      assignedBy: assignment.assignedBy,
      reason: assignment.reason,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: mapped,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Schedules API] POST Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to create schedule',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});
