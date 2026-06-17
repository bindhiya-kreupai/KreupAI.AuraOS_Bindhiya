import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationAssignmentService } from '@/lib/services/accommodation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await accommodationAssignmentService.list(ctx.user.tenantId, {
        siteId: url.searchParams.get('siteId') ?? undefined,
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list assignments', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'assign') {
      for (const f of ['siteId', 'employeeId', 'checkInAt']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await accommodationAssignmentService.assign(
          { ...body, checkInAt: new Date(body.checkInAt) },
          auth
        ),
        'Assigned'
      );
    }
    if (body.action === 'check-out') {
      if (!body.id || !body.checkOutAt) return badRequest('id and checkOutAt required');
      return ok(
        await accommodationAssignmentService.checkOut(body.id, new Date(body.checkOutAt), auth),
        'Checked out'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update assignment', err);
  }
});
