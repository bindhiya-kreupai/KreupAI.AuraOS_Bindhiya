import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { returnToWorkPlanService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await returnToWorkPlanService.list(ctx.user.tenantId, {
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list return-to-work plans', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'create') {
      if (!body.employeeId || !body.leaveCode || !body.expectedReturnDate) {
        return badRequest('employeeId/leaveCode/expectedReturnDate required');
      }
      return ok(
        await returnToWorkPlanService.create(
          {
            employeeId: body.employeeId,
            leaveCode: body.leaveCode,
            expectedReturnDate: new Date(body.expectedReturnDate),
            leaveCaseId: body.leaveCaseId,
            phasedReturnPct: body.phasedReturnPct,
            accommodations: body.accommodations,
          },
          auth
        ),
        'Created'
      );
    }
    if (body.action === 'confirm-return') {
      if (!body.id || !body.actualReturnDate) {
        return badRequest('id/actualReturnDate required');
      }
      return ok(
        await returnToWorkPlanService.confirmReturn(
          body.id,
          {
            actualReturnDate: new Date(body.actualReturnDate),
            fitnessClearance: body.fitnessClearance ?? false,
          },
          auth
        ),
        'Confirmed'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update RTW plan', err);
  }
});
