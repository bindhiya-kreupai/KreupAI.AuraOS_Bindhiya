import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationInspectionService } from '@/lib/services/accommodation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await accommodationInspectionService.list(ctx.user.tenantId, {
        siteId: url.searchParams.get('siteId') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list inspections', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'record') {
      for (const f of ['siteId', 'inspectionDate', 'category', 'score']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await accommodationInspectionService.record(
          { ...body, inspectionDate: new Date(body.inspectionDate) },
          auth
        ),
        'Recorded'
      );
    }
    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationInspectionService.close(body.id, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update inspection', err);
  }
});
