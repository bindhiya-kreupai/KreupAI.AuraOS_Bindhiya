import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { nationalisationRequisitionTagService } from '@/lib/services/nationalisation-overlay';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await nationalisationRequisitionTagService.list(ctx.user.tenantId, {
        program: url.searchParams.get('program') ?? undefined,
        eligibility: url.searchParams.get('eligibility') ?? undefined,
        isReservedSeat:
          url.searchParams.get('isReservedSeat') === null
            ? undefined
            : url.searchParams.get('isReservedSeat') === 'true',
        requisitionId: url.searchParams.get('requisitionId') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list requisition tags', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.requisitionId || !body.program) {
        return badRequest('requisitionId/program required');
      }
      return ok(
        await nationalisationRequisitionTagService.upsert(
          {
            requisitionId: body.requisitionId,
            program: body.program,
            eligibility: body.eligibility,
            isReservedSeat: body.isReservedSeat,
            targetShareNationals: body.targetShareNationals,
            sourceChannel: body.sourceChannel,
            notes: body.notes,
          },
          auth
        ),
        'Tag saved'
      );
    }
    if (body.action === 'remove') {
      if (!body.id) return badRequest('id required');
      return ok(await nationalisationRequisitionTagService.remove(body.id, auth), 'Removed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update requisition tag', err);
  }
});
