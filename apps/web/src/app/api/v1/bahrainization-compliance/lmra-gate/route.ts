import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { bahrainizationGate } from '@/lib/services/bahrainization-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const body = await req.json();
    if (!body.action) return badRequest('action required');
    const legalEntityId = body.legalEntityId ?? null;
    if (body.action === 'hire-expat') {
      try {
        return ok(await bahrainizationGate.assertCanHireExpat(ctx.user.tenantId, legalEntityId));
      } catch (err) {
        return ok({ allowed: false, reason: String(err) });
      }
    }
    if (body.action === 'bid-tender') {
      try {
        return ok(await bahrainizationGate.assertCanBidTender(ctx.user.tenantId, legalEntityId));
      } catch (err) {
        return ok({ allowed: false, reason: String(err) });
      }
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Gate evaluation failed', err);
  }
});
