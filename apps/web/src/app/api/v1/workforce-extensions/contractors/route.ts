import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { contractorAssignmentService } from '@/lib/services/workforce-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await contractorAssignmentService.list(ctx.user.tenantId, {
        domain: (url.searchParams.get('domain') as any) ?? undefined,
        status: (url.searchParams.get('status') as any) ?? undefined,
        siteId: url.searchParams.get('siteId') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list contractor assignments', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.subjectId || !body.subjectName || !body.domain || !body.startDate) {
        return badRequest('subjectId/subjectName/domain/startDate required');
      }
      return ok(
        await contractorAssignmentService.upsert(
          {
            subjectId: body.subjectId,
            subjectName: body.subjectName,
            domain: body.domain,
            startDate: new Date(body.startDate),
            endDate: body.endDate ? new Date(body.endDate) : undefined,
            vendorId: body.vendorId,
            vendorName: body.vendorName,
            contractRef: body.contractRef,
            siteId: body.siteId,
            notes: body.notes,
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'terminate') {
      if (!body.id) return badRequest('id required');
      return ok(await contractorAssignmentService.terminate(body.id, auth), 'Terminated');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update contractor assignment', err);
  }
});
