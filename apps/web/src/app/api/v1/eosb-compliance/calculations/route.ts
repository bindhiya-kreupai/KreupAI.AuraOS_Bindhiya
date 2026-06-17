import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { eosbCalculationService } from '@/lib/services/eosb-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await eosbCalculationService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          employeeId: url.searchParams.get('employeeId') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list calculations', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'finalize') {
      for (const f of [
        'employeeId',
        'countryCode',
        'joiningDate',
        'lastWorkingDate',
        'basicSalary',
        'terminationType',
      ]) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(
        await eosbCalculationService.finalize(
          {
            ...body,
            joiningDate: new Date(body.joiningDate),
            lastWorkingDate: new Date(body.lastWorkingDate),
          },
          auth
        ),
        'Finalized'
      );
    }
    if (body.action === 'approve') {
      if (!body.id) return badRequest('id required');
      return ok(await eosbCalculationService.approve(body.id, auth), 'Approved');
    }
    if (body.action === 'settle') {
      if (!body.id || !body.paymentReference) return badRequest('id and paymentReference required');
      return ok(
        await eosbCalculationService.settle(body.id, body.paymentReference, auth),
        'Settled'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update calculation', err);
  }
});
