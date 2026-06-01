import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/leaves
 * List leave requests with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('leaves:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leaves:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const employeeId = searchParams.get('employeeId') || undefined;
    const status = searchParams.get('status') || undefined;
    const leaveTypeId = searchParams.get('leaveTypeId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (leaveTypeId) where.leaveTypeId = leaveTypeId;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) (where.startDate as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.startDate as Record<string, unknown>).lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
          leaveType: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Leaves API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: 'Failed to fetch leave requests' },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/leaves
 * Create a new leave request
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('leaves:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leaves:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.leaveTypeId || !body.startDate || !body.endDate) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'leaveTypeId, startDate and endDate are required' },
        },
        { status: 400 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId || user.employeeId,
        leaveTypeId: body.leaveTypeId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        totalDays: body.totalDays || 1,
        reason: body.reason || '',
        status: 'PENDING',
        appliedBy: user.id,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        leaveType: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: leaveRequest,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[Leaves API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create leave request',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
