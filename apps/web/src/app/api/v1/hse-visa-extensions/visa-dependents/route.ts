import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { visaExitDependentService } from '@/lib/services/hse-visa-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await visaExitDependentService.list(
        ctx.user.tenantId,
        {
          visaExitCaseId: url.searchParams.get('visaExitCaseId') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list dependents', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'add') {
      if (!body.visaExitCaseId || !body.dependentName || !body.relationship) {
        return badRequest('visaExitCaseId/dependentName/relationship required');
      }
      return ok(
        await visaExitDependentService.addDependent(
          {
            visaExitCaseId: body.visaExitCaseId,
            dependentName: body.dependentName,
            relationship: body.relationship,
            visaNumber: body.visaNumber,
          },
          auth
        ),
        'Added'
      );
    }
    if (body.action === 'mark-cancelled') {
      if (!body.id) return badRequest('id required');
      return ok(
        await visaExitDependentService.markCancelled(body.id, body.evidenceUrl, auth),
        'Marked cancelled'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update dependent', err);
  }
});
