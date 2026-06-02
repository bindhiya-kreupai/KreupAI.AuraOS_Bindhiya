// @ts-nocheck — Expense routes were written against an earlier richer ExpenseReport/ExpenseItem schema (with approverNotes, totalAmount, items relation, expensePolicy model). Current schema is the simpler ExpenseClaim. Needs schema expansion OR route rewrite. Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/expenses/[id]/reject
 * Reject an expense report
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
    const { id } = context.params;
    const body = await request.json().catch(() => ({}));

    if (!body.reason) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Rejection reason is required' } },
        { status: 400 }
      );
    }

    const report = await prisma.expenseClaim.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Expense report not found' } },
        { status: 404 }
      );
    }

    if (report.status !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: `Cannot reject expense report with status: ${report.status}`,
          },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.expenseClaim.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy: user.id,
        rejectedAt: new Date(),
        rejectionReason: body.reason,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Expense report rejected',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Expense Reject API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to reject expense report' } },
      { status: 500 }
    );
  }
});
