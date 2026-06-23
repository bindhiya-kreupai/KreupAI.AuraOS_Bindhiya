import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationComplaintService } from '@/lib/services/accommodation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await accommodationComplaintService.list(
        ctx.user.tenantId,
        {
          siteId: url.searchParams.get('siteId') ?? undefined,
          status: url.searchParams.get('status') ?? undefined,
          severity: url.searchParams.get('severity') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list complaints', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const f of ['siteId', 'category', 'subject']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await accommodationComplaintService.raise(body, auth), 'Raised');
    }
    if (body.action === 'assign') {
      if (!body.id || !body.assigneeId) return badRequest('id and assigneeId required');
      return ok(
        await accommodationComplaintService.assign(body.id, body.assigneeId, auth),
        'Assigned'
      );
    }
    if (body.action === 'resolve') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationComplaintService.resolve(body.id, body.notes, auth), 'Resolved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update complaint', err);
  }
});
