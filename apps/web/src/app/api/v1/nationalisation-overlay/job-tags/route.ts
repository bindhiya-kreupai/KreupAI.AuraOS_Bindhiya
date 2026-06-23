import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { nationalisationJobTagService } from '@/lib/services/nationalisation-overlay';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await nationalisationJobTagService.list(
        ctx.user.tenantId,
        {
          program: url.searchParams.get('program') ?? undefined,
          eligibility: url.searchParams.get('eligibility') ?? undefined,
          targetType: url.searchParams.get('targetType') ?? undefined,
          targetId: url.searchParams.get('targetId') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list job tags', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.targetType || !body.targetId || !body.program) {
        return badRequest('targetType/targetId/program required');
      }
      return ok(
        await nationalisationJobTagService.upsert(
          {
            targetType: body.targetType,
            targetId: body.targetId,
            program: body.program,
            eligibility: body.eligibility,
            reservedSeats: body.reservedSeats,
            professionCode: body.professionCode,
            notes: body.notes,
          },
          auth
        ),
        'Tag saved'
      );
    }
    if (body.action === 'remove') {
      if (!body.id) return badRequest('id required');
      return ok(await nationalisationJobTagService.remove(body.id, auth), 'Removed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update job tag', err);
  }
});
