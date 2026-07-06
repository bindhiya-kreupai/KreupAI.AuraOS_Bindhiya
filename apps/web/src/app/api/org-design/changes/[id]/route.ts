import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { changeManagementService } from '@/lib/services/org-design';
import { forbidden, hasAny, notFound, ok, serverError, type RouteContext } from '../../_shared';

export const dynamic = 'force-dynamic';

export const PUT = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org-chart:manage', 'organization:manage')) return forbidden();
  try {
    const id = req.nextUrl.pathname.split('/').pop() as string;
    const body = await req.json();
    const updated = await changeManagementService.update(
      ctx.user.tenantId,
      ctx.user.userId,
      id,
      body
    );
    if (!updated) return notFound('Change initiative not found', 'مبادرة التغيير غير موجودة');
    return ok(updated);
  } catch (err) {
    return serverError('Failed to update change initiative', err);
  }
});

export const DELETE = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'org-chart:manage', 'organization:manage')) return forbidden();
  try {
    const id = req.nextUrl.pathname.split('/').pop() as string;
    const removed = await changeManagementService.remove(ctx.user.tenantId, ctx.user.userId, id);
    if (!removed) return notFound('Change initiative not found', 'مبادرة التغيير غير موجودة');
    return ok({ id, deleted: true });
  } catch (err) {
    return serverError('Failed to delete change initiative', err);
  }
});
