import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { immigrationAuditChecklistService } from '@/lib/services/immigration-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:read', 'immigration:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await immigrationAuditChecklistService.list(ctx.user.tenantId, {
        category: url.searchParams.get('category') ?? undefined,
        country: url.searchParams.get('country') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list checklist', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:manage', 'immigration:manage'))
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.itemCode || !body.label || !body.category)
        return badRequest('itemCode, label, category required');
      return ok(await immigrationAuditChecklistService.upsert(body, auth), 'Saved');
    }
    if (body.action === 'record') {
      if (!body.id || !body.result) return badRequest('id, result required');
      return ok(
        await immigrationAuditChecklistService.record(body.id, body.result, body.notes, auth),
        'Recorded'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update checklist', err);
  }
});
