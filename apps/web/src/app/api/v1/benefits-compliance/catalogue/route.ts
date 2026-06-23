import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { benefitCatalogueService } from '@/lib/services/benefits-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    return ok(await benefitCatalogueService.list(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list catalogue', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed-defaults') {
      return ok(
        await benefitCatalogueService.seedDefaults(
          auth,
          body.effectiveFrom ? new Date(body.effectiveFrom) : undefined
        )
      );
    }
    if (body.action === 'upsert') {
      for (const f of ['benefitCode', 'benefitType', 'label', 'effectiveFrom']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await benefitCatalogueService.upsert(
          { ...body, effectiveFrom: new Date(body.effectiveFrom) },
          auth
        ),
        'Saved'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update catalogue', err);
  }
});
