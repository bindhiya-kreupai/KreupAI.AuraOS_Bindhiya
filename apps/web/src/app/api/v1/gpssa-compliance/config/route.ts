import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gpssaConfigService } from '@/lib/services/gpssa-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'compliance_kpi:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const view = url.searchParams.get('view') ?? 'establishments';
    if (view === 'rates') return ok(await gpssaConfigService.listRates(ctx.user.tenantId));
    return ok(await gpssaConfigService.listEstablishments(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to load GPSSA config', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'create-establishment') {
      for (const f of ['gpssaNumber', 'establishmentName']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await gpssaConfigService.createEstablishment(body, auth), 'Established');
    }
    if (body.action === 'seed-rates') {
      return ok(
        await gpssaConfigService.seedRates(
          auth,
          body.effectiveFrom ? new Date(body.effectiveFrom) : undefined
        )
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update GPSSA config', err);
  }
});
