import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { payrollGovernanceService } from '@/lib/services/payroll-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll_compliance:read', 'payroll:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await payrollGovernanceService.list(ctx.user.tenantId, {
        category: url.searchParams.get('category') ?? undefined,
        country: url.searchParams.get('country') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list governance controls', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll_compliance:manage', 'payroll:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.controlCode || !body.label || !body.category)
        return badRequest('controlCode, label, category required');
      return ok(await payrollGovernanceService.upsert(body, auth), 'Saved');
    }
    if (body.action === 'review') {
      if (!body.id) return badRequest('id required');
      return ok(await payrollGovernanceService.review(body.id, auth), 'Reviewed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update governance control', err);
  }
});
