import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/expenses
 * List expense reports with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('expenses:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing expenses:read permission',
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.expenseReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.expenseReport.count({ where }),
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
    console.error('[Expenses API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch expense reports' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/expenses
 * Create a new expense report
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('expenses:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing expenses:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'title is required' } },
        { status: 400 }
      );
    }

    const report = await prisma.expenseReport.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId || user.employeeId,
        title: body.title,
        description: body.description || null,
        currency: body.currency || 'USD',
        totalAmount: body.totalAmount || 0,
        status: 'DRAFT',
        policyId: body.policyId || null,
        createdBy: user.id,
        items: body.items
          ? {
              create: body.items.map((item: any) => ({
                category: item.category,
                description: item.description,
                amount: item.amount,
                currency: item.currency || body.currency || 'USD',
                expenseDate: new Date(item.expenseDate),
                receiptUrl: item.receiptUrl || null,
                merchant: item.merchant || null,
              })),
            }
          : undefined,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: report,
        message: 'Expense report created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[Expenses API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create expense report',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
