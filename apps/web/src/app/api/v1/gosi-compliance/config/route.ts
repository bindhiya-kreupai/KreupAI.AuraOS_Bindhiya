import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gosiConfigService } from '@/lib/services/gosi-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'compliance_kpi:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const view = url.searchParams.get('view') ?? 'establishments';
    if (view === 'branches') return ok(await gosiConfigService.listBranches(ctx.user.tenantId));
    if (view === 'rates') return ok(await gosiConfigService.listRates(ctx.user.tenantId));
    return ok(await gosiConfigService.listEstablishments(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to load GOSI config', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'create-establishment') {
      for (const f of ['gosiNumber', 'establishmentName']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await gosiConfigService.createEstablishment(body, auth), 'Established');
    }
    if (body.action === 'seed-branches') return ok(await gosiConfigService.seedBranches(auth));
    if (body.action === 'seed-rates') {
      return ok(
        await gosiConfigService.seedRates(
          auth,
          body.effectiveFrom ? new Date(body.effectiveFrom) : undefined
        )
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update GOSI config', err);
  }
});
