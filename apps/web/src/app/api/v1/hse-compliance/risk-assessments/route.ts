import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hseRiskService } from '@/lib/services/hse-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const min = url.searchParams.get('minResidualRisk');
    return ok(
      await hseRiskService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
        minResidualRisk: min ? Number(min) : undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list risk assessments', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      for (const f of ['title', 'category', 'likelihood', 'severity']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await hseRiskService.upsert(
          {
            ...body,
            nextReviewAt: body.nextReviewAt ? new Date(body.nextReviewAt) : undefined,
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'review') {
      if (!body.id) return badRequest('id required');
      return ok(await hseRiskService.review(body.id, auth), 'Reviewed');
    }
    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(await hseRiskService.close(body.id, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update risk assessment', err);
  }
});
