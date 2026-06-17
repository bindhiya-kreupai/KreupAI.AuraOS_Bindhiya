import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { eosSioFundingLinkService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await eosSioFundingLinkService.list(ctx.user.tenantId, {
        employeeId: url.searchParams.get('employeeId') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list EOS/SIO funding links', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.employeeId || !body.schemeCode) return badRequest('employeeId/schemeCode required');
      return ok(
        await eosSioFundingLinkService.upsert(
          {
            employeeId: body.employeeId,
            schemeCode: body.schemeCode,
            fundingAccountRef: body.fundingAccountRef,
            balance: body.balance,
            currency: body.currency,
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'reconcile') {
      if (!body.id) return badRequest('id required');
      return ok(await eosSioFundingLinkService.reconcile(body.id, auth), 'Reconciled');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update funding link', err);
  }
});
