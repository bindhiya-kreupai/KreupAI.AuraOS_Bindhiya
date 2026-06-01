import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/expenses/[id]/submit
 * Submit an expense report for approval
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

    const report = await prisma.expenseReport.findFirst({
      where: { id, tenantId: user.tenantId },
      include: { items: true },
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
            message: `Cannot submit expense report with status: ${report.status}`,
          },
        },
        { status: 422 }
      );
    }

    if (report.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4003', message: 'Cannot submit an expense report with no items' },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.expenseReport.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
        submittedAt: new Date(),
        submittedBy: user.id,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Expense report submitted for approval',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Expense Submit API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to submit expense report' } },
      { status: 500 }
    );
  }
});
