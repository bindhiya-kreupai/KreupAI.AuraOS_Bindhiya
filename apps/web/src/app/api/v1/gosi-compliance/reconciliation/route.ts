import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gosiReconciliationService } from '@/lib/services/gosi-compliance';
import { prisma } from '@aura/database';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'payroll:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const listResult = await gosiReconciliationService.list(ctx.user.tenantId, {
      period: url.searchParams.get('period') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      severity: url.searchParams.get('severity') ?? undefined,
    });
    const toleranceConfig = await (prisma as any).gosiBranchConfig.findUnique({
      where: { tenantId_branch: { tenantId: ctx.user.tenantId, branch: 'TOLERANCE' } },
    });
    const tolerance = toleranceConfig?.appliesTo?.[0]
      ? parseFloat(toleranceConfig.appliesTo[0])
      : 0.01;

    return ok({
      ...listResult,
      tolerance,
    });
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
      return ok(await gosiReconciliationService.reconcile(body, auth), 'Reconciled');
    }
    if (body.action === 'resolve') {
      if (!body.varianceId) return badRequest('varianceId required');
      return ok(await gosiReconciliationService.resolve(body.varianceId, body.notes), 'Resolved');
    }
    if (body.action === 'update-tolerance') {
      if (body.tolerance == null) return badRequest('tolerance required');
      const toleranceVal = parseFloat(body.tolerance);
      if (isNaN(toleranceVal)) return badRequest('invalid tolerance');

      await (prisma as any).gosiBranchConfig.upsert({
        where: { tenantId_branch: { tenantId: ctx.user.tenantId, branch: 'TOLERANCE' } },
        create: {
          tenantId: ctx.user.tenantId,
          branch: 'TOLERANCE',
          appliesTo: [toleranceVal.toString()],
          isActive: true,
        },
        update: {
          appliesTo: [toleranceVal.toString()],
        },
      });
      return ok({ tolerance: toleranceVal }, 'Tolerance updated');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update reconciliation', err);
  }
});
