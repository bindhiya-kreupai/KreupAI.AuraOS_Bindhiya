import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { computeAnalytics } from '@/lib/services/executive-compliance/risk-heatmap.service';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') ?? undefined;
    const country = url.searchParams.get('country') ?? undefined;
    const severity = url.searchParams.get('severity') ?? undefined;
    const analytics = await computeAnalytics(ctx.user.tenantId, { domain, country, severity });
    return ok(analytics);
  } catch (err) {
    return serverError('Failed to load analytics', err);
  }
});
