import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { sioCalculationService } from '@/lib/services/sio-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'payroll:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await sioCalculationService.listContributions(
        ctx.user.tenantId,
        {
          period: url.searchParams.get('period') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list contributions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'payroll:manage')) return forbidden();
  try {
    const body = await req.json();
    if (!body.employeeId || !body.period) return badRequest('employeeId/period required');
    return ok(
      await sioCalculationService.computeContribution(body, {
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
      }),
      'Computed'
    );
  } catch (err) {
    return serverError('Failed to compute contribution', err);
  }
});
