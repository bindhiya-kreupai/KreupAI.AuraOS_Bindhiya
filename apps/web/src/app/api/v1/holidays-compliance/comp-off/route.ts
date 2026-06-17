import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { holidayCompOffService } from '@/lib/services/holidays-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const within = url.searchParams.get('expiringSoonDays');
    return ok(
      await holidayCompOffService.list(ctx.user.tenantId, {
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        expiringSoonDays: within ? Number(within) : undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list comp-off', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'consume') {
      if (!body.id || !body.days) return badRequest('id and days required');
      return ok(await holidayCompOffService.consume(body.id, Number(body.days), auth), 'Consumed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update comp-off', err);
  }
});
