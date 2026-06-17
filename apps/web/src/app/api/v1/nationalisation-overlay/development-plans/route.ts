import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { nationalisationDevelopmentPlanService } from '@/lib/services/nationalisation-overlay';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    if (action === 'stats') {
      const program = url.searchParams.get('program');
      if (!program) return badRequest('program required');
      return ok(await nationalisationDevelopmentPlanService.stats(ctx.user.tenantId, program));
    }
    return ok(
      await nationalisationDevelopmentPlanService.list(ctx.user.tenantId, {
        program: url.searchParams.get('program') ?? undefined,
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        status: (url.searchParams.get('status') as any) ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list development plans', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.employeeId || !body.program || !body.planCode || !body.label) {
        return badRequest('employeeId/program/planCode/label required');
      }
      return ok(
        await nationalisationDevelopmentPlanService.upsert(
          {
            employeeId: body.employeeId,
            program: body.program,
            planCode: body.planCode,
            label: body.label,
            targetCompetencies: body.targetCompetencies,
            milestones: body.milestones,
            startDate: body.startDate ? new Date(body.startDate) : undefined,
            targetEndDate: body.targetEndDate ? new Date(body.targetEndDate) : undefined,
            ownerRole: body.ownerRole,
            notes: body.notes,
          },
          auth
        ),
        'Plan saved'
      );
    }
    if (body.action === 'set-status') {
      if (!body.id || !body.status) return badRequest('id/status required');
      return ok(
        await nationalisationDevelopmentPlanService.setStatus(
          body.id,
          { status: body.status, completionPct: body.completionPct },
          auth
        ),
        'Status updated'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update development plan', err);
  }
});
