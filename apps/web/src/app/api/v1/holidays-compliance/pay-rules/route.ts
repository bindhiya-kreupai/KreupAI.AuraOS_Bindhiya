import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { holidayPayRuleService } from '@/lib/services/holidays-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await holidayPayRuleService.list(ctx.user.tenantId, {
        country: url.searchParams.get('country') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list pay rules', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed-defaults') {
      return ok(
        await holidayPayRuleService.seedDefaults(
          auth,
          body.effectiveFrom ? new Date(body.effectiveFrom) : undefined
        )
      );
    }
    if (body.action === 'upsert') {
      for (const f of ['country', 'holidayClass', 'effectiveFrom']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await holidayPayRuleService.upsert(
          { ...body, effectiveFrom: new Date(body.effectiveFrom) },
          auth
        ),
        'Saved'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update pay rule', err);
  }
});
