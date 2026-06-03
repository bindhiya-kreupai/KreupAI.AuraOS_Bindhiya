import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { fmlaService, EntitlementExceededError } from '@/lib/services/fmla.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/leave/fmla/[id]/usage
 * Body: { usageDate, hours, pattern? "CONTINUOUS"|"INTERMITTENT"|"REDUCED_SCHEDULE",
 *         leaveRequestId?, notes? }
 *
 * Records FMLA-counted absence. Auto-flips the case to EXHAUSTED when
 * remainingHours hits 0. Refuses to over-draw the entitlement (422 with
 * attempted/remaining in details).
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
        if (!body?.usageDate || typeof body?.hours !== 'number') {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'usageDate, hours required' } },
            { status: 400 }
          );
        }
        const result = await fmlaService.recordUsage({
          tenantId: context.user.tenantId,
          caseId: context.params.id,
          usageDate: new Date(body.usageDate),
          hours: Number(body.hours),
          pattern: body.pattern,
          leaveRequestId: body.leaveRequestId,
          notes: body.notes,
          actorId: context.user.id,
        });
        if (!result) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'FMLA case not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: result,
          message: result.case.status === 'EXHAUSTED' ? 'Entitlement exhausted' : 'Usage recorded',
        });
      } catch (error) {
        if (error instanceof EntitlementExceededError) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E4220',
                message: error.message,
                details: { attempted: error.attempted, remaining: error.remaining },
              },
            },
            { status: 422 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Record usage failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.LEAVE_REQUEST_CREATED,
    resourceType: 'fmla_usage',
    captureRequestBody: true,
  }
);
