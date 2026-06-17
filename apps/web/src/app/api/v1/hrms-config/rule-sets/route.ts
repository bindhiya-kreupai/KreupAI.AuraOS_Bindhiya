import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { countryRuleSetService } from '@/lib/services/hrms-config';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hrms_config:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await countryRuleSetService.list(
        ctx.user.tenantId,
        {
          country: url.searchParams.get('country') ?? undefined,
          domain: url.searchParams.get('domain') ?? undefined,
          status: url.searchParams.get('status') ?? undefined,
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list rule sets', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hrms_config:manage', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'upsert-draft') {
      if (!body.country || !body.domain || !body.version || !body.effectiveFrom)
        return badRequest('country, domain, version, effectiveFrom required');
      return ok(
        await countryRuleSetService.upsertDraft(
          {
            country: body.country,
            domain: body.domain,
            version: body.version,
            effectiveFrom: new Date(body.effectiveFrom),
            effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
            rulesJson: body.rulesJson ?? {},
          },
          auth
        ),
        'Draft saved'
      );
    }
    if (body.action === 'publish') {
      if (!body.id) return badRequest('id required');
      return ok(await countryRuleSetService.publish(body.id, auth), 'Published');
    }
    if (body.action === 'active') {
      if (!body.country || !body.domain) return badRequest('country, domain required');
      return ok(
        await countryRuleSetService.active(
          ctx.user.tenantId,
          body.country,
          body.domain,
          body.at ? new Date(body.at) : undefined
        )
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update rule set', err);
  }
});
