import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { orgPositionControlService } from '@/lib/services/org-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org_compliance:read', 'organization:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await orgPositionControlService.list(
        ctx.user.tenantId,
        {
          period: url.searchParams.get('period') ?? undefined,
          departmentId: url.searchParams.get('departmentId') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list position control', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org_compliance:manage', 'organization:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (
        !body.period ||
        body.budgetedHeadcount == null ||
        body.approvedHeadcount == null ||
        body.filledHeadcount == null
      )
        return badRequest('period, budgeted, approved, filled required');
      return ok(await orgPositionControlService.upsert(body, auth), 'Saved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update position control', err);
  }
});
