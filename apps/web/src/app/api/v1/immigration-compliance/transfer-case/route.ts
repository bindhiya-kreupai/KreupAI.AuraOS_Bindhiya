import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { transferCaseService } from '@/lib/services/immigration-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:read', 'immigration:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await transferCaseService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          transferType: url.searchParams.get('transferType') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list transfer cases', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:manage', 'immigration:manage'))
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      if (!body.caseNumber || !body.employeeId || !body.transferType)
        return badRequest('caseNumber, employeeId, transferType required');
      return ok(await transferCaseService.raise(body, auth), 'Raised');
    }
    if (body.action === 'approve') {
      if (!body.id) return badRequest('id required');
      return ok(await transferCaseService.approve(body.id, auth), 'Approved');
    }
    if (body.action === 'complete') {
      if (!body.id) return badRequest('id required');
      return ok(await transferCaseService.complete(body.id, auth), 'Completed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update transfer case', err);
  }
});
