import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { successionPoolService } from '@/lib/services/org-design';
import { forbidden, hasAny, notFound, ok, serverError, type RouteContext } from '../../_shared';

export const dynamic = 'force-dynamic';

export const PUT = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org-chart:manage', 'organization:manage')) return forbidden();
  try {
    const id = req.nextUrl.pathname.split('/').pop() as string;
    const body = await req.json();
    const updated = await successionPoolService.update(
      ctx.user.tenantId,
      ctx.user.userId,
      id,
      body
    );
    if (!updated) return notFound('Succession pool not found', 'مجموعة التعاقب غير موجودة');
    return ok(updated);
  } catch (err) {
    return serverError('Failed to update succession pool', err);
  }
});

export const DELETE = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org-chart:manage', 'organization:manage')) return forbidden();
  try {
    const id = req.nextUrl.pathname.split('/').pop() as string;
    const removed = await successionPoolService.remove(ctx.user.tenantId, ctx.user.userId, id);
    if (!removed) return notFound('Succession pool not found', 'مجموعة التعاقب غير موجودة');
    return ok({ id, deleted: true });
  } catch (err) {
    return serverError('Failed to delete succession pool', err);
  }
});
