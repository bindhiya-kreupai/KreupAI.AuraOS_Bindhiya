import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { emiratisationFineService } from '@/lib/services/emiratisation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'risk_register:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await emiratisationFineService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
        year: url.searchParams.get('year') ? Number(url.searchParams.get('year')) : undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list fines', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise-projected') {
      if (!body.year || !body.checkpoint) return badRequest('year/checkpoint required');
      return ok(await emiratisationFineService.raiseProjected(body, auth), 'Projected');
    }
    if (body.action === 'mark-incurred') {
      if (!body.fineId) return badRequest('fineId required');
      return ok(await emiratisationFineService.markIncurred(body.fineId), 'Incurred');
    }
    if (body.action === 'resolve') {
      if (!body.fineId) return badRequest('fineId required');
      return ok(await emiratisationFineService.resolve(body.fineId), 'Resolved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update fine', err);
  }
});
