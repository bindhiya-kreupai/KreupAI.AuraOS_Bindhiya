import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { auditPlanService } from '@/lib/services/compliance-calendar';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'tenant:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await auditPlanService.listPlans(ctx.user.tenantId, {
        year: url.searchParams.get('year') ? Number(url.searchParams.get('year')) : undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list audit plans', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'create') {
      for (const f of ['year', 'title', 'scope', 'areas', 'ownerRole']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      return ok(await auditPlanService.createPlan(body, auth), 'Plan drafted');
    }
    if (body.action === 'approve') {
      if (!body.planId) return badRequest('planId required');
      return ok(await auditPlanService.approve(body.planId, auth), 'Approved');
    }
    if (body.action === 'sample') {
      return ok(await auditPlanService.sample(body, auth), 'Sample drawn');
    }
    if (body.action === 'test-result') {
      return ok(await auditPlanService.recordTestResult(body, auth), 'Test result recorded');
    }
    if (body.action === 'review') {
      if (!body.period || !body.scheduledFor) return badRequest('period/scheduledFor required');
      return ok(
        await auditPlanService.scheduleReview(
          { period: body.period, scheduledFor: new Date(body.scheduledFor) },
          auth
        ),
        'Review scheduled'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update audit plan', err);
  }
});
