import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { visaExitProActionService } from '@/lib/services/visa-exit-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await visaExitProActionService.list(ctx.user.tenantId, {
        caseId: url.searchParams.get('caseId') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list actions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'complete') {
      if (!body.id) return badRequest('id required');
      return ok(await visaExitProActionService.complete(body.id, body.notes, auth), 'Completed');
    }
    if (body.action === 'assign') {
      if (!body.id || !body.assigneeId) return badRequest('id and assigneeId required');
      return ok(await visaExitProActionService.assign(body.id, body.assigneeId, auth));
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update action', err);
  }
});
