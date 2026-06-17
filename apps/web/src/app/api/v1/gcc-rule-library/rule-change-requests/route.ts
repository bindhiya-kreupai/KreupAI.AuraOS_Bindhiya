import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ruleChangeRequestService } from '@/lib/services/gcc-rule-library';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

// EPIC-02-S02 — maker-checker workflow for rule pack PUBLISH / RETIRE
// / ROLLBACK actions. Enforces preparer != approver at service layer.

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') ?? undefined;
    const rulePackId = url.searchParams.get('rulePackId') ?? undefined;
    const action = url.searchParams.get('action') ?? undefined;
    return ok(
      await ruleChangeRequestService.list(ctx.user.tenantId, {
        status: status as any,
        rulePackId,
        action: action as any,
      })
    );
  } catch (err) {
    return serverError('Failed to list rule change requests', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'request') {
      if (!body.rulePackId || !body.changeAction || !body.rationale || !body.sourceReference) {
        return badRequest('rulePackId/changeAction/rationale/sourceReference required');
      }
      const data = await ruleChangeRequestService.request(
        {
          rulePackId: body.rulePackId,
          action: body.changeAction,
          rationale: body.rationale,
          sourceReference: body.sourceReference,
          diffSummary: body.diffSummary,
          effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : undefined,
        },
        auth
      );
      return ok(data, 'Change request raised');
    }

    if (body.action === 'approve') {
      if (!body.requestId) return badRequest('requestId required');
      const data = await ruleChangeRequestService.approve(body.requestId, auth);
      return ok(data, 'Change request approved');
    }

    if (body.action === 'reject') {
      if (!body.requestId || !body.reason) return badRequest('requestId/reason required');
      const data = await ruleChangeRequestService.reject(body.requestId, body.reason, auth);
      return ok(data, 'Change request rejected');
    }

    if (body.action === 'rollback') {
      if (!body.countryCode || !body.rationale || !body.sourceReference) {
        return badRequest('countryCode/rationale/sourceReference required');
      }
      const data = await ruleChangeRequestService.rollback(
        {
          countryCode: body.countryCode,
          rationale: body.rationale,
          sourceReference: body.sourceReference,
        },
        auth
      );
      return ok(data, 'Rollback recorded');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update rule change request', err);
  }
});
