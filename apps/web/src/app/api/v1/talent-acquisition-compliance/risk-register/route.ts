import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { taRiskService } from '@/lib/services/talent-acquisition-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'ta_compliance:read', 'recruitment:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await taRiskService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          band: url.searchParams.get('band') ?? undefined,
          stage: url.searchParams.get('stage') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list TA risks', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'ta_compliance:manage', 'recruitment:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (
        !body.riskCode ||
        !body.title ||
        !body.stage ||
        !body.category ||
        body.likelihood == null ||
        body.impact == null
      )
        return badRequest('riskCode, title, stage, category, likelihood, impact required');
      return ok(await taRiskService.upsert(body, auth), 'Saved');
    }
    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(await taRiskService.close(body.id, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update TA risk', err);
  }
});
