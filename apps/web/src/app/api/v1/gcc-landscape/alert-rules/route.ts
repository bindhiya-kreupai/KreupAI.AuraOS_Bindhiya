import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { platformAlertService } from '@/lib/services/gcc-landscape';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'audit:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const eventType = url.searchParams.get('eventType') ?? undefined;
    const isActiveParam = url.searchParams.get('isActive');
    const isActive = isActiveParam == null ? undefined : isActiveParam === 'true';
    return ok(await platformAlertService.listRules(ctx.user.tenantId, { eventType, isActive }));
  } catch (err) {
    return serverError('Failed to list alert rules', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'seed-default-ladders') {
      return ok(
        await platformAlertService.seedDefaultLadders({
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
        }),
        'Default alert ladders seeded'
      );
    }
    for (const field of ['code', 'name', 'eventType', 'thresholds']) {
      if (body[field] == null) return badRequest(`${field} is required`);
    }
    const data = await platformAlertService.upsertRule(body, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok(data, 'Alert rule saved');
  } catch (err) {
    return serverError('Failed to save alert rule', err);
  }
});
