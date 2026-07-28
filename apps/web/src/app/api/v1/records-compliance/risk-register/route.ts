import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { recordsRiskService } from '@/lib/services/records-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'records_compliance:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await recordsRiskService.list(
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
    return serverError('Failed to list records risks', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'records_compliance:manage', 'employee:manage')) return forbidden();
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
      return ok(await recordsRiskService.upsert(body, auth), 'Saved');
    }
    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(await recordsRiskService.close(body.id, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update records risk', err);
  }
});

export const DELETE = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'records_compliance:manage', 'employee:manage')) return forbidden();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return badRequest('id required');
    await recordsRiskService.delete(id, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok({ id }, 'Deleted');
  } catch (err) {
    return serverError('Failed to delete records risk', err);
  }
});
