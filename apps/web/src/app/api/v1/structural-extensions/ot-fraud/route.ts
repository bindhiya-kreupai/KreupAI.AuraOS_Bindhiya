import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { overtimeFraudService, OT_FRAUD_SIGNALS } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    if (url.searchParams.get('action') === 'signals') return ok(OT_FRAUD_SIGNALS);
    return ok(
      await overtimeFraudService.list(
        ctx.user.tenantId,
        {
          signal: (url.searchParams.get('signal') as any) ?? undefined,
          isResolved:
            url.searchParams.get('isResolved') === null
              ? undefined
              : url.searchParams.get('isResolved') === 'true',
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list OT fraud flags', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      if (!body.employeeId || !body.evidencePeriod || !body.signal) {
        return badRequest('employeeId/evidencePeriod/signal required');
      }
      return ok(
        await overtimeFraudService.raise(
          {
            employeeId: body.employeeId,
            evidencePeriod: body.evidencePeriod,
            signal: body.signal,
            details: body.details,
            severity: body.severity,
          },
          auth
        ),
        'Raised'
      );
    }
    if (body.action === 'resolve') {
      if (!body.id || !body.reason) return badRequest('id/reason required');
      return ok(await overtimeFraudService.resolve(body.id, body.reason, auth), 'Resolved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update OT fraud flag', err);
  }
});
