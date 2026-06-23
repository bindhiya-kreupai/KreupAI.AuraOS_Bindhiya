import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { wpsExceptionService } from '@/lib/services/wps-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const paging = {
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
    };
    if (url.searchParams.get('view') === 'delay-flags') {
      return ok(
        await wpsExceptionService.listDelayFlags(
          ctx.user.tenantId,
          {
            status: url.searchParams.get('status') ?? undefined,
            severity: url.searchParams.get('severity') ?? undefined,
            period: url.searchParams.get('period') ?? undefined,
          },
          paging
        )
      );
    }
    return ok(
      await wpsExceptionService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          severity: url.searchParams.get('severity') ?? undefined,
        },
        paging
      )
    );
  } catch (err) {
    return serverError('Failed to list exceptions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const f of ['code', 'description', 'severity', 'ownerRole']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await wpsExceptionService.raise(body, auth), 'Raised');
    }
    if (body.action === 'resolve') {
      if (!body.exceptionId) return badRequest('exceptionId required');
      return ok(await wpsExceptionService.resolve(body.exceptionId, auth), 'Resolved');
    }
    if (body.action === 'resolve-delay-flag') {
      if (!body.flagId) return badRequest('flagId required');
      return ok(await wpsExceptionService.resolveDelayFlag(body.flagId), 'Resolved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update exception', err);
  }
});
