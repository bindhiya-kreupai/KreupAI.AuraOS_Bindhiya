import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationMaintenanceService } from '@/lib/services/workforce-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await accommodationMaintenanceService.list(ctx.user.tenantId, {
        status: (url.searchParams.get('status') as any) ?? undefined,
        severity: (url.searchParams.get('severity') as any) ?? undefined,
        siteId: url.searchParams.get('siteId') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list tickets', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'open') {
      if (!body.siteId || !body.ticketCode || !body.category || !body.description) {
        return badRequest('siteId/ticketCode/category/description required');
      }
      return ok(
        await accommodationMaintenanceService.open(
          {
            siteId: body.siteId,
            ticketCode: body.ticketCode,
            category: body.category,
            severity: body.severity,
            description: body.description,
          },
          auth
        ),
        'Opened'
      );
    }
    if (body.action === 'resolve') {
      if (!body.id || !body.notes) return badRequest('id/notes required');
      return ok(
        await accommodationMaintenanceService.resolve(body.id, body.notes, auth),
        'Resolved'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update ticket', err);
  }
});
