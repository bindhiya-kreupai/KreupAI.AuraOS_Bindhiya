import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrAuditService } from '@/lib/services/document-retention-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const resource = url.searchParams.get('resource') ?? 'cycles';
    if (resource === 'findings') {
      return ok(
        await hrAuditService.listFindings(ctx.user.tenantId, {
          auditCycleId: url.searchParams.get('auditCycleId') ?? undefined,
          status: url.searchParams.get('status') ?? undefined,
        })
      );
    }
    return ok(await hrAuditService.listCycles(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list audit', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'open-cycle') {
      if (!body.label) return badRequest('label required');
      return ok(
        await hrAuditService.openCycle(
          { label: body.label, scope: body.scope ?? {}, sampleSize: body.sampleSize ?? 0 },
          auth
        ),
        'Cycle opened'
      );
    }
    if (body.action === 'close-cycle') {
      if (!body.id) return badRequest('id required');
      return ok(await hrAuditService.closeCycle(body.id, auth), 'Cycle closed');
    }
    if (body.action === 'raise-finding') {
      for (const f of ['auditCycleId', 'severity', 'category', 'title']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await hrAuditService.raiseFinding(body, auth), 'Finding raised');
    }
    if (body.action === 'close-finding') {
      if (!body.id) return badRequest('id required');
      return ok(await hrAuditService.closeFinding(body.id, auth), 'Finding closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update audit', err);
  }
});
