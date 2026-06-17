import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationTransportRouteService } from '@/lib/services/workforce-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await accommodationTransportRouteService.list(
        ctx.user.tenantId,
        url.searchParams.get('siteId') ?? undefined
      )
    );
  } catch (err) {
    return serverError('Failed to list transport routes', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.siteId || !body.routeCode || !body.label) {
        return badRequest('siteId/routeCode/label required');
      }
      return ok(
        await accommodationTransportRouteService.upsert(
          {
            siteId: body.siteId,
            routeCode: body.routeCode,
            label: body.label,
            vehicleType: body.vehicleType,
            capacity: body.capacity,
            departureFromSite: body.departureFromSite,
            arrivalAtSite: body.arrivalAtSite,
            worksiteAddress: body.worksiteAddress,
            distanceKm: body.distanceKm,
            isActive: body.isActive,
            notes: body.notes,
          },
          auth
        ),
        'Saved'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update transport route', err);
  }
});
