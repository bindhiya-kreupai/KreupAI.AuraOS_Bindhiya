import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { notificationRuleService } from '@/lib/services/hrms-config';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hrms_config:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const isActive = url.searchParams.get('isActive');
    return ok(
      await notificationRuleService.list(ctx.user.tenantId, {
        domain: url.searchParams.get('domain') ?? undefined,
        trigger: url.searchParams.get('trigger') ?? undefined,
        isActive: isActive === null ? undefined : isActive === 'true',
      })
    );
  } catch (err) {
    return serverError('Failed to list notification rules', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hrms_config:manage', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.ruleCode || !body.label || !body.domain || !body.trigger)
        return badRequest('ruleCode, label, domain, trigger required');
      return ok(
        await notificationRuleService.upsert(
          {
            ruleCode: body.ruleCode,
            label: body.label,
            domain: body.domain,
            trigger: body.trigger,
            channelsJson: Array.isArray(body.channelsJson) ? body.channelsJson : [],
            recipientRoles: Array.isArray(body.recipientRoles) ? body.recipientRoles : [],
            templateText: body.templateText,
            templateTextAr: body.templateTextAr,
            severity: body.severity,
            isActive: body.isActive,
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'deactivate') {
      if (!body.id) return badRequest('id required');
      return ok(await notificationRuleService.deactivate(body.id, auth), 'Deactivated');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update notification rule', err);
  }
});
