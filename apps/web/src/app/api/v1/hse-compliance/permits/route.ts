import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hsePermitService } from '@/lib/services/hse-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hsePermitService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list permits', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'issue') {
      for (const f of ['permitNumber', 'workType', 'location', 'startAt', 'endAt']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await hsePermitService.issue(
          {
            ...body,
            startAt: new Date(body.startAt),
            endAt: new Date(body.endAt),
          },
          auth
        ),
        'Issued'
      );
    }
    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(await hsePermitService.close(body.id, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update permit', err);
  }
});
