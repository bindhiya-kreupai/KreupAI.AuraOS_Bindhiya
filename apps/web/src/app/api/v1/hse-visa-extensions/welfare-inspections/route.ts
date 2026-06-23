import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hseWelfareInspectionService } from '@/lib/services/hse-visa-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hseWelfareInspectionService.list(
        ctx.user.tenantId,
        {
          siteId: url.searchParams.get('siteId') ?? undefined,
          result: url.searchParams.get('result') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list welfare inspections', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action !== 'record') return badRequest('unknown action');
    if (!body.siteId || !body.inspectionCode || !body.scope || !body.inspectedAt || !body.result) {
      return badRequest('siteId/inspectionCode/scope/inspectedAt/result required');
    }
    return ok(
      await hseWelfareInspectionService.record(
        {
          siteId: body.siteId,
          inspectionCode: body.inspectionCode,
          scope: body.scope,
          inspectedAt: new Date(body.inspectedAt),
          findings: body.findings,
          result: body.result,
        },
        auth
      ),
      'Recorded'
    );
  } catch (err) {
    return serverError('Failed to record welfare inspection', err);
  }
});
