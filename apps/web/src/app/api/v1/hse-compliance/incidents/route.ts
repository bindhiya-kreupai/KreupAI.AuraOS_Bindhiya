import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hseIncidentService } from '@/lib/services/hse-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hseIncidentService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          severity: url.searchParams.get('severity') ?? undefined,
          incidentType: url.searchParams.get('incidentType') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list incidents', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const f of ['incidentNumber', 'incidentDate', 'incidentType', 'severity']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await hseIncidentService.raise(
          { ...body, incidentDate: new Date(body.incidentDate) },
          auth
        ),
        'Raised'
      );
    }
    if (body.action === 'set-root-cause') {
      if (!body.id || !body.rootCause) return badRequest('id and rootCause required');
      return ok(
        await hseIncidentService.setRootCause(body.id, body.rootCause, body.actions ?? [], auth),
        'Updated'
      );
    }
    if (body.action === 'notify-authority') {
      if (!body.id || !body.kind) return badRequest('id and kind required');
      return ok(await hseIncidentService.notifyAuthority(body.id, body.kind, auth));
    }
    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(await hseIncidentService.close(body.id, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update incident', err);
  }
});
