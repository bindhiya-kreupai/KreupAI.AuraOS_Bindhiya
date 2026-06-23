import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrFormRoutingService } from '@/lib/services/hr-forms-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hrFormRoutingService.list(
        ctx.user.tenantId,
        url.searchParams.get('templateId') ?? undefined
      )
    );
  } catch (err) {
    return serverError('Failed to list routings', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert-stage') {
      for (const f of ['templateId', 'stageOrder', 'stageLabel']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(await hrFormRoutingService.upsertStage(body, auth), 'Saved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update routing', err);
  }
});
