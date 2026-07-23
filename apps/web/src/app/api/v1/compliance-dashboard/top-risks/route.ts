import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { fetchTopRisks } from '@/lib/services/executive-compliance/risk-heatmap.service';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

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
    const take = Math.min(200, parseInt(url.searchParams.get('take') ?? '50', 10));
    const risks = await fetchTopRisks(
      ctx.user.tenantId,
      { domain, country, severity, entity, department },
      take
    );
    return ok({ risks, total: risks.length });
  } catch (err) {
    return serverError('Failed to load top risks', err);
  }
});
