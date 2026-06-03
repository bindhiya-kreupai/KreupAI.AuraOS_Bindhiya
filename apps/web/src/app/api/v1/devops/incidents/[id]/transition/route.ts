import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  incidentService,
  InvalidIncidentTransitionError,
  PostmortemRequiredError,
} from '@/lib/services/incident.service';

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
        if (!context.permissions.includes('devops:update')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing devops:update' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        const action = body?.action as
          | 'acknowledge'
          | 'mitigate'
          | 'resolve'
          | 'publishPostmortem'
          | undefined;
        const platformWide = body?.platformWide === true;
        const tenantId = platformWide ? null : context.user.tenantId;
        let updated;
        switch (action) {
          case 'acknowledge':
            updated = await incidentService.acknowledge(
              context.params.id,
              tenantId,
              context.user.id
            );
            break;
          case 'mitigate':
            updated = await incidentService.mitigate(
              context.params.id,
              tenantId,
              context.user.id,
              body.notes
            );
            break;
          case 'resolve':
            updated = await incidentService.resolve(
              context.params.id,
              tenantId,
              context.user.id,
              body.rootCause
            );
            break;
          case 'publishPostmortem':
            if (!body.postmortemUrl) {
              return NextResponse.json(
                {
                  success: false,
                  error: { code: 'E2001', message: 'postmortemUrl required' },
                },
                { status: 400 }
              );
            }
            updated = await incidentService.publishPostmortem(
              context.params.id,
              tenantId,
              context.user.id,
              body.postmortemUrl
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
            { success: false, error: { code: 'E4040', message: 'Incident not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated });
      } catch (error) {
        if (error instanceof InvalidIncidentTransitionError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4090', message: error.message } },
            { status: 409 }
          );
        }
        if (error instanceof PostmortemRequiredError) {
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
              message: 'Failed to transition incident',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.SETTINGS_UPDATED, resourceType: 'incident', captureRequestBody: true }
);
