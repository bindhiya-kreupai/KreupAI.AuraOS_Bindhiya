import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceCalendarService } from '@/lib/services/compliance-calendar';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read', 'compliance_kpi:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const filter = {
      status: url.searchParams.get('status') ?? undefined,
      categoryCode: url.searchParams.get('categoryCode') ?? undefined,
      countryCode: url.searchParams.get('countryCode') ?? undefined,
      from: url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined,
      to: url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined,
    };
    return ok(await complianceCalendarService.listTasks(ctx.user.tenantId, filter));
  } catch (err) {
    return serverError('Failed to list tasks', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'compliance_kpi:read')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed-categories')
      return ok(await complianceCalendarService.seedCategories(auth));
    if (body.action === 'seed-rules') return ok(await complianceCalendarService.seedRules(auth));
    if (body.action === 'generate')
      return ok(
        await complianceCalendarService.generateTasks({ monthsAhead: body.monthsAhead ?? 3 }, auth)
      );
    if (body.action === 'escalate-overdue')
      return ok(await complianceCalendarService.escalateOverdue(auth));
    if (body.action === 'rederive')
      return ok(await complianceCalendarService.rederiveFutureTasks(auth));
    if (body.action === 'complete') {
      if (!body.taskId) return badRequest('taskId required');
      return ok(
        await complianceCalendarService.completeTask(
          body.taskId,
          { evidenceUrl: body.evidenceUrl },
          auth
        )
      );
    }
    if (body.action === 'defer') {
      if (!body.taskId || !body.newDueDate) return badRequest('taskId + newDueDate required');
      return ok(
        await complianceCalendarService.deferTask(
          body.taskId,
          body.reason ?? '',
          new Date(body.newDueDate),
          auth
        )
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update task', err);
  }
});
