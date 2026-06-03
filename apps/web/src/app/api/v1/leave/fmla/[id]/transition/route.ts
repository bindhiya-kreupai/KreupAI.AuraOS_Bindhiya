import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  fmlaService,
  InvalidFMLATransitionError,
  type FMLAStatus,
} from '@/lib/services/fmla.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/leave/fmla/[id]/transition
 * Body: { to: FMLAStatus, noticeReference?, reason?, intermittent? }
 *
 * Drives the case state machine. `noticeReference` required (≥3 chars,
 * no placeholders) for NOTICE_SENT; `reason` required for DENIED.
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
        if (!context.permissions.includes('leave:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing leave:create' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        const to = body?.to as FMLAStatus;
        if (!to) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'to required' } },
            { status: 400 }
          );
        }

        let updated;
        switch (to) {
          case 'NOTICE_SENT':
            if (!body.noticeReference) {
              return NextResponse.json(
                {
                  success: false,
                  error: { code: 'E2001', message: 'noticeReference required for NOTICE_SENT' },
                },
                { status: 400 }
              );
            }
            updated = await fmlaService.issueNotice(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              String(body.noticeReference)
            );
            break;
          case 'CERTIFIED':
            updated = await fmlaService.recordCertification(
              context.params.id,
              context.user.tenantId,
              context.user.id
            );
            break;
          case 'APPROVED':
            updated = await fmlaService.approve(
              context.params.id,
              context.user.tenantId,
              context.user.id
            );
            break;
          case 'ACTIVE':
          case 'INTERMITTENT':
            updated = await fmlaService.activate(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              to === 'INTERMITTENT'
            );
            break;
          case 'DENIED':
            if (!body.reason) {
              return NextResponse.json(
                {
                  success: false,
                  error: { code: 'E2001', message: 'reason required for DENIED' },
                },
                { status: 400 }
              );
            }
            updated = await fmlaService.deny(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              String(body.reason)
            );
            break;
          case 'CANCELED':
            updated = await fmlaService.cancel(
              context.params.id,
              context.user.tenantId,
              context.user.id
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
            { success: false, error: { code: 'E4040', message: 'FMLA case not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: `→ ${to}` });
      } catch (error) {
        if (error instanceof InvalidFMLATransitionError) {
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
    action: AuditAction.LEAVE_REQUEST_APPROVED,
    resourceType: 'fmla_case',
    captureRequestBody: true,
  }
);
