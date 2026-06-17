import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { emiratisationHireService } from '@/lib/services/emiratisation-compliance';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'employee:read', 'dashboard:read'))
    return forbidden();
  try {
    const url = new URL(req.url);
    return ok(
      await emiratisationHireService.list(ctx.user.tenantId, {
        legalEntityId: url.searchParams.get('legalEntityId') ?? undefined,
        fakeRiskOnly: url.searchParams.get('fakeRiskOnly') === 'true',
      })
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
        await emiratisationHireService.record({ ...body, hireDate: new Date(body.hireDate) }, auth),
        'Hire recorded'
      );
    }
    if (body.action === 'link-evidence') {
      if (!body.employeeId) return badRequest('employeeId required');
      return ok(
        await emiratisationHireService.linkEvidence(
          body.employeeId,
          { gpssaRegistered: body.gpssaRegistered, wpsCovered: body.wpsCovered },
          auth
        ),
        'Evidence linked'
      );
    }
    if (body.action === 'detect-fake-risk') {
      if (!body.employeeId) return badRequest('employeeId required');
      return ok(
        await emiratisationHireService.detectFakeRisk(body.employeeId, auth),
        'Fake-risk analysed'
      );
    }
    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to update hire', err);
  }
});
