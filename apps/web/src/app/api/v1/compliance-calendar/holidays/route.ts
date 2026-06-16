import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceCalendarService } from '@/lib/services/compliance-calendar';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const countryCode = url.searchParams.get('countryCode');
    const year = Number(url.searchParams.get('year') ?? new Date().getFullYear());
    if (!countryCode) return badRequest('countryCode required');
    return ok(await complianceCalendarService.listHolidays(ctx.user.tenantId, countryCode, year));
  } catch (err) {
    return serverError('Failed to list holidays', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    for (const f of ['countryCode', 'date', 'name']) {
      if (!body[f]) return badRequest(`${f} required`);
    }
    return ok(
      await complianceCalendarService.addHoliday(
        {
          countryCode: body.countryCode,
          date: new Date(body.date),
          name: body.name,
          isPublic: body.isPublic,
          isRamadan: body.isRamadan,
        },
        { tenantId: ctx.user.tenantId, userId: ctx.user.id }
      ),
      'Holiday added'
    );
  } catch (err) {
    return serverError('Failed to add holiday', err);
  }
});
