import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/expenses/[id]/approve
 * Approve an expense report
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

    const report = await prisma.expenseReport.findFirst({
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
            message: `Cannot approve expense report with status: ${report.status}`,
          },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.expenseReport.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date(),
        approverNotes: body.notes || null,
        approvedAmount: body.approvedAmount || report.totalAmount,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Expense report approved successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Expense Approve API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to approve expense report' } },
      { status: 500 }
    );
  }
});
