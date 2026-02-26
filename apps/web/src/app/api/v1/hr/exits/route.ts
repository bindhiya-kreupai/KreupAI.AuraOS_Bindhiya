import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/hr/exits
 * List exit processes (from HR perspective)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') || undefined;
    const exitType = searchParams.get('exitType') || undefined;
    const _departmentId = searchParams.get('departmentId') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;
    if (exitType) where.exitType = exitType;
    if (search) {
      where.employee = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { employeeCode: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      prisma.exitRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
              department: { select: { name: true } },
              jobProfile: { select: { title: true } },
            },
          },
        },
      }),
      prisma.exitRequest.count({ where }),
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
    console.error('[HR Exits API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch exit processes' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/hr/exits
 * Initiate an exit process from HR
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.employeeId || !body.exitType || !body.lastWorkingDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'employeeId, exitType and lastWorkingDate are required',
          },
        },
        { status: 400 }
      );
    }

    // Check for existing active exit request
    const existing = await prisma.exitRequest.findFirst({
      where: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E3002', message: 'Employee already has an active exit process' },
        },
        { status: 409 }
      );
    }

    const exitRequest = await prisma.exitRequest.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        exitType: body.exitType,
        exitReason: body.exitReason || null,
        exitReasonId: body.exitReasonId || null,
        lastWorkingDate: new Date(body.lastWorkingDate),
        noticePeriodDays: body.noticePeriodDays || 30,
        noticePeriodWaived: body.noticePeriodWaived || false,
        comments: body.comments || null,
        status: 'PENDING',
        initiatedBy: user.id,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: exitRequest,
        message: 'Exit process initiated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[HR Exits API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to initiate exit process',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
