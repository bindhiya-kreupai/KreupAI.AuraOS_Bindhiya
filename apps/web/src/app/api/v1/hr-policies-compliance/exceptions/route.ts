import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrPolicyExceptionService } from '@/lib/services/hr-policies-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hrPolicyExceptionService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
        policyId: url.searchParams.get('policyId') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list exceptions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      if (!body.policyId || !body.reason) return badRequest('policyId and reason required');
      return ok(
        await hrPolicyExceptionService.raise(
          { ...body, expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined },
          auth
        ),
        'Raised'
      );
    }
    if (body.action === 'approve') return ok(await hrPolicyExceptionService.approve(body.id, auth));
    if (body.action === 'reject') return ok(await hrPolicyExceptionService.reject(body.id, auth));
    if (body.action === 'close') return ok(await hrPolicyExceptionService.close(body.id, auth));
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update exception', err);
  }
});
