import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { docDisposalService } from '@/lib/services/document-retention-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await docDisposalService.list(ctx.user.tenantId, {
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list disposal', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'request') {
      if (!Array.isArray(body.documentIds) || !body.reason)
        return badRequest('documentIds and reason required');
      return ok(
        await docDisposalService.request(
          { documentIds: body.documentIds, reason: body.reason },
          auth
        ),
        'Requested'
      );
    }
    if (body.action === 'approve') {
      if (!body.id) return badRequest('id required');
      return ok(await docDisposalService.approve(body.id, auth), 'Approved');
    }
    if (body.action === 'execute') {
      if (!body.id) return badRequest('id required');
      return ok(await docDisposalService.execute(body.id, auth), 'Executed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update disposal', err);
  }
});
