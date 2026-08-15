import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { auditPlanService } from '@/lib/services/compliance-calendar';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'tenant:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const planId = url.searchParams.get('planId');
    const { prisma } = require('@aura/database');

    if (planId) {
      const plan = await (prisma as any).auditPlan.findFirst({
        where: { id: planId, tenantId: ctx.user.tenantId },
        include: { samples: true },
      });
      if (!plan) return badRequest('Plan not found');

      // Load related findings and corrective actions
      const findings = await (prisma as any).auditFinding.findMany({
        where: { auditPlanId: planId, tenantId: ctx.user.tenantId },
        include: { correctiveActions: true },
      });

      // Load related test results
      const testResults = await (prisma as any).auditTestResult.findMany({
        where: { auditPlanId: planId, tenantId: ctx.user.tenantId },
      });

      return ok({ plan, findings, testResults });
    }

    if (url.searchParams.get('action') === 'reviews') {
      return ok(await auditPlanService.listReviews(ctx.user.tenantId));
    }

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
    const auth = { tenantId: ctx.user.tenantId, userId: (ctx.user as any).userId || ctx.user.id };
    if (body.action === 'create') {
      console.log('[AuditPlan POST Create] Input body:', body, 'auth:', auth);
      for (const f of ['year', 'title', 'scope', 'areas', 'ownerRole']) {
        if (body[f] == null) return badRequest(`${f} required`);
      }
      body.year = Number(body.year);
      if (isNaN(body.year)) return badRequest('year must be a valid number');
      const plan = await auditPlanService.createPlan(body, auth);
      console.log('[AuditPlan POST Create] Success plan created:', plan);
      return ok(plan, 'Plan drafted');
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
  } catch (err: any) {
    if (
      err instanceof Error &&
      !err.message.includes('Prisma') &&
      !err.message.includes('db') &&
      !err.stack?.includes('prisma')
    ) {
      return badRequest(err.message);
    }
    return serverError('Failed to update audit plan', err);
  }
});
