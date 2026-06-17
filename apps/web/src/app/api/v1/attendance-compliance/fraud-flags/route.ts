import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { attendanceFraudService } from '@/lib/services/attendance-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await attendanceFraudService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
        severity: url.searchParams.get('severity') ?? undefined,
        employeeId: url.searchParams.get('employeeId') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list fraud flags', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const f of ['employeeId', 'punchDate', 'flagType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await attendanceFraudService.raise({ ...body, punchDate: new Date(body.punchDate) }, auth),
        'Raised'
      );
    }
    if (body.action === 'resolve') {
      if (!body.id) return badRequest('id required');
      return ok(await attendanceFraudService.resolve(body.id, body.notes, auth), 'Resolved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update fraud flag', err);
  }
});
