import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrPolicyService } from '@/lib/services/hr-policies-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hrPolicyService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list policies', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'publish') {
      if (!body.policyId) return badRequest('policyId required');
      return ok(
        await hrPolicyService.publish(
          { policyId: body.policyId, intervalMonths: body.intervalMonths },
          auth
        ),
        'Published'
      );
    }
    if (body.action === 'archive') {
      if (!body.policyId) return badRequest('policyId required');
      return ok(await hrPolicyService.archive(body.policyId, auth), 'Archived');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update policy', err);
  }
});
