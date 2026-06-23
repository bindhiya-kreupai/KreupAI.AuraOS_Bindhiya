import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { immigrationRiskService } from '@/lib/services/immigration-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:read', 'immigration:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await immigrationRiskService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          band: url.searchParams.get('band') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list immigration risks', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:manage', 'immigration:manage'))
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (
        !body.riskCode ||
        !body.title ||
        !body.category ||
        body.likelihood == null ||
        body.impact == null
      )
        return badRequest('riskCode, title, category, likelihood, impact required');
      return ok(await immigrationRiskService.upsert(body, auth), 'Saved');
    }
    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(await immigrationRiskService.close(body.id, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update immigration risk', err);
  }
});
