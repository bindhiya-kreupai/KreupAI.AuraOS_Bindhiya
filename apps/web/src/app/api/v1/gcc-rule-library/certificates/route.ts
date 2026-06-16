import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { countryComplianceCertificateService } from '@/lib/services/gcc-rule-library';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read', 'tenant:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') ?? undefined;
    const countryCode = url.searchParams.get('countryCode') ?? undefined;
    return ok(
      await countryComplianceCertificateService.list(ctx.user.tenantId, { period, countryCode })
    );
  } catch (err) {
    return serverError('Failed to list certificates', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:manage', 'tenant:manage', 'compliance_kpi:read'))
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'generate') {
      if (!body.countryCode || !body.period) return badRequest('countryCode/period required');
      const data = await countryComplianceCertificateService.generate(
        body.countryCode,
        body.period,
        body.domainStatus,
        auth
      );
      return ok(data, 'Generated');
    }
    if (body.action === 'sign') {
      if (!body.countryCode || !body.period) return badRequest('countryCode/period required');
      const data = await countryComplianceCertificateService.sign(
        body.countryCode,
        body.period,
        body.attestations ?? [],
        auth
      );
      return ok(data, 'Signed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update certificate', err);
  }
});
