import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { leaveMisuseService } from '@/lib/services/leave-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await leaveMisuseService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          employeeId: url.searchParams.get('employeeId') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list misuse flags', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'tenant:manage',
      'tenant:read',
      'risk_register:manage',
      'employee:manage',
      'employee:read',
      'dashboard:read',
      'leave:manage'
    )
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      if (!body.employeeId || !body.flagType) return badRequest('employeeId and flagType required');
      return ok(await leaveMisuseService.raise(body, auth), 'Raised');
    }
    if (body.action === 'resolve') {
      if (!body.id) return badRequest('id required');
      return ok(await leaveMisuseService.resolve(body.id, body.notes, auth), 'Resolved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update misuse flag', err);
  }
});
