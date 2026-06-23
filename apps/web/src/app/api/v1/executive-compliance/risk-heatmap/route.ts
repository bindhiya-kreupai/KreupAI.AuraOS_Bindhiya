import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceRiskService } from '@/lib/services/executive-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await complianceRiskService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          domain: url.searchParams.get('domain') ?? undefined,
          band: url.searchParams.get('band') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list risks', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      for (const f of ['title', 'domain', 'likelihood', 'impact']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await complianceRiskService.upsert(
          { ...body, nextReviewAt: body.nextReviewAt ? new Date(body.nextReviewAt) : undefined },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(await complianceRiskService.close(body.id, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update risk', err);
  }
});
