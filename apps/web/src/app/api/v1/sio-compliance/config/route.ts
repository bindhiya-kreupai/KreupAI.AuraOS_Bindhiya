import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { sioConfigService } from '@/lib/services/sio-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    if (url.searchParams.get('view') === 'rates')
      return ok(await sioConfigService.listRates(ctx.user.tenantId));
    return ok(await sioConfigService.listEstablishments(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to load SIO config', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'create-establishment') {
      for (const f of ['sioNumber', 'establishmentName']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await sioConfigService.createEstablishment(body, auth), 'Established');
    }
    if (body.action === 'seed-branches') return ok(await sioConfigService.seedBranches(auth));
    if (body.action === 'seed-rates') {
      return ok(
        await sioConfigService.seedRates(
          auth,
          body.effectiveFrom ? new Date(body.effectiveFrom) : undefined
        )
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update SIO config', err);
  }
});
