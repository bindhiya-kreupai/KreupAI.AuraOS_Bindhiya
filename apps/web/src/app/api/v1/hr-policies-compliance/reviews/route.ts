import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrPolicyReviewService } from '@/lib/services/hr-policies-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hrPolicyReviewService.list(
        ctx.user.tenantId,
        {
          overdueOnly: url.searchParams.get('overdueOnly') === 'true',
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list reviews', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'complete') {
      if (!body.policyId || !body.outcome) return badRequest('policyId and outcome required');
      return ok(
        await hrPolicyReviewService.complete(
          { policyId: body.policyId, outcome: body.outcome, notes: body.notes },
          auth
        ),
        'Reviewed'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update review', err);
  }
});
