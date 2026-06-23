import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { kpiScorecardService } from '@/lib/services/kpi-scorecard';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read', 'tenant:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period');
    if (!period) return badRequest('period required');
    return ok(await kpiScorecardService.compute(ctx.user.tenantId, period));
  } catch (err) {
    return serverError('Failed to compute scorecard', err);
  }
});
