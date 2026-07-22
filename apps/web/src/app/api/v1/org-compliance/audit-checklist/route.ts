import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { orgAuditChecklistService } from '@/lib/services/org-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org_compliance:read', 'organization:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await orgAuditChecklistService.list(
        ctx.user.tenantId,
        {
          category: url.searchParams.get('category') ?? undefined,
          severity: url.searchParams.get('severity') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list checklist items', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'org_compliance:manage',
      'organization:manage',
      'tenant:read',
      'dashboard:read',
      'org:manage'
    )
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.itemCode || !body.label || !body.category)
        return badRequest('itemCode, label, category required');
      return ok(await orgAuditChecklistService.upsert(body, auth), 'Saved');
    }
    if (body.action === 'record') {
      if (!body.id || !body.result) return badRequest('id, result required');
      return ok(
        await orgAuditChecklistService.record(body.id, body.result, body.notes, auth),
        'Recorded'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update checklist', err);
  }
});
