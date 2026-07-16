import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gosiCalculationService } from '@/lib/services/gosi-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'payroll:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await gosiCalculationService.listContributions(
        ctx.user.tenantId,
        {
          period: url.searchParams.get('period') ?? undefined,
          nationalityClass: url.searchParams.get('nationalityClass') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list contributions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'payroll:manage')) return forbidden();
  try {
    const body = await req.json();
    if (!body.employeeId || !body.period) return badRequest('employeeId/period required');
    return ok(
      await gosiCalculationService.computeContribution(body, {
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
      }),
      'Computed'
    );
  } catch (err) {
    return serverError('Failed to compute contribution', err);
  }
});

export const DELETE = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'payroll:manage')) return forbidden();
  try {
    const url = new URL(req.url);
    const employeeId = url.searchParams.get('employeeId');
    const period = url.searchParams.get('period');
    if (!employeeId || !period) return badRequest('employeeId/period required');
    await gosiCalculationService.deleteContribution(employeeId, period, ctx.user.tenantId);
    return ok({ deleted: true }, 'Deleted contribution');
  } catch (err) {
    return serverError('Failed to delete contribution', err);
  }
});
