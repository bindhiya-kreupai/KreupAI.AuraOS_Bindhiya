import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { auditPlanService } from '@/lib/services/compliance-calendar';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'risk_register:manage', 'tenant:manage'))
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const f of ['auditPlanId', 'area', 'title', 'description', 'severity']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await auditPlanService.raiseFinding(body, auth), 'Finding raised');
    }
    if (body.action === 'corrective-action') {
      if (!body.findingId || !body.dueDate || !body.description || !body.ownerRole) {
        return badRequest('findingId/dueDate/description/ownerRole required');
      }
      return ok(
        await auditPlanService.raiseCorrectiveAction(
          body.findingId,
          {
            description: body.description,
            ownerRole: body.ownerRole,
            dueDate: new Date(body.dueDate),
          },
          auth
        ),
        'Corrective action raised'
      );
    }
    if (body.action === 'close-action') {
      if (!body.actionId) return badRequest('actionId required');
      return ok(await auditPlanService.closeCorrectiveAction(body.actionId), 'Closed');
    }
    if (body.action === 'escalate-overdue-actions') {
      return ok(await auditPlanService.escalateOverdueActions(auth));
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update findings', err);
  }
});
