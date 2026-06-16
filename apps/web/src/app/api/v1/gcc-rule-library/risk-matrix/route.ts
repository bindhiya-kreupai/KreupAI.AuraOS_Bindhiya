import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { countryRiskMatrixService } from '@/lib/services/gcc-rule-library';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:read', 'risk_register:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const filter = {
      countryCode: url.searchParams.get('countryCode') ?? undefined,
      rating: url.searchParams.get('rating') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
    };
    return ok(await countryRiskMatrixService.list(ctx.user.tenantId, filter));
  } catch (err) {
    return serverError('Failed to load country risk matrix', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'seed-regional') {
      const data = await countryRiskMatrixService.seedRegional({
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
      });
      return ok(data, 'Country risks seeded');
    }
    for (const field of [
      'countryCode',
      'riskCode',
      'title',
      'description',
      'domain',
      'likelihood',
      'impact',
      'ownerRole',
    ]) {
      if (body[field] == null) return badRequest(`${field} is required`);
    }
    const data = await countryRiskMatrixService.upsert(body, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok(data, 'Country risk saved');
  } catch (err) {
    return serverError('Failed to save country risk', err);
  }
});
