import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  separationHandoverService,
  separationExitInterviewService,
} from '@/lib/services/separation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const resource = url.searchParams.get('resource') ?? 'handover';
    const paging = {
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
    };
    if (resource === 'exit-interview') {
      return ok(
        await separationExitInterviewService.list(
          ctx.user.tenantId,
          {
            caseId: url.searchParams.get('caseId') ?? undefined,
            status: url.searchParams.get('status') ?? undefined,
          },
          paging
        )
      );
    }
    return ok(
      await separationHandoverService.list(
        ctx.user.tenantId,
        {
          caseId: url.searchParams.get('caseId') ?? undefined,
          status: url.searchParams.get('status') ?? undefined,
        },
        paging
      )
    );
  } catch (err) {
    return serverError('Failed to list handover/exit-interview', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'add-item') {
      for (const f of ['caseId', 'itemDescription', 'itemType']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await separationHandoverService.add(body, auth), 'Added');
    }
    if (body.action === 'complete-item') {
      if (!body.id) return badRequest('id required');
      return ok(
        await separationHandoverService.complete(body.id, body.evidenceUrl, auth),
        'Completed'
      );
    }
    if (body.action === 'exit-interview') {
      if (!body.caseId) return badRequest('caseId required');
      return ok(
        await separationExitInterviewService.upsert(
          {
            ...body,
            conductedAt: body.conductedAt ? new Date(body.conductedAt) : undefined,
            satisfactionScore:
              body.satisfactionScore != null ? Number(body.satisfactionScore) : undefined,
          },
          auth
        ),
        'Saved'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update handover/exit-interview', err);
  }
});

export const DELETE = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return badRequest('id required');
    await separationHandoverService.delete(id, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok({ id }, 'Deleted');
  } catch (err) {
    return serverError('Failed to delete handover item', err);
  }
});
