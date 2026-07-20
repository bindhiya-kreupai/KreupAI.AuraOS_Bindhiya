import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { visaExitCaseService } from '@/lib/services/visa-exit-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await visaExitCaseService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          scenario: url.searchParams.get('scenario') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list cases', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const { action, ...caseData } = body;
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'open') {
      for (const f of ['employeeId', 'countryCode', 'scenario']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await visaExitCaseService.open(
          {
            ...caseData,
            lastWorkingDate: caseData.lastWorkingDate
              ? new Date(caseData.lastWorkingDate)
              : undefined,
          },
          auth
        ),
        'Case opened'
      );
    }
    if (body.action === 'transition') {
      if (!body.id || !body.next) return badRequest('id and next required');
      return ok(
        await visaExitCaseService.transition(body.id, body.next, body.subStatus, auth),
        'Transitioned'
      );
    }
    if (body.action === 'set-settlement') {
      if (!body.id || !body.finalSettlementId)
        return badRequest('id and finalSettlementId required');
      return ok(await visaExitCaseService.setSettlement(body.id, body.finalSettlementId, auth));
    }
    if (body.action === 'set-si-closure') {
      if (!body.id || !body.siClosureRef) return badRequest('id and siClosureRef required');
      return ok(await visaExitCaseService.setSiClosure(body.id, body.siClosureRef, auth));
    }
    if (body.action === 'set-ticket-issued') {
      if (!body.id) return badRequest('id required');
      return ok(await visaExitCaseService.setTicketIssued(body.id, auth));
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update case', err);
  }
});
