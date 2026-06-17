import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { separationClearanceService } from '@/lib/services/separation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await separationClearanceService.list(ctx.user.tenantId, {
        caseId: url.searchParams.get('caseId') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list clearances', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'update') {
      if (!body.id || body.completedItems == null)
        return badRequest('id and completedItems required');
      return ok(
        await separationClearanceService.updateChecklist(
          body.id,
          Number(body.completedItems),
          body.blockerNotes,
          auth
        ),
        'Updated'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update clearance', err);
  }
});
