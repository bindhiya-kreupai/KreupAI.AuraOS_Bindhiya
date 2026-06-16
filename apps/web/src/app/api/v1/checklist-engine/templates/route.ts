import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { checklistTemplateService } from '@/lib/services/checklist-engine';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'tenant:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    if (code) return ok(await checklistTemplateService.getActiveByCode(ctx.user.tenantId, code));
    return ok(
      await checklistTemplateService.list(ctx.user.tenantId, {
        domain: url.searchParams.get('domain') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to list templates', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed-red-flag-rules')
      return ok(await checklistTemplateService.seedRedFlagRules(auth));
    if (body.action === 'seed-templates')
      return ok(await checklistTemplateService.seedTemplates(auth));
    if (body.action === 'approve') {
      if (!body.templateId) return badRequest('templateId required');
      return ok(await checklistTemplateService.approve(body.templateId, auth), 'Approved');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update template', err);
  }
});
