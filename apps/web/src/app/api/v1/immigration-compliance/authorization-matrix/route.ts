import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { authorizationMatrixService } from '@/lib/services/immigration-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:read', 'immigration:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await authorizationMatrixService.list(
        ctx.user.tenantId,
        {
          country: url.searchParams.get('country') ?? undefined,
          appliesTo: url.searchParams.get('appliesTo') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list authorization matrix', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'immigration_compliance:manage', 'immigration:manage'))
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.country || !body.documentCode || !body.label)
        return badRequest('country, documentCode, label required');
      return ok(await authorizationMatrixService.upsert(body, auth), 'Saved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update authorization matrix', err);
  }
});
