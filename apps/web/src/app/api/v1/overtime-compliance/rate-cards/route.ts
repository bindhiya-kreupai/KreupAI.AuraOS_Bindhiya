import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { otRateCardService } from '@/lib/services/overtime-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    return ok(await otRateCardService.listRateCards(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list rate cards', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'tenant:read', 'dashboard:read', 'overtime:manage'))
    return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'seed-defaults') {
      return ok(
        await otRateCardService.seedDefaults(
          { tenantId: ctx.user.tenantId, userId: ctx.user.id },
          body.effectiveFrom ? new Date(body.effectiveFrom) : undefined
        )
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update rate card', err);
  }
});
