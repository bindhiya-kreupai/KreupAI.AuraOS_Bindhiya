import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { renewalAlertService } from '@/lib/services/immigration-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:read', 'immigration:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await renewalAlertService.list(
        ctx.user.tenantId,
        {
          status: url.searchParams.get('status') ?? undefined,
          window: url.searchParams.get('window') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list renewal alerts', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:manage', 'immigration:manage'))
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      if (!body.subjectId || !body.country || !body.documentCode || !body.expiresAt)
        return badRequest('subjectId, country, documentCode, expiresAt required');
      const out = await renewalAlertService.raise(
        {
          subjectType: body.subjectType,
          subjectId: body.subjectId,
          country: body.country,
          documentCode: body.documentCode,
          permitId: body.permitId,
          expiresAt: new Date(body.expiresAt),
        },
        auth
      );
      return ok(out, out ? 'Alert raised' : 'No alert (outside windows)');
    }
    if (body.action === 'acknowledge') {
      if (!body.id) return badRequest('id required');
      return ok(await renewalAlertService.acknowledge(body.id, auth), 'Acknowledged');
    }
    if (body.action === 'mark-renewed') {
      if (!body.id) return badRequest('id required');
      return ok(await renewalAlertService.markRenewed(body.id, auth), 'Renewed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update renewal alert', err);
  }
});
