import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/payroll/runs
 * List payroll runs with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') || undefined;
    const payrollMonth = searchParams.get('payrollMonth') || undefined;
    const companyId = searchParams.get('companyId') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;
    if (payrollMonth) where.payrollMonth = payrollMonth;
    if (companyId) where.companyId = companyId;

    const [data, total] = await Promise.all([
      prisma.payrollRun.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { payslips: true } },
        },
      }),
      prisma.payrollRun.count({ where }),
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
    console.error('[Payroll Runs API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch payroll runs' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/payroll/runs
 * Create a new payroll run
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.payrollMonth || !body.companyId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'payrollMonth and companyId are required' },
        },
        { status: 400 }
      );
    }

    // Check for existing run for same month/company
    const existing = await prisma.payrollRun.findFirst({
      where: {
        tenantId: user.tenantId,
        companyId: body.companyId,
        payrollMonth: body.payrollMonth,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E3002', message: `Payroll run already exists for ${body.payrollMonth}` },
        },
        { status: 409 }
      );
    }

    const run = await prisma.payrollRun.create({
      data: {
        tenantId: user.tenantId,
        companyId: body.companyId,
        payrollMonth: body.payrollMonth,
        payrollYear: body.payrollYear || parseInt(body.payrollMonth.split('-')[0]),
        status: 'DRAFT',
        runType: body.runType || 'REGULAR',
        currency: body.currency || 'USD',
        createdBy: user.id,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: run,
        message: 'Payroll run created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[Payroll Runs API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create payroll run',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
