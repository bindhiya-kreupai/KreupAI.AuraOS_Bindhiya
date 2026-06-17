import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrFormSubmissionService } from '@/lib/services/hr-forms-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hrFormSubmissionService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
        templateId: url.searchParams.get('templateId') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list submissions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'start') {
      for (const f of ['templateId', 'submissionRef', 'employeeId']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await hrFormSubmissionService.start({ ...body, payload: body.payload ?? {} }, auth),
        'Started'
      );
    }
    if (body.action === 'submit') {
      if (!body.id) return badRequest('id required');
      return ok(await hrFormSubmissionService.submit(body.id, auth), 'Submitted');
    }
    if (body.action === 'approve') {
      if (!body.id) return badRequest('id required');
      return ok(
        await hrFormSubmissionService.approveStage({ id: body.id, comments: body.comments }, auth),
        'Approved'
      );
    }
    if (body.action === 'reject') {
      if (!body.id || !body.reason) return badRequest('id and reason required');
      return ok(
        await hrFormSubmissionService.reject({ id: body.id, reason: body.reason }, auth),
        'Rejected'
      );
    }
    if (body.action === 'mark-writeback') {
      if (!body.id || !body.status) return badRequest('id and status required');
      return ok(
        await hrFormSubmissionService.markWriteback(
          { id: body.id, status: body.status, writebackRef: body.writebackRef },
          auth
        ),
        'Marked'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update submission', err);
  }
});
