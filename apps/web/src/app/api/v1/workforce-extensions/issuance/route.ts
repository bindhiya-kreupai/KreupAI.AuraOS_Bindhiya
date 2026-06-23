import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { uniformPpeIssuanceService } from '@/lib/services/workforce-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await uniformPpeIssuanceService.list(
        ctx.user.tenantId,
        {
          employeeId: url.searchParams.get('employeeId') ?? undefined,
          category: (url.searchParams.get('category') as any) ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list issuance', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'issue') {
      if (!body.employeeId || !body.itemCode || !body.itemLabel) {
        return badRequest('employeeId/itemCode/itemLabel required');
      }
      return ok(
        await uniformPpeIssuanceService.issue(
          {
            employeeId: body.employeeId,
            itemCode: body.itemCode,
            itemLabel: body.itemLabel,
            category: body.category,
            quantity: body.quantity,
            notes: body.notes,
          },
          auth
        ),
        'Issued'
      );
    }
    if (body.action === 'return') {
      if (!body.id) return badRequest('id required');
      return ok(
        await uniformPpeIssuanceService.markReturned(body.id, body.condition, auth),
        'Marked returned'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update issuance', err);
  }
});
