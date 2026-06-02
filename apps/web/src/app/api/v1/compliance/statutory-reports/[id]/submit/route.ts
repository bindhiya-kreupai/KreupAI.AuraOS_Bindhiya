import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  statutoryReportService,
  InvalidReportTransitionError,
} from '@/lib/services/statutory-report.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/compliance/statutory-reports/[id]/submit
 * Body: { submissionReference: string, fileUrl?: string }
 *
 * Marks a generated report as SUBMITTED. The submissionReference must be a
 * real authority-issued reference — placeholders are rejected. Closes the
 * "WPS MoHRE submission uses fake reference numbers" gap (#85).
 */
export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params?: { id?: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('compliance:reports:submit')) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E4030', message: 'missing compliance:reports:submit' },
            },
            { status: 403 }
          );
        }
        const id = context.params?.id;
        if (!id) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Report not found' } },
            { status: 404 }
          );
        }
        const body = await request.json().catch(() => ({}));
        if (!body?.submissionReference) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'submissionReference required' } },
            { status: 400 }
          );
        }
        const updated = await statutoryReportService.markSubmitted(
          id,
          context.user.tenantId,
          context.user.id,
          String(body.submissionReference),
          body.fileUrl
        );
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Report not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: 'Submitted' });
      } catch (error) {
        if (error instanceof InvalidReportTransitionError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4090', message: error.message } },
            { status: 409 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Submit failed',
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
