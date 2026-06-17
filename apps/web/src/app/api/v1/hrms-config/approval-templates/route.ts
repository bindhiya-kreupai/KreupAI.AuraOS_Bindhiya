import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { approvalWorkflowTemplateService } from '@/lib/services/hrms-config';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hrms_config:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const isActive = url.searchParams.get('isActive');
    return ok(
      await approvalWorkflowTemplateService.list(ctx.user.tenantId, {
        domain: url.searchParams.get('domain') ?? undefined,
        country: url.searchParams.get('country') ?? undefined,
        isActive: isActive === null ? undefined : isActive === 'true',
      })
    );
  } catch (err) {
    return serverError('Failed to list approval templates', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hrms_config:manage', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert') {
      if (!body.templateCode || !body.label || !body.domain || !Array.isArray(body.stagesJson))
        return badRequest('templateCode, label, domain, stagesJson required');
      return ok(
        await approvalWorkflowTemplateService.upsert(
          {
            templateCode: body.templateCode,
            label: body.label,
            domain: body.domain,
            country: body.country,
            stagesJson: body.stagesJson,
            escalationHours: body.escalationHours,
            autoApproveWhen: body.autoApproveWhen,
            isActive: body.isActive,
          },
          auth
        ),
        'Saved'
      );
    }
    if (body.action === 'deactivate') {
      if (!body.id) return badRequest('id required');
      return ok(await approvalWorkflowTemplateService.deactivate(body.id, auth), 'Deactivated');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update approval template', err);
  }
});
