import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { comparisonService, type ComparisonDomain } from '@/lib/services/gcc-rule-library';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const ALLOWED: ComparisonDomain[] = [
  'PAYROLL',
  'SOCIAL_INSURANCE',
  'NATIONALIZATION',
  'IMMIGRATION',
  'EOSB',
];

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'dashboard:read', 'tenant:read', 'compliance_kpi:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const domain = (url.searchParams.get('domain') ?? '').toUpperCase() as ComparisonDomain;
    if (domain === ('OVERVIEW' as ComparisonDomain)) {
      return ok(await comparisonService.overview());
    }
    if (!ALLOWED.includes(domain)) return badRequest(`domain must be one of ${ALLOWED.join(', ')}`);
    return ok(await comparisonService.build(domain));
  } catch (err) {
    return serverError('Failed to build comparison', err);
  }
});
