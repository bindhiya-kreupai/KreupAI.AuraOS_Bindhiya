import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { gpssaProcessService } from '@/lib/services/gpssa-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await gpssaProcessService.list(ctx.user.tenantId, {
        period: url.searchParams.get('period') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list submissions', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'payroll:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'build') {
      if (!body.establishmentId || !body.period)
        return badRequest('establishmentId/period required');
      return ok(await gpssaProcessService.build(body, auth), 'Built');
    }
    if (body.action === 'submit') {
      if (!body.submissionId) return badRequest('submissionId required');
      return ok(
        await gpssaProcessService.submit(
          body.submissionId,
          body.submittedAt ? new Date(body.submittedAt) : new Date(),
          auth
        ),
        'Submitted'
      );
    }
    if (body.action === 'acknowledge') {
      if (!body.submissionId || !body.ackReference) return badRequest('submissionId/ack required');
      return ok(
        await gpssaProcessService.acknowledge(body.submissionId, body.ackReference, auth),
        'Acknowledged'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update submission', err);
  }
});
