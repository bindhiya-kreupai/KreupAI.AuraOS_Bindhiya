import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { accommodationCertificateService } from '@/lib/services/accommodation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles.includes('SUPER_ADMIN') &&
    !ctx.roles.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'compliance_kpi:read', 'dashboard:read', 'employees:read')
  )
    return forbidden();
  try {
    return ok(await accommodationCertificateService.list(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list certificates', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !ctx.roles.includes('SUPER_ADMIN') &&
    !ctx.roles.includes('ADMIN') &&
    !hasAny(ctx.permissions, 'tenant:manage', 'risk_register:manage', 'employees:manage')
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'generate') {
      if (!body.period) return badRequest('period required');
      return ok(await accommodationCertificateService.generate(body.period, auth), 'Generated');
    }

    if (body.action === 'sign') {
      if (!body.period) return badRequest('period required');
      return ok(
        await accommodationCertificateService.sign(body.period, body.attestations ?? [], auth),
        'Signed'
      );
    }

    if (body.action === 'delete') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationCertificateService.softDelete(body.id, auth), 'Deleted');
    }

    if (body.action === 'hard-delete') {
      if (!body.id) return badRequest('id required');
      return ok(await accommodationCertificateService.hardDelete(body.id, auth), 'Hard Deleted');
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update certificate', err);
  }
});
