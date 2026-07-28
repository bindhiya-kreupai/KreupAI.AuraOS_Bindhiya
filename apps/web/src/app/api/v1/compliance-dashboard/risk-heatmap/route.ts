/**
 * EPIC-31 Risk Heatmap API (extended).
 * Thin shell over risk-heatmap.service.ts buildHeatmap().
 * All DB access is encapsulated in the service layer.
 */
import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { buildHeatmap } from '@/lib/services/executive-compliance/risk-heatmap.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') ?? undefined;
    const country = url.searchParams.get('country') ?? undefined;
    const severity = url.searchParams.get('severity') ?? undefined;
    const entity = url.searchParams.get('entity') ?? undefined;
    const department = url.searchParams.get('department') ?? undefined;
    const dateFrom = url.searchParams.get('dateFrom')
      ? new Date(url.searchParams.get('dateFrom')!)
      : undefined;
    const dateTo = url.searchParams.get('dateTo')
      ? new Date(url.searchParams.get('dateTo')!)
      : undefined;
    if (dateFrom && isNaN(dateFrom.getTime())) return badRequest('Invalid dateFrom');
    if (dateTo && isNaN(dateTo.getTime())) return badRequest('Invalid dateTo');
    const result = await buildHeatmap(ctx.user.tenantId, {
      domain,
      country,
      severity,
      entity,
      department,
      dateFrom,
      dateTo,
    });
    return ok(result);
  } catch (err) {
    return serverError('Failed to load risk heatmap', err);
  }
});
