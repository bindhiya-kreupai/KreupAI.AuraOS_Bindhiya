import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hseTrainingService } from '@/lib/services/hse-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const within = url.searchParams.get('expiringSoonDays');
    return ok(
      await hseTrainingService.list(ctx.user.tenantId, {
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        expiringSoonDays: within ? Number(within) : undefined,
        expiredOnly: url.searchParams.get('expiredOnly') === 'true',
      })
    );
  } catch (err) {
    return serverError('Failed to list training', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'record') {
      for (const f of ['employeeId', 'trainingCode', 'trainingType', 'completedAt']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await hseTrainingService.record({ ...body, completedAt: new Date(body.completedAt) }, auth),
        'Recorded'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update training', err);
  }
});
