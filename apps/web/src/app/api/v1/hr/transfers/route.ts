import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/hr/transfers
 * List inter-entity transfer requests
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('hr/transfers:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing hr/transfers:read permission',
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

    const status = searchParams.get('status') || undefined;
    const employeeId = searchParams.get('employeeId') || undefined;
    const fromCompanyId = searchParams.get('fromCompanyId') || undefined;
    const toCompanyId = searchParams.get('toCompanyId') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;
    if (fromCompanyId) where.fromCompanyId = fromCompanyId;
    if (toCompanyId) where.toCompanyId = toCompanyId;

    const [data, total] = await Promise.all([
      (prisma as any).interCompanyTransfer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
          fromCompany: { select: { id: true, name: true, code: true } },
          toCompany: { select: { id: true, name: true, code: true } },
        },
      }),
      (prisma as any).interCompanyTransfer.count({ where }),
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
  } catch (_error: any) {
    console.error('[HR Transfers API] GET Error:', _error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch transfer requests' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/hr/transfers
 * Create an inter-entity transfer request
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('hr/transfers:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing hr/transfers:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.employeeId || !body.fromCompanyId || !body.toCompanyId || !body.effectiveDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'employeeId, fromCompanyId, toCompanyId and effectiveDate are required',
          },
        },
        { status: 400 }
      );
    }

    if (body.fromCompanyId === body.toCompanyId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'fromCompanyId and toCompanyId must be different' },
        },
        { status: 400 }
      );
    }

    const transfer = await (prisma as any).interCompanyTransfer.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        fromCompanyId: body.fromCompanyId,
        toCompanyId: body.toCompanyId,
        effectiveDate: new Date(body.effectiveDate),
        transferType: body.transferType || 'PERMANENT',
        status: 'PENDING',
        requestedBy: user.userId,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        fromCompany: { select: { id: true, name: true, code: true } },
        toCompany: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: transfer,
        message: 'Transfer request created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error: any) {
    console.error('[HR Transfers API] POST Error:', _error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create transfer request',
          details: { error: _error instanceof Error ? _error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
