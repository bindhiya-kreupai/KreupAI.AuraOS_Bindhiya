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
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  DEFAULT_CLUSTERING_CONFIG,
  profileCohort,
  profileHireRisk,
} from '@/lib/services/emiratisation-compliance/fake-risk-clustering.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const hireSnapshotSchema = z.object({
  employeeId: z.string().min(1),
  basicSalary: z.number().optional(),
  currency: z.string().optional(),
  bankAccountIban: z.string().optional(),
  permanentAddress: z.string().optional(),
  hiredOn: z.string().datetime().optional(),
  recruiterId: z.string().optional(),
  costCenterId: z.string().optional(),
  hasVisaOnFile: z.boolean().optional(),
  isOnRoster: z.boolean().optional(),
  attendanceDaysLast30: z.number().optional(),
  familyLinkedToHr: z.boolean().optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('profileHire'),
    hire: hireSnapshotSchema,
    cohort: z.array(hireSnapshotSchema),
    config: z.record(z.unknown()).optional(),
  }),
  z.object({
    action: z.literal('profileCohort'),
    cohort: z.array(hireSnapshotSchema),
    config: z.record(z.unknown()).optional(),
  }),
]);

function hydrateHire(h: z.infer<typeof hireSnapshotSchema>) {
  return {
    employeeId: h.employeeId,
    basicSalary: Number(h.basicSalary ?? 0),
    currency: h.currency ?? 'AED',
    bankAccountIban: h.bankAccountIban,
    permanentAddress: h.permanentAddress,
    hiredOn: h.hiredOn ? new Date(h.hiredOn) : new Date(),
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
    const raw = await req.json();
    // Default action when missing → profileCohort (preserve prior behaviour)
    const withAction =
      raw && typeof raw === 'object' && raw.action ? raw : { ...raw, action: 'profileCohort' };
    const parsed = inputSchema.safeParse(withAction);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const config = { ...DEFAULT_CLUSTERING_CONFIG, ...((body.config as any) ?? {}) };
    const cohort = body.cohort.map(hydrateHire);

    if (body.action === 'profileHire') {
      const hire = hydrateHire(body.hire);
      const result = profileHireRisk(hire, cohort, config);
      return ok({ result });
    }

    // profileCohort
    const result = profileCohort(cohort, config);
    return ok({ result, total: result.length });
  } catch (err) {
    return serverError('Failed to evaluate fake-risk clustering', err);
  }
});
