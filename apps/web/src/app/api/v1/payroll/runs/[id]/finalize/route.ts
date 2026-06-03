import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/payroll/runs/[id]/finalize
 * Finalize an approved payroll run — transitions APPROVED → PAID and locks against mutation
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('payroll:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing payroll:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = context.params;
      const body = await request.json().catch(() => ({}));

      const run = await prisma.payrollRun.findFirst({
        where: { id, tenantId: user.tenantId, isDeleted: false },
        include: { _count: { select: { payslips: true } } },
      });

      if (!run) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E4001', message: 'Payroll run not found' },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 404 }
        );
      }

      if (run.status !== 'APPROVED') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4003',
              message: `Only approved payroll runs can be finalized. Current status: ${run.status}`,
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 422 }
        );
      }

      // Finalize: transition APPROVED → PAID
      // tenant-ok: id-based op preceded by tenant-scoped findFirst above
      const updated = await prisma.payrollRun.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          notes: body.notes ? `${run.notes || ''}\n[FINALIZED] ${body.notes}`.trim() : run.notes,
        },
      });

      // Update all approved payslips to PAID
      // tenant-ok: id-based op preceded by tenant-scoped findFirst above
      await prisma.payslip.updateMany({
        where: { payrollRunId: id, status: 'APPROVED' },
        data: { status: 'PAID' },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          status: updated.status,
          payrollMonth: updated.payrollMonth,
          paidAt: updated.paidAt?.toISOString(),
          payslipCount: run._count.payslips,
        },
        message: 'Payroll run finalized and marked as paid',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error: any) {
      console.error('[Payroll Finalize API] POST Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E5001', message: 'Failed to finalize payroll run' },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.PAYROLL_RUN_APPROVED,
    resourceType: 'payroll_run',
    extractResourceId: (req: any, ctx: any) => ctx?.params?.id,
  }
);
