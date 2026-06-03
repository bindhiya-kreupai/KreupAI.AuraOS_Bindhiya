import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  complianceTrainingService,
  InvalidEnrollmentTransitionError,
} from '@/lib/services/compliance-training.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/learning/compliance-training/[id]/complete
 * Mark a compliance training enrollment complete. expiresAt is auto-set
 * from the course's certificationValidMonths so the recurrence job can
 * re-trigger before the certificate lapses.
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
        if (!context.permissions.includes('learning/compliance-training:create')) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E4030',
                message: 'Forbidden: missing learning/compliance-training:create',
                messageAr: 'ممنوع',
              },
            },
            { status: 403 }
          );
        }
        const enrollmentId = context.params?.id;
        if (!enrollmentId) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Enrollment not found' } },
            { status: 404 }
          );
        }
        const body = await request.json().catch(() => ({}));
        const updated = await complianceTrainingService.recordCompletion({
          tenantId: context.user.tenantId,
          enrollmentId,
          actorId: context.user.id,
          score: body.score,
          certificateId: body.certificateId,
        });
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Enrollment not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Compliance training completed',
        });
      } catch (error) {
        if (error instanceof InvalidEnrollmentTransitionError) {
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
              message: 'Failed to mark complete',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.SETTINGS_UPDATED,
    resourceType: 'compliance_training_enrollment',
    captureRequestBody: true,
  }
);
