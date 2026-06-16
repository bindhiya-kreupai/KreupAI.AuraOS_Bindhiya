import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { kpiComputeService } from '@/lib/services/kpi-scorecard';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read', 'tenant:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const filter = {
      period: url.searchParams.get('period') ?? undefined,
      kpiCode: url.searchParams.get('kpiCode') ?? undefined,
      countryCode: url.searchParams.get('countryCode') ?? undefined,
      ragStatus: url.searchParams.get('ragStatus') ?? undefined,
    };
    return ok(await kpiComputeService.values(ctx.user.tenantId, filter));
  } catch (err) {
    return serverError('Failed to load KPI values', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    for (const f of ['kpiCode', 'period', 'value']) {
      if (body[f] == null) return badRequest(`${f} required`);
    }
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    const data =
      body.rowCount != null
        ? await kpiComputeService.recordWithDq(body, auth)
        : await kpiComputeService.record(body, auth);
    return ok(data, 'KPI value recorded');
  } catch (err) {
    return serverError('Failed to record KPI value', err);
  }
});
