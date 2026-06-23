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
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { PolicyVersioningService } from '@/lib/services/hr-policies-compliance/policy-versioning.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const service = new PolicyVersioningService();

const inputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('publish'),
    policyId: z.string().min(1),
    version: z.string().min(1),
    contentMarkdown: z.string().optional(),
    effectiveDate: z.string().datetime().optional(),
  }),
  z.object({
    action: z.literal('acknowledge'),
    policyId: z.string().min(1),
    employeeId: z.string().min(1),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
  }),
  z.object({
    action: z.literal('verifyAcknowledgement'),
    policyId: z.string().min(1),
    employeeId: z.string().min(1),
  }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'policy:read', 'policy:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const auth = {
      tenantId: ctx.user.tenantId,
      userId: ctx.user.id,
      userEmail: (ctx.user as any).email,
    };

    if (body.action === 'publish') {
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

    // verifyAcknowledgement
    const verdict = await service.verifyAcknowledgement({
      policyId: body.policyId,
      employeeId: body.employeeId,
      tenantId: ctx.user.tenantId,
    });
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate policy versioning action', err);
  }
});
