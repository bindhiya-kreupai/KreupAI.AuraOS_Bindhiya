import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { holidayWorkApprovalService } from '@/lib/services/holidays-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await holidayWorkApprovalService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
        employeeId: url.searchParams.get('employeeId') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list approvals', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'request') {
      for (const f of ['employeeId', 'holidayDate', 'holidayClass', 'country', 'plannedHours']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await holidayWorkApprovalService.request(
          { ...body, holidayDate: new Date(body.holidayDate) },
          auth
        ),
        'Requested'
      );
    }
    if (body.action === 'approve') {
      if (!body.id) return badRequest('id required');
      return ok(await holidayWorkApprovalService.approve(body.id, auth), 'Approved');
    }
    if (body.action === 'reject') {
      if (!body.id || !body.reason) return badRequest('id and reason required');
      return ok(await holidayWorkApprovalService.reject(body.id, body.reason, auth), 'Rejected');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update approval', err);
  }
});
