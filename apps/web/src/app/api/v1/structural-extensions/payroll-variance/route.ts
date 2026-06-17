import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { payrollVarianceService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await payrollVarianceService.list(
        ctx.user.tenantId,
        {
          payrollRunId: url.searchParams.get('payrollRunId') ?? undefined,
          status: (url.searchParams.get('status') as any) ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list payroll variances', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'record') {
      if (
        !body.payrollRunId ||
        !body.period ||
        !body.varianceCode ||
        !body.category ||
        body.expectedAmount == null ||
        body.actualAmount == null
      ) {
        return badRequest(
          'payrollRunId/period/varianceCode/category/expectedAmount/actualAmount required'
        );
      }
      return ok(
        await payrollVarianceService.record(
          {
            payrollRunId: body.payrollRunId,
            period: body.period,
            varianceCode: body.varianceCode,
            category: body.category,
            expectedAmount: body.expectedAmount,
            actualAmount: body.actualAmount,
            rootCause: body.rootCause,
            actionPlan: body.actionPlan,
          },
          auth
        ),
        'Recorded'
      );
    }
    if (body.action === 'set-status') {
      if (!body.id || !body.status) return badRequest('id/status required');
      return ok(await payrollVarianceService.setStatus(body.id, body.status, auth), 'Updated');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update variance', err);
  }
});
