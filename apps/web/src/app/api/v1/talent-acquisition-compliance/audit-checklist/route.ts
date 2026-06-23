import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { taAuditChecklistService } from '@/lib/services/talent-acquisition-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'ta_compliance:read', 'recruitment:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await taAuditChecklistService.list(ctx.user.tenantId, {
        stage: url.searchParams.get('stage') ?? undefined,
        category: url.searchParams.get('category') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list TA checklist', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'ta_compliance:manage', 'recruitment:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.itemCode || !body.label || !body.stage || !body.category)
        return badRequest('itemCode, label, stage, category required');
      return ok(await taAuditChecklistService.upsert(body, auth), 'Saved');
    }
    if (body.action === 'record') {
      if (!body.id || !body.result) return badRequest('id, result required');
      return ok(
        await taAuditChecklistService.record(body.id, body.result, body.notes, auth),
        'Recorded'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update TA checklist', err);
  }
});
