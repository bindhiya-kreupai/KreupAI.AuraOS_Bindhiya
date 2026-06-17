import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { otRequestService } from '@/lib/services/overtime-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await otRequestService.list(ctx.user.tenantId, {
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list requests', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'create') {
      for (const f of ['employeeId', 'country', 'requestDate', 'plannedHours', 'otType']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await otRequestService.create({ ...body, requestDate: new Date(body.requestDate) }, auth),
        'Request created'
      );
    }
    if (body.action === 'approve') {
      if (!body.requestId) return badRequest('requestId required');
      return ok(await otRequestService.approve(body.requestId, auth), 'Approved');
    }
    if (body.action === 'reject') {
      if (!body.requestId) return badRequest('requestId required');
      return ok(await otRequestService.reject(body.requestId, body.reason ?? '', auth), 'Rejected');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update request', err);
  }
});
