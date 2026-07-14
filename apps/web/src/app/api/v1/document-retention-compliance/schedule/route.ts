import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { docRetentionScheduleService } from '@/lib/services/document-retention-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    return ok(await docRetentionScheduleService.list(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list schedule', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed-defaults') {
      return ok(
        await docRetentionScheduleService.seedDefaults(
          auth,
          body.countryCode,
          body.effectiveFrom ? new Date(body.effectiveFrom) : undefined
        )
      );
    }
    if (body.action === 'upsert') {
      return ok(await docRetentionScheduleService.upsert(body, auth));
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update schedule', err);
  }
});
