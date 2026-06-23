import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { checklistRunService } from '@/lib/services/checklist-engine';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const runId = url.searchParams.get('runId');
    if (runId) return ok(await checklistRunService.detail(runId));
    return ok(
      await checklistRunService.list(ctx.user.tenantId, {
        period: url.searchParams.get('period') ?? undefined,
        templateCode: url.searchParams.get('templateCode') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list runs', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'start') {
      for (const f of ['templateCode', 'period']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await checklistRunService.start(body, auth), 'Run started');
    }
    if (body.action === 'assess') {
      for (const f of ['runId', 'itemCode', 'status']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await checklistRunService.assess(body, auth), 'Item assessed');
    }
    if (body.action === 'submit') {
      if (!body.runId) return badRequest('runId required');
      return ok(await checklistRunService.submit(body.runId, auth), 'Submitted');
    }
    if (body.action === 'approve') {
      if (!body.runId) return badRequest('runId required');
      return ok(await checklistRunService.approveRun(body.runId, auth), 'Approved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update run', err);
  }
});
