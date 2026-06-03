import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  benefitsClaimService,
  InvalidClaimTransitionError,
  ApprovedExceedsClaimError,
} from '@/lib/services/benefits-claim.service';

export const dynamic = 'force-dynamic';

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
        if (!context.permissions.includes('benefits/claims:update')) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E4030', message: 'missing benefits/claims:update' },
            },
            { status: 403 }
          );
        }
        const body = await request.json();
        const action = body?.action as
          | 'startReview'
          | 'requestInfo'
          | 'approve'
          | 'markPaid'
          | 'reject'
          | undefined;
        let updated;
        switch (action) {
          case 'startReview':
            updated = await benefitsClaimService.startReview(
              context.params.id,
              context.user.tenantId,
              context.user.id
            );
            break;
          case 'requestInfo':
            if (!body.note || String(body.note).trim().length < 5) {
              return NextResponse.json(
                {
                  success: false,
                  error: { code: 'E2002', message: 'note ≥ 5 chars required' },
                },
                { status: 400 }
              );
            }
            updated = await benefitsClaimService.requestInfo(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              body.note
            );
            break;
          case 'approve':
            if (body.approvedAmount === undefined) {
              return NextResponse.json(
                {
                  success: false,
                  error: { code: 'E2001', message: 'approvedAmount required' },
                },
                { status: 400 }
              );
            }
            updated = await benefitsClaimService.approve(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              {
                approvedAmount: Number(body.approvedAmount),
                deductibleApplied: body.deductibleApplied,
                coinsuranceApplied: body.coinsuranceApplied,
                copayApplied: body.copayApplied,
              }
            );
            break;
          case 'markPaid':
            if (!body.paymentMethod) {
              return NextResponse.json(
                {
                  success: false,
                  error: { code: 'E2001', message: 'paymentMethod required' },
                },
                { status: 400 }
              );
            }
            updated = await benefitsClaimService.markPaid(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              { paymentMethod: body.paymentMethod, checkNumber: body.checkNumber }
            );
            break;
          case 'reject':
            if (!body.reason || String(body.reason).trim().length < 5) {
              return NextResponse.json(
                {
                  success: false,
                  error: { code: 'E2002', message: 'reason ≥ 5 chars required' },
                },
                { status: 400 }
              );
            }
            updated = await benefitsClaimService.reject(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              body.reason
            );
            break;
          default:
            return NextResponse.json(
              { success: false, error: { code: 'E2001', message: `unknown action ${action}` } },
              { status: 400 }
            );
        }
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Claim not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated });
      } catch (error) {
        if (error instanceof InvalidClaimTransitionError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4090', message: error.message } },
            { status: 409 }
          );
        }
        if (error instanceof ApprovedExceedsClaimError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4220', message: error.message } },
            { status: 422 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to transition claim',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'benefit_claim', captureRequestBody: true }
);
