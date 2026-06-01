// @ts-nocheck — Expense routes were written against an earlier richer ExpenseReport/ExpenseItem schema (with approverNotes, totalAmount, items relation, expensePolicy model). Current schema is the simpler ExpenseClaim. Needs schema expansion OR route rewrite. Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/expenses/[id]
 * Get a specific expense report
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
    const { id } = context.params;

    const report = await prisma.expenseClaim.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        items: { orderBy: { expenseDate: 'asc' } },
      },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Expense report not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Expense Detail API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch expense report' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/expenses/[id]
 * Update an expense report
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('expenses:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing expenses:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;
    const body = await request.json();

    const report = await prisma.expenseClaim.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Expense report not found' } },
        { status: 404 }
      );
    }

    if (!['DRAFT', 'RETURNED'].includes(report.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: 'Only draft or returned expense reports can be updated',
          },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.expenseClaim.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        totalAmount: body.totalAmount,
        currency: body.currency,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Expense Detail API] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update expense report' } },
      { status: 500 }
    );
  }
});
