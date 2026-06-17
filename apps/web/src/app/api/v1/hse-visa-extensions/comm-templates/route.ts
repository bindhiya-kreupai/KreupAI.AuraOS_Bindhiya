import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { visaExitCommTemplateService } from '@/lib/services/hse-visa-extensions';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await visaExitCommTemplateService.list(
        ctx.user.tenantId,
        url.searchParams.get('trigger') ?? undefined
      )
    );
  } catch (err) {
    return serverError('Failed to list comm templates', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action !== 'upsert') return badRequest('unknown action');
    if (!body.templateCode || !body.trigger || !body.label) {
      return badRequest('templateCode/trigger/label required');
    }
    return ok(
      await visaExitCommTemplateService.upsert(
        {
          templateCode: body.templateCode,
          trigger: body.trigger,
          label: body.label,
          channels: body.channels,
          subjectEn: body.subjectEn,
          subjectAr: body.subjectAr,
          bodyEn: body.bodyEn,
          bodyAr: body.bodyAr,
          isActive: body.isActive,
        },
        auth
      ),
      'Saved'
    );
  } catch (err) {
    return serverError('Failed to update comm template', err);
  }
});
