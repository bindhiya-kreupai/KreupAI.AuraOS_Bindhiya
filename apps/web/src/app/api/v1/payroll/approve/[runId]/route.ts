import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

/**
 * POST /api/v1/payroll/approve/:runId
 * Approve a calculated payroll run — transitions CALCULATED → APPROVED
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
      const { runId } = context.params;
      const body = await request.json().catch(() => ({}));

      const run = await prisma.payrollRun.findFirst({
        where: { id: runId, tenantId: user.tenantId, isDeleted: false },
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

      if (run.status !== 'CALCULATED' && run.status !== 'PENDING_APPROVAL') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4003',
              message: `Cannot approve payroll run with status: ${run.status}. Must be CALCULATED or PENDING_APPROVAL.`,
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

      // Transition to APPROVED
      // tenant-ok: id-based op preceded by tenant-scoped findFirst above
      const updated = await prisma.payrollRun.update({
        where: { id: runId },
        data: {
          status: 'APPROVED',
          approvedBy: user.userId,
          approvedAt: new Date(),
          approvalLevel: (run.approvalLevel || 0) + 1,
          notes: body.approverComments
            ? `${run.notes || ''}\n[APPROVED] ${body.approverComments}`.trim()
            : run.notes,
        },
      });

      // Update all calculated payslips to APPROVED
      // tenant-ok: id-based op preceded by tenant-scoped findFirst above
      await prisma.payslip.updateMany({
        where: { payrollRunId: runId, status: 'CALCULATED' },
        data: { status: 'APPROVED' },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          status: updated.status,
          payrollMonth: updated.payrollMonth,
          approvedBy: updated.approvedBy,
          approvedAt: updated.approvedAt?.toISOString(),
          approvalLevel: updated.approvalLevel,
          payslipCount: run._count.payslips,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error: any) {
      console.error('[Payroll Approve API] POST Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to approve payroll',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
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
    captureRequestBody: true,
    extractResourceId: (req: any, ctx: any) => ctx?.params?.runId,
  }
);
