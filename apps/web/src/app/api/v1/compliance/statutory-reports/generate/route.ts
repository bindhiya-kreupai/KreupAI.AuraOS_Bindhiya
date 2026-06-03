import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { statutoryReportService } from '@/lib/services/statutory-report.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/compliance/statutory-reports/generate
 * Body: { code, periodStart, periodEnd }
 * Invokes the registered generator and persists a StatutoryReport row.
 */
export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { id: string; tenantId: string }; permissions: string[] }
    ) => {
      try {
        const { user, permissions } = context;
        if (!permissions.includes('compliance:reports:generate')) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E4030', message: 'missing compliance:reports:generate' },
            },
            { status: 403 }
          );
        }
        const body = await request.json().catch(() => null);
        if (!body?.code || !body?.periodStart || !body?.periodEnd) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'code, periodStart, periodEnd required' },
            },
            { status: 400 }
          );
        }
        const result = await statutoryReportService.generate(body.code, {
          tenantId: user.tenantId,
          periodStart: new Date(body.periodStart),
          periodEnd: new Date(body.periodEnd),
          generatedById: user.id,
        });
        const status = result.record.status === 'FAILED' ? 207 : 201;
        return NextResponse.json({ success: true, data: result }, { status });
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Statutory report generation failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.REPORT_GENERATED,
    resourceType: 'statutory_report',
    captureRequestBody: true,
  }
);
