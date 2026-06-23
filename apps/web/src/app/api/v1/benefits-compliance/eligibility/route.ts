/**
 * EPIC-22-S02 benefits eligibility evaluation API.
 *
 * POST: evaluate eligibility against one benefit code OR the full
 * ACTIVE catalogue, and (optional) detect mandatory cover gaps for
 * an employee.
 *
 * Body shapes:
 *   { action: 'evaluate', benefitCode: 'MEDICAL_INSURANCE_UAE',
 *     context: { employee: {...} }, asOf?: ISO }
 *     → { verdict: EligibilityVerdict | null }
 *
 *   { action: 'evaluateAll', context: { employee: {...} }, asOf?: ISO,
 *     filter?: { countryCode?, benefitType? } }
 *     → { verdicts: EligibilityVerdict[] }
 *
 *   { action: 'findMandatoryGaps', employeeId, context: { employee },
 *     asOf?: ISO }
 *     → { uncovered: [...], coveredButIneligible: [...] }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { benefitEligibilityService } from '@/lib/services/benefits-compliance/eligibility.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const employeeContextSchema = z
  .object({
    employee: z
      .object({
        id: z.string().min(1),
      })
      .passthrough(),
  })
  .passthrough();

const inputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('evaluate'),
    benefitCode: z.string().min(1),
    context: employeeContextSchema,
    asOf: z.string().datetime().optional(),
  }),
  z.object({
    action: z.literal('evaluateAll'),
    context: employeeContextSchema,
    asOf: z.string().datetime().optional(),
    filter: z
      .object({
        countryCode: z.string().optional(),
        benefitType: z.string().optional(),
      })
      .optional(),
  }),
  z.object({
    action: z.literal('findMandatoryGaps'),
    employeeId: z.string().min(1),
    context: employeeContextSchema,
    asOf: z.string().datetime().optional(),
  }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'employee:read', 'benefits:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const asOf = body.asOf ? new Date(body.asOf) : new Date();

    if (body.action === 'evaluate') {
      const verdict = await benefitEligibilityService.evaluate(
        ctx.user.tenantId,
        body.benefitCode,
        body.context as any,
        asOf
      );
      return ok({ verdict });
    }

    if (body.action === 'evaluateAll') {
      const verdicts = await benefitEligibilityService.evaluateAllForEmployee(
        ctx.user.tenantId,
        body.context as any,
        asOf,
        body.filter ?? {}
      );
      return ok({
        verdicts,
        totals: {
          checked: verdicts.length,
          eligible: verdicts.filter((v) => v.eligible).length,
          ineligible: verdicts.filter((v) => !v.eligible).length,
        },
      });
    }

    // findMandatoryGaps
    const result = await benefitEligibilityService.findMandatoryGaps(
      ctx.user.tenantId,
      body.employeeId,
      body.context as any,
      asOf
    );
    return ok(result);
  } catch (err) {
    return serverError('Failed to evaluate benefits eligibility', err);
  }
});
