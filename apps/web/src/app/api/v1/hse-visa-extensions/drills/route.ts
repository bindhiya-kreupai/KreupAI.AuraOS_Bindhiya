import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hseEmergencyDrillService } from '@/lib/services/hse-visa-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hseEmergencyDrillService.list(ctx.user.tenantId, {
        siteId: url.searchParams.get('siteId') ?? undefined,
        result: url.searchParams.get('result') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list drills', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'schedule') {
      if (!body.siteId || !body.drillCode || !body.drillType || !body.scheduledAt) {
        return badRequest('siteId/drillCode/drillType/scheduledAt required');
      }
      return ok(
        await hseEmergencyDrillService.schedule(
          {
            siteId: body.siteId,
            drillCode: body.drillCode,
            drillType: body.drillType,
            scheduledAt: new Date(body.scheduledAt),
          },
          auth
        ),
        'Scheduled'
      );
    }
    if (body.action === 'record-result') {
      if (!body.id || !body.conductedAt || !body.result) {
        return badRequest('id/conductedAt/result required');
      }
      return ok(
        await hseEmergencyDrillService.recordResult(
          body.id,
          {
            conductedAt: new Date(body.conductedAt),
            evacuationTimeSeconds: body.evacuationTimeSeconds,
            participantCount: body.participantCount,
            findings: body.findings,
            result: body.result,
          },
          auth
        ),
        'Recorded'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update drill', err);
  }
});
