import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  labourMinistrySubmissionService,
  InvalidSubmissionTransitionError,
  type SubmissionStatus,
} from '@/lib/services/labour-ministry-submission.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/compliance/ministry-submissions/[id]/transition
 * Body: { to, authorityRef?, fileUrl?, reason? }
 *
 * SUBMITTED requires authorityRef (≥3 chars). RESUBMITTED requires
 * newAuthorityRef. REJECTED requires reason.
 */
export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params: { id: string };
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
        const body = await request.json();
        const to = body?.to as SubmissionStatus;
        if (!to) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'to required' } },
            { status: 400 }
          );
        }

        let updated;
        switch (to) {
          case 'READY':
            updated = await labourMinistrySubmissionService.markReady(
              context.params.id,
              context.user.tenantId,
              context.user.id
            );
            break;
          case 'SUBMITTED':
            updated = await labourMinistrySubmissionService.markSubmitted(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              String(body.authorityRef ?? ''),
              body.fileUrl
            );
            break;
          case 'ACKNOWLEDGED':
            updated = await labourMinistrySubmissionService.markAcknowledged(
              context.params.id,
              context.user.tenantId,
              context.user.id
            );
            break;
          case 'REJECTED':
            updated = await labourMinistrySubmissionService.reject(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              String(body.reason ?? '')
            );
            break;
          case 'RESUBMITTED':
            updated = await labourMinistrySubmissionService.resubmit(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              String(body.authorityRef ?? '')
            );
            break;
          default:
            return NextResponse.json(
              {
                success: false,
                error: { code: 'E2001', message: `Unsupported transition to ${to}` },
              },
              { status: 400 }
            );
        }

        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Submission not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: `→ ${to}` });
      } catch (error) {
        if (error instanceof InvalidSubmissionTransitionError) {
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
              message: 'Transition failed',
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
    resourceType: 'labour_ministry_submission',
    captureRequestBody: true,
  }
);
