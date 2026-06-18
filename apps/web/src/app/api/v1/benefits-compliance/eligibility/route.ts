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
import { withEnhancedAuth } from '@/lib/auth';
import { benefitEligibilityService } from '@/lib/services/benefits-compliance/eligibility.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'employee:read', 'benefits:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    const asOf = body.asOf ? new Date(body.asOf) : new Date();

    if (body.action === 'evaluate') {
      if (!body.benefitCode || typeof body.benefitCode !== 'string') {
        return badRequest('benefitCode required');
      }
      if (!body.context?.employee?.id) {
        return badRequest('context.employee.id required');
      }
      const verdict = await benefitEligibilityService.evaluate(
        ctx.user.tenantId,
        body.benefitCode,
        body.context,
        asOf
      );
      return ok({ verdict });
    }

    if (body.action === 'evaluateAll') {
      if (!body.context?.employee?.id) {
        return badRequest('context.employee.id required');
      }
      const verdicts = await benefitEligibilityService.evaluateAllForEmployee(
        ctx.user.tenantId,
        body.context,
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

    if (body.action === 'findMandatoryGaps') {
      if (!body.employeeId) return badRequest('employeeId required');
      if (!body.context?.employee?.id) {
        return badRequest('context.employee.id required');
      }
      const result = await benefitEligibilityService.findMandatoryGaps(
        ctx.user.tenantId,
        body.employeeId,
        body.context,
        asOf
      );
      return ok(result);
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to evaluate benefits eligibility', err);
  }
});
