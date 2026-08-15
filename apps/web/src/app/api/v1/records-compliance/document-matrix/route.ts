import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { recordsDocumentMatrixService } from '@/lib/services/records-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'records_compliance:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await recordsDocumentMatrixService.list(
        ctx.user.tenantId,
        {
          country: url.searchParams.get('country') ?? undefined,
          category: url.searchParams.get('category') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list document matrix', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'records_compliance:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.country || !body.documentCode || !body.label || !body.category)
        return badRequest('country, documentCode, label, category required');
      return ok(await recordsDocumentMatrixService.upsert(body, auth), 'Saved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update document matrix', err);
  }
});

export const DELETE = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'records_compliance:manage', 'employee:manage')) return forbidden();
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return badRequest('id required');
    await recordsDocumentMatrixService.delete(id, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok({ id }, 'Deleted');
  } catch (err) {
    return serverError('Failed to delete document matrix item', err);
  }
});
