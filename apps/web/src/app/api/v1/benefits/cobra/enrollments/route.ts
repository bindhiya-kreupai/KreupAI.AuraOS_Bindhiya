import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@/lib/database';
import { cobraService } from '@/lib/services/cobra.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('benefits/cobra:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing benefits/cobra:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? undefined;
    const employeeId = url.searchParams.get('employeeId') ?? undefined;
    const items = await prisma.cobraEnrollment.findMany({
      where: { tenantId: context.user.tenantId, status, employeeId },
      orderBy: { createdAt: 'desc' },
      include: { qualifyingEvent: true },
    });
    return NextResponse.json({ success: true, items, total: items.length });
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
        if (!body?.qualifyingEventId || !body?.benefitPlanId) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E2001', message: 'qualifyingEventId, benefitPlanId required' },
            },
            { status: 400 }
          );
        }
        const enrollment = await cobraService.openEnrollment({
          tenantId: context.user.tenantId,
          qualifyingEventId: body.qualifyingEventId,
          benefitPlanId: body.benefitPlanId,
          actorId: context.user.id,
        });
        if (!enrollment) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E4040', message: 'Qualifying event or plan not found' },
            },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { success: true, data: enrollment, message: 'Enrollment opened' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Open enrollment failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'cobra_enrollment',
    captureRequestBody: true,
  }
);
