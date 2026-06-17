import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hseHeatStressRuleService } from '@/lib/services/hse-visa-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await hseHeatStressRuleService.list(
        ctx.user.tenantId,
        url.searchParams.get('country') ?? undefined
      )
    );
  } catch (err) {
    return serverError('Failed to list heat-stress rules', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action !== 'upsert') return badRequest('unknown action');
    if (
      !body.country ||
      body.month == null ||
      body.noOutdoorWorkFromHour == null ||
      body.noOutdoorWorkToHour == null ||
      !body.effectiveFrom
    ) {
      return badRequest('country/month/hours/effectiveFrom required');
    }
    return ok(
      await hseHeatStressRuleService.upsert(
        {
          country: body.country,
          month: body.month,
          noOutdoorWorkFromHour: body.noOutdoorWorkFromHour,
          noOutdoorWorkToHour: body.noOutdoorWorkToHour,
          effectiveFrom: new Date(body.effectiveFrom),
          effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
          regulatorRef: body.regulatorRef,
          notes: body.notes,
        },
        auth
      ),
      'Saved'
    );
  } catch (err) {
    return serverError('Failed to update heat-stress rule', err);
  }
});
