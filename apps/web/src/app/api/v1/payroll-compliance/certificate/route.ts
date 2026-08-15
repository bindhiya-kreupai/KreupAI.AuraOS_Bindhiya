import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { payrollComplianceCertificateService } from '@/lib/services/payroll-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (_req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll_compliance:read', 'payroll:read', 'dashboard:read'))
    return forbidden();
  try {
    return ok(await payrollComplianceCertificateService.list(ctx.user.tenantId));
  } catch (err) {
    return serverError('Failed to list payroll certificates', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'payroll_compliance:manage',
      'payroll:manage',
      'tenant:read',
      'dashboard:read'
    )
  )
    return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'generate') {
      if (!body.period) return badRequest('period required');
      return ok(await payrollComplianceCertificateService.generate(body.period, auth), 'Generated');
    }
    if (body.action === 'sign') {
      if (!body.period) return badRequest('period required');
      return ok(
        await payrollComplianceCertificateService.sign(body.period, body.attestations ?? [], auth),
        'Signed'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update payroll certificate', err);
  }
});
