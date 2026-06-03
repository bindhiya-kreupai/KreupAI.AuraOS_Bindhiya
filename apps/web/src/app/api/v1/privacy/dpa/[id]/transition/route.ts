import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  dpaService,
  InvalidDPATransitionError,
  MissingTransferMechanismError,
} from '@/lib/services/dpa.service';

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
        if (!context.permissions.includes('privacy:update')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing privacy:update' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        const action = body?.action as 'activate' | 'expire' | 'terminate' | 'review' | undefined;
        if (!action) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'action is required' } },
            { status: 400 }
          );
        }
        let updated;
        switch (action) {
          case 'activate':
            updated = await dpaService.activate(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              body.signedAt ? new Date(body.signedAt) : undefined
            );
            break;
          case 'expire':
            updated = await dpaService.expire(
              context.params.id,
              context.user.tenantId,
              context.user.id
            );
            break;
          case 'terminate':
            if (!body.reason || String(body.reason).trim().length < 5) {
              return NextResponse.json(
                {
                  success: false,
                  error: {
                    code: 'E2002',
                    message: 'termination reason ≥ 5 chars required',
                  },
                },
                { status: 400 }
              );
            }
            updated = await dpaService.terminate(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              body.reason
            );
            break;
          case 'review':
            updated = await dpaService.recordReview(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              body.notes
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
            { success: false, error: { code: 'E4040', message: 'DPA not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated });
      } catch (error) {
        if (error instanceof InvalidDPATransitionError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4090', message: error.message } },
            { status: 409 }
          );
        }
        if (error instanceof MissingTransferMechanismError) {
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
              message: 'Failed to transition DPA',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'dpa', captureRequestBody: true }
);
