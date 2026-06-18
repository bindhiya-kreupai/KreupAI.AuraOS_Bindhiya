/**
 * EPIC-32 HR policy versioning + non-repudiable acknowledgement API.
 *
 * POST {
 *   action: 'publish',
 *   policyId, version, contentMarkdown?, effectiveDate?
 * } → { record: PolicyVersionRecord }
 *
 * POST {
 *   action: 'acknowledge',
 *   policyId, employeeId, ipAddress?, userAgent?
 * } → { record: AcknowledgementRecord }
 *
 * POST {
 *   action: 'verifyAcknowledgement',
 *   policyId, employeeId
 * } → { verdict: { match, ackVersion?, currentVersion? } }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { PolicyVersioningService } from '@/lib/services/hr-policies-compliance/policy-versioning.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const service = new PolicyVersioningService();

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'policy:read', 'policy:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    const auth = {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
      userEmail: (ctx.user as any).email,
    };

    if (body.action === 'publish') {
      if (!body.policyId) return badRequest('policyId required');
      if (!body.version) return badRequest('version required');
      const record = await service.publish(
        {
          policyId: body.policyId,
          version: body.version,
          contentMarkdown: body.contentMarkdown,
          effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
        },
        auth
      );
      return ok({ record });
    }

    if (body.action === 'acknowledge') {
      if (!body.policyId) return badRequest('policyId required');
      if (!body.employeeId) return badRequest('employeeId required');
      const record = await service.acknowledge(
        {
          policyId: body.policyId,
          employeeId: body.employeeId,
          ipAddress: body.ipAddress,
          userAgent: body.userAgent,
        },
        auth
      );
      return ok({ record });
    }

    if (body.action === 'verifyAcknowledgement') {
      if (!body.policyId) return badRequest('policyId required');
      if (!body.employeeId) return badRequest('employeeId required');
      const verdict = await service.verifyAcknowledgement({
        policyId: body.policyId,
        employeeId: body.employeeId,
        tenantId: ctx.user.tenantId,
      });
      return ok({ verdict });
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to evaluate policy versioning action', err);
  }
});
