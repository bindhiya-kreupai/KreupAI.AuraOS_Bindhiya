import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { complianceRiskRegisterService } from '@/lib/services/gcc-landscape';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:read', 'risk_register:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const filter = {
      rating: url.searchParams.get('rating') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      countryCode: url.searchParams.get('countryCode') ?? undefined,
    };
    return ok(await complianceRiskRegisterService.list(ctx.user.tenantId, filter));
  } catch (err) {
    return serverError('Failed to list risk register', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:manage')) return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'seed-regional') {
      return ok(
        await complianceRiskRegisterService.seedRegionalRisks({
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
        }),
        'Regional risks seeded'
      );
    }
    for (const field of [
      'riskCode',
      'category',
      'title',
      'description',
      'likelihood',
      'impact',
      'ownerRole',
    ]) {
      if (body[field] == null) return badRequest(`${field} is required`);
    }
    const data = await complianceRiskRegisterService.upsert(body, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok(data, 'Risk saved');
  } catch (err) {
    return serverError('Failed to save risk', err);
  }
});
