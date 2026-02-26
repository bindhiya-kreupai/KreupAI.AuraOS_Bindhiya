import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/payroll/runs/[id]/finalize
 * Finalize a payroll run (lock it for payment processing)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { id } = context.params;
    const body = await request.json().catch(() => ({}));

    const run = await prisma.payrollRun.findFirst({
      where: { id, tenantId: user.tenantId },
      include: { _count: { select: { payslips: true } } },
    });

    if (!run) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Payroll run not found' } },
        { status: 404 }
      );
    }

    if (run.status !== 'CALCULATED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: `Only calculated payroll runs can be finalized. Current status: ${run.status}`,
          },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'FINALIZED',
        finalizedBy: user.id,
        finalizedAt: new Date(),
        notes: body.notes ? `${run.notes || ''}\n[FINALIZED] ${body.notes}`.trim() : run.notes,
      },
    });

    // Update all calculated payslips to FINALIZED
    await prisma.payslip.updateMany({
      where: { payrollRunId: id, status: 'CALCULATED' },
      data: { status: 'FINALIZED' },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Payroll run finalized successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Payroll Finalize API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to finalize payroll run' } },
      { status: 500 }
    );
  }
});
