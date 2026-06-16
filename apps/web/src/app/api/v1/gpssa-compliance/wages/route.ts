import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gpssaCalculationService } from '@/lib/services/gpssa-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'payroll:manage')) return forbidden();
  try {
    const body = await req.json();
    for (const f of ['employeeId', 'period', 'basicWage']) {
      if (body[f] == null) return badRequest(`${f} required`);
    }
    return ok(
      await gpssaCalculationService.recordContributionWage(body, {
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
      }),
      'Contribution wage recorded'
    );
  } catch (err) {
    return serverError('Failed to record contribution wage', err);
  }
});
