import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { otBudgetService } from '@/lib/services/overtime-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await otBudgetService.list(ctx.user.tenantId, url.searchParams.get('period') ?? undefined)
    );
  } catch (err) {
    return serverError('Failed to list budgets', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      for (const f of ['period', 'budgetHours', 'budgetAmount']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(await otBudgetService.upsertBudget(body, auth), 'Budget saved');
    }
    if (body.action === 'refresh') {
      if (!body.period) return badRequest('period required');
      return ok(await otBudgetService.refreshActuals(body.period, auth));
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update budget', err);
  }
});
