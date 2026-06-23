import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { bahrainizationHireService } from '@/lib/services/bahrainization-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await bahrainizationHireService.list(
        ctx.user.tenantId,
        {
          legalEntityId: url.searchParams.get('legalEntityId') ?? undefined,
          artificialRiskOnly: url.searchParams.get('artificialRiskOnly') === 'true',
        },
        {
          page: Number(url.searchParams.get('page') ?? '1'),
          pageSize: Number(url.searchParams.get('pageSize') ?? '50'),
        }
      )
    );
  } catch (err) {
    return serverError('Failed to list hires', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:manage', 'employee:manage')) return forbidden();
  try {
    const body = await req.json();
    const auth = { tenantId: ctx.user.tenantId, userId: ctx.user.id };
    if (body.action === 'record') {
      for (const f of ['employeeId', 'hireDate']) {
        if (!body[f]) return badRequest(`${f} required`);
      }
      return ok(
        await bahrainizationHireService.record(
          { ...body, hireDate: new Date(body.hireDate) },
          auth
        ),
        'Hire recorded'
      );
    }
    if (body.action === 'link-evidence') {
      if (!body.employeeId) return badRequest('employeeId required');
      return ok(
        await bahrainizationHireService.linkEvidence(
          body.employeeId,
          {
            sioRegistered: body.sioRegistered,
            wageEvidenceLinked: body.wageEvidenceLinked,
            tamkeenSupported: body.tamkeenSupported,
          },
          auth
        ),
        'Evidence linked'
      );
    }
    if (body.action === 'detect-artificial-risk') {
      if (!body.employeeId) return badRequest('employeeId required');
      return ok(
        await bahrainizationHireService.detectArtificialRisk(body.employeeId, auth),
        'Risk evaluated'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update hire', err);
  }
});
