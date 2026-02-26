import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/payroll/runs/[id]
 * Get a specific payroll run by ID
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { id } = context.params;

    const run = await prisma.payrollRun.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        _count: { select: { payslips: true } },
      },
    });

    if (!run) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Payroll run not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: run,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Payroll Run API] GET/:id Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch payroll run' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/payroll/runs/[id]
 * Update a payroll run
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { id } = context.params;
    const body = await request.json();

    const run = await prisma.payrollRun.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!run) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Payroll run not found' } },
        { status: 404 }
      );
    }

    if (['FINALIZED', 'PAID'].includes(run.status)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4003', message: 'Finalized or paid payroll runs cannot be modified' },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        notes: body.notes,
        currency: body.currency,
        updatedBy: user.id,
        updatedAt: new Date(),
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
  } catch (_error) {
    console.error('[Payroll Run API] PUT/:id Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update payroll run' } },
      { status: 500 }
    );
  }
});
