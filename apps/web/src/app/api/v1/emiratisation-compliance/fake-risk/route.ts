/**
 * EPIC-16 fake-Emiratisation risk clustering API.
 *
 * POST {
 *   action: 'profileHire' | 'profileCohort',
 *   hire?: HireSnapshot,
 *   cohort: HireSnapshot[],
 *   config?: Partial<ClusteringConfig>
 * } → { result: RiskProfile | RiskProfile[] }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  DEFAULT_CLUSTERING_CONFIG,
  profileCohort,
  profileHireRisk,
} from '@/lib/services/emiratisation-compliance/fake-risk-clustering.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

function hydrateHire(h: any) {
  if (!h.employeeId) throw new Error('hire.employeeId required');
  return {
    employeeId: String(h.employeeId),
    basicSalary: Number(h.basicSalary ?? 0),
    currency: String(h.currency ?? 'AED'),
    bankAccountIban: h.bankAccountIban,
    permanentAddress: h.permanentAddress,
    hiredOn: new Date(h.hiredOn ?? Date.now()),
    recruiterId: h.recruiterId,
    costCenterId: h.costCenterId,
    hasVisaOnFile: h.hasVisaOnFile === true,
    isOnRoster: h.isOnRoster === true,
    attendanceDaysLast30: Number(h.attendanceDaysLast30 ?? 0),
    familyLinkedToHr: h.familyLinkedToHr === true,
  };
}

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:read', 'employee:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!Array.isArray(body.cohort)) return badRequest('cohort (array) required');
    const config = { ...DEFAULT_CLUSTERING_CONFIG, ...(body.config ?? {}) };
    const cohort = body.cohort.map(hydrateHire);

    if (body.action === 'profileHire') {
      if (!body.hire) return badRequest('hire required for profileHire');
      const hire = hydrateHire(body.hire);
      const result = profileHireRisk(hire, cohort, config);
      return ok({ result });
    }

    // default: profileCohort
    const result = profileCohort(cohort, config);
    return ok({ result, total: result.length });
  } catch (err) {
    return serverError('Failed to evaluate fake-risk clustering', err);
  }
});
