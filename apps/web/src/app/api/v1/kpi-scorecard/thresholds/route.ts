import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { kpiThresholdService } from '@/lib/services/kpi-scorecard';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read', 'tenant:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const filter = {
      kpiCode: url.searchParams.get('kpiCode') ?? undefined,
      countryCode: url.searchParams.get('countryCode') ?? undefined,
    };
    return ok(await kpiThresholdService.list(ctx.user.tenantId, filter));
  } catch (err) {
    return serverError('Failed to list thresholds', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:manage', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    if (!body.kpiCode) return badRequest('kpiCode required');
    const data = await kpiThresholdService.upsert(body, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok(data, 'Threshold saved');
  } catch (err) {
    return serverError('Failed to save threshold', err);
  }
});
