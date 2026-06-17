import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { executiveRollupService } from '@/lib/services/executive-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const period =
      url.searchParams.get('period') ??
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    return ok(await executiveRollupService.snapshot(ctx.user.tenantId, period));
  } catch (err) {
    return serverError('Failed to load rollup', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'compliance_kpi:manage')) return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'persist') {
      if (!body.period) return badRequest('period required');
      return ok(
        await executiveRollupService.persist(ctx.user.tenantId, body.period, {
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
        })
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to persist rollup', err);
  }
});
