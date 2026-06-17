import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { fatigueRuleService } from '@/lib/services/structural-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await fatigueRuleService.list(ctx.user.tenantId, url.searchParams.get('country') ?? undefined)
    );
  } catch (err) {
    return serverError('Failed to list fatigue rules', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action !== 'upsert') return badRequest('unknown action');
    if (!body.ruleCode) return badRequest('ruleCode required');
    return ok(
      await fatigueRuleService.upsert(
        {
          ruleCode: body.ruleCode,
          country: body.country,
          maxConsecutiveDays: body.maxConsecutiveDays,
          minRestHoursBetweenShifts: body.minRestHoursBetweenShifts,
          maxWeeklyHours: body.maxWeeklyHours,
          appliesTo: body.appliesTo,
          isActive: body.isActive,
        },
        auth
      ),
      'Saved'
    );
  } catch (err) {
    return serverError('Failed to update fatigue rule', err);
  }
});
