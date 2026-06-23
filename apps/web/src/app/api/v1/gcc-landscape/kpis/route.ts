import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { workforceKpiService } from '@/lib/services/gcc-landscape';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read', 'tenant:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const countryCode = url.searchParams.get('countryCode') ?? undefined;
    if (action === 'buckets') {
      return ok(await workforceKpiService.computeBuckets(ctx.user.tenantId));
    }
    return ok(await workforceKpiService.latestKpis(ctx.user.tenantId, countryCode));
  } catch (err) {
    return serverError('Failed to load workforce KPIs', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'set-target') {
      if (!body.countryCode || body.targetPct == null) {
        return badRequest('countryCode and targetPct required');
      }
      const data = await workforceKpiService.setTarget(body, {
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
      });
      return ok(data, 'Target set');
    }
    if (body.action === 'snapshot') {
      const data = await workforceKpiService.takeSnapshot(
        {
          snapshotDate: body.snapshotDate ? new Date(body.snapshotDate) : undefined,
        },
        { tenantId: ctx.user.tenantId, userId: ctx.user.id }
      );
      return ok(data, 'Snapshot taken');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update KPI configuration', err);
  }
});
