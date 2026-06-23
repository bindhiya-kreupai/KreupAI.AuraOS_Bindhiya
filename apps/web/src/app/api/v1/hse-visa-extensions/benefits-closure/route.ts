import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { visaExitBenefitsClosureService } from '@/lib/services/hse-visa-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await visaExitBenefitsClosureService.list(
        ctx.user.tenantId,
        url.searchParams.get('visaExitCaseId') ?? undefined,
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list benefit closures', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed-defaults') {
      if (!body.visaExitCaseId) return badRequest('visaExitCaseId required');
      return ok(
        await visaExitBenefitsClosureService.seedDefaults(body.visaExitCaseId, auth),
        'Seeded'
      );
    }
    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(
        await visaExitBenefitsClosureService.close(
          body.id,
          { amountSettled: body.amountSettled, notes: body.notes },
          auth
        ),
        'Closed'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update benefit closure', err);
  }
});
