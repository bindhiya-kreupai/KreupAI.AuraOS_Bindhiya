import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  comparisonService,
  countryComplianceCertificateService,
  countryRiskMatrixService,
  countryRulePackService,
} from '@/lib/services/gcc-rule-library';
import { forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'dashboard:read', 'compliance_kpi:read', 'tenant:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') ?? undefined;
    const overview = await comparisonService.overview();
    const risks = await countryRiskMatrixService.list(ctx.user.tenantId, {});
    const certs = await countryComplianceCertificateService.list(
      ctx.user.tenantId,
      period ? { period } : {}
    );
    const packs = await countryRulePackService.listAll('ACTIVE');
    return ok({ overview, risks, certs, packs });
  } catch (err) {
    return serverError('Failed to load rule-library dashboard', err);
  }
});
