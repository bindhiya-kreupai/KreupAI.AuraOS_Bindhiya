import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { taComplianceCertificateService } from '@/lib/services/talent-acquisition-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'ta_compliance:read', 'recruitment:read', 'dashboard:read'))
    return forbidden();
  try {
    return ok(await taComplianceCertificateService.list(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list TA certificates', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'ta_compliance:manage', 'recruitment:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'generate') {
      if (!body.period) return badRequest('period required');
      return ok(await taComplianceCertificateService.generate(body.period, auth), 'Generated');
    }
    if (body.action === 'sign') {
      if (!body.period) return badRequest('period required');
      return ok(
        await taComplianceCertificateService.sign(body.period, body.attestations ?? [], auth),
        'Signed'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update TA certificate', err);
  }
});
