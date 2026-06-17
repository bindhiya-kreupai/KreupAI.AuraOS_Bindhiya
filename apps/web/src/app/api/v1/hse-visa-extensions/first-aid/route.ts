import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hseFirstAidStationService } from '@/lib/services/hse-visa-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hseFirstAidStationService.list(
        ctx.user.tenantId,
        url.searchParams.get('siteId') ?? undefined
      )
    );
  } catch (err) {
    return serverError('Failed to list first-aid stations', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.siteId || !body.stationCode || !body.label) {
        return badRequest('siteId/stationCode/label required');
      }
      return ok(
        await hseFirstAidStationService.upsert(
          {
            siteId: body.siteId,
            stationCode: body.stationCode,
            label: body.label,
            certifiedFirstAiderCount: body.certifiedFirstAiderCount,
            isActive: body.isActive,
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'record-inspection') {
      if (!body.id || !body.result) return badRequest('id/result required');
      return ok(
        await hseFirstAidStationService.recordInspection(body.id, body.result, auth),
        'Recorded'
      );
    }
    if (body.action === 'restock') {
      if (!body.id) return badRequest('id required');
      return ok(await hseFirstAidStationService.restock(body.id, auth), 'Restocked');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update first-aid station', err);
  }
});
