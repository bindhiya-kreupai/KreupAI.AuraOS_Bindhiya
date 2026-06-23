import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { hrmsConfigCertificateService } from '@/lib/services/hrms-config';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

// EPIC-34-S28 + S29 — HRMS config monthly + go-live certificate.

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'tenant:manage', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    if (action === 'dashboard') {
      return ok(await hrmsConfigCertificateService.dashboard(ctx.user.tenantId));
    }
    return ok(
      await hrmsConfigCertificateService.list(ctx.user.tenantId, {
        certificateType: (url.searchParams.get('certificateType') as any) ?? undefined,
        status: (url.searchParams.get('status') as any) ?? undefined,
      })
    );
  } catch (err) {
    return serverError('Failed to load certificates', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };

    if (body.action === 'generate') {
      if (!body.period || !body.certificateType) {
        return badRequest('period/certificateType required');
      }
      return ok(
        await hrmsConfigCertificateService.generate(
          { period: body.period, certificateType: body.certificateType },
          auth
        ),
        'Generated'
      );
    }

    if (body.action === 'sign') {
      if (!body.period || !body.certificateType) {
        return badRequest('period/certificateType required');
      }
      return ok(
        await hrmsConfigCertificateService.sign(
          {
            period: body.period,
            certificateType: body.certificateType,
            attestations: body.attestations,
          },
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
