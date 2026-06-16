import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { sioReconciliationService } from '@/lib/services/sio-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'payroll:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await sioReconciliationService.list(ctx.user.tenantId, {
        period: url.searchParams.get('period') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
        severity: url.searchParams.get('severity') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list variances', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'payroll:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'reconcile') {
      for (const f of ['establishmentId', 'period', 'payrollRows']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(await sioReconciliationService.reconcile(body, auth), 'Reconciled');
    }
    if (body.action === 'resolve') {
      if (!body.varianceId) return badRequest('varianceId required');
      return ok(await sioReconciliationService.resolve(body.varianceId, body.notes), 'Resolved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update reconciliation', err);
  }
});
