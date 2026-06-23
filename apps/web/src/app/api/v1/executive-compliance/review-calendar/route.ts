import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceReviewCalendarService } from '@/lib/services/executive-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await complianceReviewCalendarService.list(
        ctx.user.tenantId,
        {
          overdueOnly: url.searchParams.get('overdueOnly') === 'true',
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list calendar items', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      for (const f of ['title', 'domain', 'dueAt']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await complianceReviewCalendarService.upsert(
          { ...body, dueAt: new Date(body.dueAt) },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'complete') {
      if (!body.id) return badRequest('id required');
      return ok(await complianceReviewCalendarService.complete(body.id, auth), 'Rolled forward');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update calendar item', err);
  }
});
