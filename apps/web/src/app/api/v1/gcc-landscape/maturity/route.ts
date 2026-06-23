import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { digitalMaturityService } from '@/lib/services/gcc-landscape';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') ?? undefined;
    if (url.searchParams.get('action') === 'domains') {
      return ok(await digitalMaturityService.listDomains());
    }
    return ok(await digitalMaturityService.scorecard(ctx.user.tenantId, period));
  } catch (err) {
    return serverError('Failed to load digital-maturity scorecard', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:manage', 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    if (body.action === 'seed-domains') {
      return ok(await digitalMaturityService.seedDomains(), 'Domains seeded');
    }
    for (const field of ['domainCode', 'period', 'currentLevel', 'targetLevel']) {
      if (body[field] == null) return badRequest(`${field} is required`);
    }
    const data = await digitalMaturityService.upsert(body, {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
    });
    return ok(data, 'Maturity snapshot saved');
  } catch (err) {
    return serverError('Failed to save maturity snapshot', err);
  }
});
