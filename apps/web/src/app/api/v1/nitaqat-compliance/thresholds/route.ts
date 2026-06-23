import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { nitaqatConfigService } from '@/lib/services/nitaqat-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    return ok(await nitaqatConfigService.listThresholds(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list thresholds', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'seed-defaults') {
      return ok(
        await nitaqatConfigService.seedDefaultThresholds(
          { tenantId: ctx.user.tenantId, userId: ctx.user.id },
          body.effectiveFrom ? new Date(body.effectiveFrom) : undefined
        )
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update thresholds', err);
  }
});
