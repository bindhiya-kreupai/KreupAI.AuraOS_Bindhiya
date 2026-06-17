import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { otPolicyService } from '@/lib/services/overtime-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    return ok(await otPolicyService.listPolicies(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list policies', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    for (const f of ['country', 'effectiveFrom']) {
      if (!body[f]) return badRequest(`${f} required`);
    }
    return ok(
      await otPolicyService.upsertPolicy(
        { ...body, effectiveFrom: new Date(body.effectiveFrom) },
        { tenantId: ctx.user.tenantId, userId: ctx.user.id }
      ),
      'Policy saved'
    );
  } catch (err) {
    return serverError('Failed to upsert policy', err);
  }
});
