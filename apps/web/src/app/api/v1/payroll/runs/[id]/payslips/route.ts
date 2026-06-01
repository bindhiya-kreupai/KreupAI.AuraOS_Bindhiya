import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/payroll/runs/[id]/payslips
 * Get all payslips for a specific payroll run
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('payroll:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing payroll:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const skip = (page - 1) * limit;
    const employeeId = searchParams.get('employeeId') || undefined;
    const status = searchParams.get('status') || undefined;

    // Verify the payroll run exists and belongs to this tenant
    const run = await prisma.payrollRun.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!run) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Payroll run not found' } },
        { status: 404 }
      );
    }

    const where: Record<string, unknown> = { payrollRunId: id };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
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
      prisma.payslip.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: payslips,
      meta: {
        payrollRunId: id,
        payrollMonth: run.payrollMonth,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Payroll Run Payslips API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch payslips' } },
      { status: 500 }
    );
  }
});
