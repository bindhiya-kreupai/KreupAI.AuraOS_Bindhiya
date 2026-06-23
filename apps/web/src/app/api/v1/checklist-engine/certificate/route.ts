import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { checklistCertificateService } from '@/lib/services/checklist-engine';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read', 'audit:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await checklistCertificateService.list(ctx.user.tenantId, {
        scope: url.searchParams.get('scope') ?? undefined,
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
      if (!body.scope || !body.period) return badRequest('scope/period required');
      return ok(
        await checklistCertificateService.generate(body.scope, body.period, auth),
        'Generated'
      );
    }
    if (body.action === 'sign') {
      if (!body.scope || !body.period) return badRequest('scope/period required');
      return ok(
        await checklistCertificateService.sign(
          body.scope,
          body.period,
          body.attestations ?? [],
          auth
        ),
        'Signed'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update certificate', err);
  }
});
