import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { emiratisationConfigService } from '@/lib/services/emiratisation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    return ok(await emiratisationConfigService.listTargets(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list targets', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    if (!body.year) return badRequest('year required');
    return ok(
      await emiratisationConfigService.setTarget(body, {
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
      }),
      'Target saved'
    );
  } catch (err) {
    return serverError('Failed to update target', err);
  }
});
