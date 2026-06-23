import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { nitaqatPrivilegeGate } from '@/lib/services/nitaqat-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'employee:manage'))
    return forbidden();
  try {
    const body = await req.json();
    const legalEntityId = (body.legalEntityId as string | null) ?? null;
    const privilege = body.privilege as 'hireExpat' | 'renewVisa' | 'transferWorker';
    if (!privilege) return badRequest('privilege required');
    try {
      if (privilege === 'hireExpat')
        return ok(await nitaqatPrivilegeGate.assertCanHireExpat(ctx.user.tenantId, legalEntityId));
      if (privilege === 'renewVisa')
        return ok(await nitaqatPrivilegeGate.assertCanRenewVisa(ctx.user.tenantId, legalEntityId));
      if (privilege === 'transferWorker')
        return ok(await nitaqatPrivilegeGate.assertCanTransfer(ctx.user.tenantId, legalEntityId));
      return badRequest('unknown privilege');
    } catch (err) {
      return ok({ allowed: false, reason: err instanceof Error ? err.message : String(err) });
    }
  } catch (err) {
    return serverError('Failed to check privilege', err);
  }
});
