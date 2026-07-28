import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { otActualService } from '@/lib/services/overtime-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await otActualService.list(
        ctx.user.tenantId,
        {
          employeeId: url.searchParams.get('employeeId') ?? undefined,
          period: url.searchParams.get('period') ?? undefined,
          fraudOnly: url.searchParams.get('fraudOnly') === 'true',
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list actuals', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'tenant:manage',
      'employee:manage',
      'tenant:read',
      'dashboard:read',
      'overtime:manage'
    )
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'post') {
      for (const f of ['employeeId', 'country', 'otDate', 'otType', 'actualHours']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await otActualService.post({ ...body, otDate: new Date(body.otDate) }, auth),
        'Posted'
      );
    }
    if (body.action === 'post-to-payroll') {
      if (!body.id) return badRequest('id required');
      return ok(await otActualService.postToPayroll(body.id, auth), 'Sent to payroll');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update actual', err);
  }
});
