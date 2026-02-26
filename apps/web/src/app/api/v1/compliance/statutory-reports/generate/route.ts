import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/compliance/statutory-reports/generate
 * Generate a specific statutory report
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
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

    // Simulate report generation (in production would trigger actual generation)
    const generatedReport = {
      jobId: crypto.randomUUID(),
      reportId,
      companyId,
      period: period || new Date().toISOString().substring(0, 7),
      status: 'PROCESSING',
      estimatedCompletionTime: new Date(Date.now() + 30000).toISOString(), // 30 seconds
      parameters: parameters || {},
      requestedBy: user.id,
      requestedAt: new Date().toISOString(),
      downloadUrl: null, // Will be available after processing
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
  } catch (_error) {
    console.error('[Statutory Reports Generate API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to initiate report generation' } },
      { status: 500 }
    );
  }
});
