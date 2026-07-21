import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { wpsPenaltyService } from '@/lib/services/wps-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'risk_register:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await wpsPenaltyService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
        period: url.searchParams.get('period') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list penalties', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const f of ['countryCode', 'establishmentId', 'period', 'type', 'description']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await wpsPenaltyService.raise(
          {
            countryCode: body.countryCode,
            establishmentId: body.establishmentId,
            period: body.period,
            type: body.type,
            amount: body.amount,
            currency: body.currency,
            description: body.description,
            businessImpact: body.businessImpact,
          },
          auth
        ),
        'Raised'
      );
    }
    if (body.action === 'resolve') {
      if (!body.penaltyId) return badRequest('penaltyId required');
      return ok(await wpsPenaltyService.resolve(body.penaltyId), 'Resolved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update penalty', err);
  }
});
