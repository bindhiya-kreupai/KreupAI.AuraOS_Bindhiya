import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { separationCaseService } from '@/lib/services/separation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await separationCaseService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          separationType: url.searchParams.get('separationType') ?? undefined,
          employeeId: url.searchParams.get('employeeId') ?? undefined,
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
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'open') {
      for (const f of ['caseNumber', 'employeeId', 'country', 'separationType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await separationCaseService.open(
          {
            ...body,
            lastWorkingDate: body.lastWorkingDate ? new Date(body.lastWorkingDate) : undefined,
          },
          auth
        ),
        'Opened'
      );
    }
    if (body.action === 'submit') return ok(await separationCaseService.submit(body.id, auth));
    if (body.action === 'approve') return ok(await separationCaseService.approve(body.id, auth));
    if (body.action === 'set-notice') {
      if (!body.id) return badRequest('id required');
      return ok(
        await separationCaseService.setNoticeServed(
          body.id,
          Number(body.days ?? 0),
          !!body.buyout,
          body.buyoutAmount ? Number(body.buyoutAmount) : undefined,
          auth
        )
      );
    }
    if (body.action === 'set-garden-leave') {
      if (!body.id) return badRequest('id required');
      return ok(await separationCaseService.setGardenLeave(body.id, !!body.value, auth));
    }
    if (body.action === 'set-settlement') {
      if (!body.id) return badRequest('id required');
      return ok(
        await separationCaseService.setSettlement(
          body.id,
          {
            settlementAgreementSigned: !!body.signed,
            settlementAmount: body.amount ? Number(body.amount) : undefined,
            eosbCalculationId: body.eosbCalculationId,
          },
          auth
        )
      );
    }
    if (body.action === 'link-visa-exit') {
      if (!body.id || !body.visaExitCaseId) return badRequest('id and visaExitCaseId required');
      return ok(await separationCaseService.setVisaExitLink(body.id, body.visaExitCaseId, auth));
    }
    if (body.action === 'set-si-closure') {
      if (!body.id || !body.siClosureRef) return badRequest('id and siClosureRef required');
      return ok(await separationCaseService.setSiClosure(body.id, body.siClosureRef, auth));
    }
    if (body.action === 'revoke-it') {
      if (!body.id) return badRequest('id required');
      return ok(await separationCaseService.revokeItAccess(body.id, auth));
    }
    if (body.action === 'close') {
      if (!body.id) return badRequest('id required');
      return ok(await separationCaseService.close(body.id, auth), 'Closed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update case', err);
  }
});
export const DELETE = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return badRequest('id required');
    await separationCaseService.delete(id, { tenantId: ctx.user.tenantId, userId: ctx.user.id });
    return ok({ id }, 'Deleted');
  } catch (err) {
    return serverError('Failed to delete case', err);
  }
});
