import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { kpiCertificateService } from '@/lib/services/kpi-scorecard';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read')) return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await kpiCertificateService.list(ctx.user.tenantId, {
        period: url.searchParams.get('period') ?? undefined,
      })
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
      if (!body.period) return badRequest('period required');
      const data = await kpiCertificateService.generate(body.period, auth);
      return ok(data, 'Generated');
    }
    if (body.action === 'sign') {
      if (!body.period) return badRequest('period required');
      const data = await kpiCertificateService.sign(body.period, body.attestations ?? [], auth);
      return ok(data, 'Signed');
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update KPI certificate', err);
  }
});
