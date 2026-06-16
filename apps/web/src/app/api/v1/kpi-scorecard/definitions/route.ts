import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { kpiCatalogService } from '@/lib/services/kpi-scorecard';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read', 'tenant:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const filter = {
      domain: url.searchParams.get('domain') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
    };
    return ok(await kpiCatalogService.list(ctx.user.tenantId, filter));
  } catch (err) {
    return serverError('Failed to list KPI definitions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:manage', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed-catalog') {
      const data = await kpiCatalogService.seedCatalog(auth);
      return ok(data, 'Catalog seeded');
    }
    if (body.action === 'seed-weights') {
      const data = await kpiCatalogService.seedDomainWeights(auth);
      return ok(data, 'Domain weights seeded');
    }
    if (body.action === 'approve') {
      if (!body.definitionId) return badRequest('definitionId required');
      const data = await kpiCatalogService.approve(body.definitionId, auth);
      return ok(data, 'Approved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update KPI catalogue', err);
  }
});
