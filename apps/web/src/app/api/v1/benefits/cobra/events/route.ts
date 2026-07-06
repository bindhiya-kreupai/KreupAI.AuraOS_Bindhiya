import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@/lib/database';
import { cobraService, type QualifyingEventType } from '@/lib/services/cobra.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/benefits/cobra/events
 * POST /api/v1/benefits/cobra/events
 *
 * Tenant-scoped COBRA qualifying-event registry. Each event opens a 60-day
 * election window and a coverage cap (18 or 36 months depending on event type).
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('benefits/cobra:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing benefits/cobra:read' } },
        { status: 403 }
      );
    }
    try {
      const url = new URL(request.url);
      const employeeId = url.searchParams.get('employeeId') ?? undefined;
      const events = await (prisma as any).cobraQualifyingEvent.findMany({
        where: { tenantId: context.user.tenantId, isDeleted: false, employeeId },
        orderBy: { qualifyingDate: 'desc' },
        include: { enrollments: true },
      });
      return NextResponse.json({ success: true, items: events, total: events.length });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to list COBRA events',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { id: string; tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('benefits/cobra:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing benefits/cobra:create' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        if (!body?.employeeId || !body?.eventType || !body?.qualifyingDate) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'employeeId, eventType, qualifyingDate required' },
            },
            { status: 400 }
          );
        }
        const created = await cobraService.createQualifyingEvent({
          tenantId: context.user.tenantId,
          employeeId: body.employeeId,
          eventType: body.eventType as QualifyingEventType,
          qualifyingDate: new Date(body.qualifyingDate),
          exitRequestId: body.exitRequestId,
          notes: body.notes,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Qualifying event recorded' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to create COBRA event',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.EMPLOYEE_TERMINATED,
    resourceType: 'cobra_qualifying_event',
    captureRequestBody: true,
  }
);
