import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { fetchFilterOptions } from '@/lib/services/executive-compliance/risk-heatmap.service';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const options = await fetchFilterOptions(ctx.user.tenantId);
    return ok(options);
  } catch (err) {
    return serverError('Failed to load filter options', err);
  }
});
