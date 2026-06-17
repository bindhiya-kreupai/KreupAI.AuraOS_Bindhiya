import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { holidayCalendarChangeService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await holidayCalendarChangeService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
        year: url.searchParams.get('year') ? Number(url.searchParams.get('year')) : undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list holiday change requests', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'request') {
      if (
        !body.calendarCode ||
        !body.country ||
        !body.year ||
        !body.changeType ||
        !body.change ||
        !body.rationale
      ) {
        return badRequest('calendarCode/country/year/changeType/change/rationale required');
      }
      return ok(
        await holidayCalendarChangeService.request(
          {
            calendarCode: body.calendarCode,
            country: body.country,
            year: body.year,
            changeType: body.changeType,
            change: body.change,
            rationale: body.rationale,
            regulatorRef: body.regulatorRef,
          },
          auth
        ),
        'Request raised'
      );
    }
    if (body.action === 'approve') {
      if (!body.id) return badRequest('id required');
      return ok(await holidayCalendarChangeService.approve(body.id, auth), 'Approved');
    }
    if (body.action === 'publish') {
      if (!body.id) return badRequest('id required');
      return ok(await holidayCalendarChangeService.publish(body.id, auth), 'Published');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update holiday change request', err);
  }
});
