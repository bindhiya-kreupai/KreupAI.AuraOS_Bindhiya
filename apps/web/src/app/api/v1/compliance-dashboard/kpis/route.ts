import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { computeKpis } from '@/lib/services/executive-compliance/risk-heatmap.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') ?? undefined;
    const country = url.searchParams.get('country') ?? undefined;
    const severity = url.searchParams.get('severity') ?? undefined;
    const dateFrom = url.searchParams.get('dateFrom')
      ? new Date(url.searchParams.get('dateFrom')!)
      : undefined;
    const dateTo = url.searchParams.get('dateTo')
      ? new Date(url.searchParams.get('dateTo')!)
      : undefined;
    if (dateFrom && isNaN(dateFrom.getTime())) return badRequest('Invalid dateFrom');
    if (dateTo && isNaN(dateTo.getTime())) return badRequest('Invalid dateTo');
    const kpis = await computeKpis(ctx.user.tenantId, {
      domain,
      country,
      severity,
      dateFrom,
      dateTo,
    });
    return ok(kpis);
  } catch (err) {
    return serverError('Failed to load KPIs', err);
  }
});
