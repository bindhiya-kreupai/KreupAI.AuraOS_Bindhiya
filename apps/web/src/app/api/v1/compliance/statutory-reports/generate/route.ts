import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/compliance/statutory-reports/generate
 * Generate a specific statutory report
 */
export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    const { reportId, period, companyId, parameters } = body;

    if (!reportId || !companyId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'reportId and companyId are required' },
        },
        { status: 400 }
      );
    }

    const VALID_REPORT_IDS = [
      'wps-sif',
      'gosi-return',
      'india-pf-ecr',
      'india-esi-return',
      'india-tds-24q',
      'india-form16',
      'nitaqat-report',
    ];
    if (!VALID_REPORT_IDS.includes(reportId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: `Invalid reportId. Must be one of: ${VALID_REPORT_IDS.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    const generatedReport = {
      jobId: crypto.randomUUID(),
      reportId,
      companyId,
      period: period || new Date().toISOString().substring(0, 7),
      status: 'PROCESSING',
      estimatedCompletionTime: new Date(Date.now() + 30000).toISOString(),
      parameters: parameters || {},
      requestedBy: user.id,
      requestedAt: new Date().toISOString(),
      downloadUrl: null,
    };

    return NextResponse.json(
      {
        success: true,
        data: generatedReport,
        message: 'Report generation initiated. Check status using the jobId.',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('[Statutory Reports Generate API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to initiate report generation' } },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.PAYROLL_RUN_INITIATED,
  resourceType: 'statutory_report',
  captureRequestBody: true,
});
