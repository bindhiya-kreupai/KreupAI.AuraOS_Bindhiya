import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceRegisterTimelineService } from '@/lib/services/compliance-audit-register';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const targetType = url.searchParams.get('targetType');
    const targetId = url.searchParams.get('targetId');

    if (!targetType || !targetId) {
      return badRequest('targetType and targetId are required');
    }

    const data = await complianceRegisterTimelineService.list(
      ctx.user.tenantId,
      targetType,
      targetId
    );
    return ok(data);
  } catch (err) {
    return serverError('Failed to list audit timeline events', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (!body.targetType || !body.targetId || !body.eventType || !body.title) {
      return badRequest('targetType, targetId, eventType, and title are required');
    }

    const data = await complianceRegisterTimelineService.create(
      {
        targetType: body.targetType,
        targetId: body.targetId,
        eventType: body.eventType,
        title: body.title,
        description: body.description,
        userName: (ctx.user as any).name ?? ctx.user.id,
      },
      auth
    );
    return ok(data, 'Timeline event registered');
  } catch (err) {
    return serverError('Failed to register audit timeline event', err);
  }
});
