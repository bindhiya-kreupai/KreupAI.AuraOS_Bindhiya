import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { payrollCalendarControlService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await payrollCalendarControlService.list(
        ctx.user.tenantId,
        url.searchParams.get('country') ?? undefined
      )
    );
  } catch (err) {
    return serverError('Failed to list payroll calendar', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (
        !body.periodCode ||
        !body.country ||
        !body.periodStart ||
        !body.periodEnd ||
        !body.cutoffAt ||
        !body.lockAt ||
        !body.payAt
      ) {
        return badRequest(
          'periodCode/country/periodStart/periodEnd/cutoffAt/lockAt/payAt required'
        );
      }
      return ok(
        await payrollCalendarControlService.upsert(
          {
            periodCode: body.periodCode,
            country: body.country,
            periodStart: new Date(body.periodStart),
            periodEnd: new Date(body.periodEnd),
            cutoffAt: new Date(body.cutoffAt),
            lockAt: new Date(body.lockAt),
            payAt: new Date(body.payAt),
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'lock') {
      if (!body.id) return badRequest('id required');
      return ok(await payrollCalendarControlService.lock(body.id, auth), 'Locked');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update payroll calendar', err);
  }
});
