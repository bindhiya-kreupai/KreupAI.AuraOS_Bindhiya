import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { platformAlertService } from '@/lib/services/gcc-landscape';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'audit:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const ruleCode = url.searchParams.get('ruleCode') ?? undefined;
    const status = url.searchParams.get('status') ?? undefined;
    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
    return ok(
      await platformAlertService.listInstances(ctx.user.tenantId, { ruleCode, status, limit })
    );
  } catch (err) {
    return serverError('Failed to list alert instances', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'audit:read')) return forbidden();
  try {
    const body = await req.json();
    if (!body.ruleCode || !body.resourceType || !body.resourceId || !body.triggeredFor) {
      return ok({ fired: [] }, 'No-op: missing fields');
    }
    const data = await platformAlertService.fireIfDue(
      {
        ruleCode: body.ruleCode,
        resourceType: body.resourceType,
        resourceId: body.resourceId,
        triggeredFor: new Date(body.triggeredFor),
        currentDate: body.currentDate ? new Date(body.currentDate) : undefined,
        recipientUserId: body.recipientUserId,
        payload: body.payload,
      },
      { tenantId: ctx.user.tenantId, userId: ctx.user.id }
    );
    return ok(data, 'Evaluated');
  } catch (err) {
    return serverError('Failed to evaluate alert', err);
  }
});
