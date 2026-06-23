import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { countryRulePackService } from '@/lib/services/gcc-rule-library';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const countryCode = url.searchParams.get('countryCode') ?? undefined;
    const status = url.searchParams.get('status') ?? undefined;
    const action = url.searchParams.get('action');
    if (action === 'versions') {
      if (!countryCode) return badRequest('countryCode required');
      return ok(await countryRulePackService.listVersions(countryCode));
    }
    if (action === 'active') {
      if (!countryCode) return badRequest('countryCode required');
      return ok(await countryRulePackService.getActivePack(countryCode));
    }
    if (action === 'resolve') {
      const domain = url.searchParams.get('domain');
      const ruleKey = url.searchParams.get('ruleKey');
      if (!countryCode || !domain || !ruleKey)
        return badRequest('countryCode/domain/ruleKey required');
      return ok(await countryRulePackService.resolveRule(countryCode, domain, ruleKey));
    }
    return ok(await countryRulePackService.listAll(status));
  } catch (err) {
    return serverError('Failed to load rule packs', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'seed-themes') {
      const data = await countryRulePackService.seedThemes();
      return ok(data, 'Themes seeded');
    }
    if (body.action === 'seed-authored') {
      const data = await countryRulePackService.seedAuthoredRulePacks(auth);
      return ok(data, 'Rule packs seeded');
    }
    if (body.action === 'publish') {
      if (!body.rulePackId) return badRequest('rulePackId required');
      const data = await countryRulePackService.publish(
        body.rulePackId,
        body.effectiveFrom ? new Date(body.effectiveFrom) : new Date(),
        auth
      );
      return ok(data, 'Published');
    }
    if (body.action === 'add-rule') {
      if (!body.rulePackId || !body.rule) return badRequest('rulePackId/rule required');
      const data = await countryRulePackService.addOrUpdateRule(body.rulePackId, body.rule, auth);
      return ok(data, 'Rule saved');
    }
    if (body.action === 'create-draft') {
      if (!body.countryCode || !body.title || !body.summary) {
        return badRequest('countryCode/title/summary required');
      }
      const data = await countryRulePackService.createDraft(
        {
          countryCode: body.countryCode,
          title: body.title,
          summary: body.summary,
          rules: body.rules ?? [],
        },
        auth
      );
      return ok(data, 'Draft created');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update rule pack', err);
  }
});
