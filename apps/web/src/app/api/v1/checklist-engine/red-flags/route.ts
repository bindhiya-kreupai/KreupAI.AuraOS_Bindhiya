import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { checklistTemplateService, redFlagService } from '@/lib/services/checklist-engine';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'risk_register:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    if (url.searchParams.get('action') === 'rules') {
      return ok(
        await checklistTemplateService.listRedFlagRules(ctx.user.tenantId, {
          domain: url.searchParams.get('domain') ?? undefined,
        })
      );
    }
    return ok(
      await redFlagService.list(
        ctx.user.tenantId,
        {
          domain: url.searchParams.get('domain') ?? undefined,
          severity: url.searchParams.get('severity') ?? undefined,
          status: url.searchParams.get('status') ?? undefined,
          sourceId: url.searchParams.get('sourceId') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list red flags', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'risk_register:manage', 'tenant:manage'))
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'raise') {
      for (const f of ['ruleCode', 'domain', 'severity', 'sourceType', 'sourceId']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(await redFlagService.raiseFlag(body, auth), 'Flag raised');
    }
    if (body.action === 'clear') {
      if (!body.flagId) return badRequest('flagId required');
      return ok(await redFlagService.clearFlag(body.flagId), 'Cleared');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update red flag', err);
  }
});
