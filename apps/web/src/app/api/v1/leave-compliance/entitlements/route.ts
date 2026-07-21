import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { leaveEntitlementService } from '@/lib/services/leave-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await leaveEntitlementService.list(ctx.user.tenantId, {
        country: url.searchParams.get('country') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list entitlements', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'tenant:manage',
      'tenant:read',
      'dashboard:read',
      'leave:manage',
      'compliance:manage'
    )
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed-defaults') {
      return ok(
        await leaveEntitlementService.seedDefaults(
          auth,
          body.effectiveFrom ? new Date(body.effectiveFrom) : undefined
        )
      );
    }
    if (body.action === 'upsert') {
      for (const f of ['country', 'leaveCode', 'annualDays', 'effectiveFrom']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await leaveEntitlementService.upsert(
          { ...body, effectiveFrom: new Date(body.effectiveFrom) },
          auth
        ),
        'Saved'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update entitlement', err);
  }
});
