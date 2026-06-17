import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { employeeLoanService } from '@/lib/services/workforce-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await employeeLoanService.list(
        ctx.user.tenantId,
        {
          status: (url.searchParams.get('status') as any) ?? undefined,
          employeeId: url.searchParams.get('employeeId') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list loans', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'create') {
      if (
        !body.employeeId ||
        !body.loanCode ||
        body.principal == null ||
        !body.installments ||
        !body.startDate
      ) {
        return badRequest('employeeId/loanCode/principal/installments/startDate required');
      }
      return ok(
        await employeeLoanService.create(
          {
            employeeId: body.employeeId,
            loanCode: body.loanCode,
            loanType: body.loanType,
            currency: body.currency,
            principal: body.principal,
            interestRatePct: body.interestRatePct,
            installments: body.installments,
            startDate: new Date(body.startDate),
            notes: body.notes,
          },
          auth
        ),
        'Created'
      );
    }
    if (body.action === 'pay') {
      if (!body.id || !body.amount) return badRequest('id/amount required');
      return ok(await employeeLoanService.recordPayment(body.id, body.amount, auth), 'Recorded');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update loan', err);
  }
});
