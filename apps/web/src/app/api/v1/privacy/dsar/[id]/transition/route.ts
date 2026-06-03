import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  dsarService,
  InvalidDSARTransitionError,
  type DSARStatus,
} from '@/lib/services/dsar.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/privacy/dsar/[id]/transition
 * Body: { to: DSARStatus, reason?, artifactUrl?, newDueBy? }
 *
 * Drives the DSAR state machine. EXTENDED requires reason (≥5 chars,
 * mirrors #85 placeholder-rejection contract). FULFILLED optionally
 * takes artifactUrl. REJECTED requires reason.
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
        if (!context.permissions.includes('privacy:approve')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing privacy:approve' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        const to = body?.to as DSARStatus;
        if (!to) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'to required' } },
            { status: 400 }
          );
        }

        let updated;
        switch (to) {
          case 'VERIFYING':
            updated = await dsarService.startVerification(
              context.params.id,
              context.user.tenantId,
              context.user.id
            );
            break;
          case 'IN_PROGRESS':
            updated = await dsarService.startWork(
              context.params.id,
              context.user.tenantId,
              context.user.id
            );
            break;
          case 'EXTENDED':
            updated = await dsarService.extend(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              String(body.reason ?? ''),
              body.newDueBy ? new Date(body.newDueBy) : undefined
            );
            break;
          case 'FULFILLED':
            updated = await dsarService.fulfill(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              body.artifactUrl
            );
            break;
          case 'REJECTED':
            updated = await dsarService.reject(
              context.params.id,
              context.user.tenantId,
              context.user.id,
              String(body.reason ?? '')
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
            { success: false, error: { code: 'E4040', message: 'DSAR not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: `→ ${to}` });
      } catch (error) {
        if (error instanceof InvalidDSARTransitionError) {
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
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'dsar_request', captureRequestBody: true }
);
