/**
 * EPIC-24 HSE residual closures.
 *
 * POST { action: 'governance' | 'accountability' | 'firstAid' |
 *         'contractor' | 'welfare' | 'cctv' | 'hrIntegration' |
 *         'checklist', input: ... } → { verdict }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateCctvCadence,
  evaluateContractorHse,
  evaluateFirstAidCadence,
  evaluateHrIntegration,
  evaluateHseAccountability,
  evaluateHseChecklist,
  evaluateHseGovernanceMatrix,
  evaluateWelfareFacilityCadence,
} from '@/lib/services/hse-compliance/hse-residuals.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();

const governanceInputSchema = z.object({
  controls: z.array(
    z.object({
      code: z.string().min(1),
      label: z.string().min(1),
      labelAr: z.string().optional(),
      domain: z.string().min(1),
      cadenceDays: z.number().int().positive(),
      evidenceType: z.string().min(1),
      requiredRoles: z.array(z.string()),
    })
  ),
  evidences: z.array(
    z.object({
      controlCode: z.string().min(1),
      evidencedAt: isoDate,
      evidencedBy: z.string().min(1),
      evidenceRef: z.string().optional(),
    })
  ),
  asOf: isoDate.optional(),
});

const accountabilityInputSchema = z.object({
  totalWorkers: z.number().int().nonnegative(),
  requiredRatios: z.record(z.string(), z.number().int().positive()),
  assignments: z.array(
    z.object({
      role: z.string().min(1),
      employeeId: z.string().min(1),
      certified: z.boolean(),
      mandated: z.boolean(),
    })
  ),
});

const firstAidInputSchema = z.object({
  zones: z.array(z.string().min(1)),
  inspections: z.array(
    z.object({
      zone: z.string().min(1),
      inspectedAt: isoDate,
      consumablesValid: z.boolean(),
      sealed: z.boolean(),
    })
  ),
  cadenceDays: z.number().int().positive().optional(),
  asOf: isoDate.optional(),
});

const contractorInputSchema = z.object({
  contractors: z.array(
    z.object({
      contractorId: z.string().min(1),
      workers: z.number().int().nonnegative(),
      ppeIssuancePct: z.number().min(0).max(100),
      trainingCoveragePct: z.number().min(0).max(100),
      incidentRatePer100k: z.number().min(0),
    })
  ),
  baseline: z.object({
    minPpeIssuancePct: z.number().min(0).max(100),
    minTrainingCoveragePct: z.number().min(0).max(100),
    maxIncidentRatePer100k: z.number().min(0),
  }),
});

const welfareFacility = z.enum(['TOILETS', 'DRINKING_WATER', 'REST_AREA', 'CHANGING_ROOM']);

const welfareInputSchema = z.object({
  zones: z.array(z.string().min(1)),
  facilities: z.array(welfareFacility),
  checks: z.array(
    z.object({
      facility: welfareFacility,
      zone: z.string().min(1),
      checkedAt: isoDate,
      functional: z.boolean(),
    })
  ),
  cadenceDays: z.number().int().positive().optional(),
  asOf: isoDate.optional(),
});

const cctvInputSchema = z.object({
  cameras: z.array(z.string().min(1)),
  checks: z.array(
    z.object({
      cameraId: z.string().min(1),
      checkedAt: isoDate,
      functional: z.boolean(),
      retentionDays: z.number().int().nonnegative(),
    })
  ),
  cadenceDays: z.number().int().positive().optional(),
  requiredRetentionDays: z.number().int().positive().optional(),
  asOf: isoDate.optional(),
});

const hrInputSchema = z.object({
  links: z.array(
    z.object({
      incidentId: z.string().min(1),
      employeeId: z.string().min(1),
      incidentAt: isoDate,
      daysLostExpected: z.number().int().nonnegative(),
      leaveCreated: z.boolean(),
      leaveDaysCovered: z.number().int().nonnegative(),
      payAdjusted: z.boolean(),
      workmanCompFiled: z.boolean(),
    })
  ),
});

const checklistInputSchema = z.object({
  items: z.array(
    z.object({
      code: z.string().min(1),
      question: z.string().min(1),
      questionAr: z.string().min(1),
      weight: z.number().int().min(1).max(10),
      critical: z.boolean(),
    })
  ),
  responses: z.array(
    z.object({
      code: z.string().min(1),
      pass: z.boolean(),
      noted: z.string().optional(),
    })
  ),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('governance'), input: governanceInputSchema }),
  z.object({ action: z.literal('accountability'), input: accountabilityInputSchema }),
  z.object({ action: z.literal('firstAid'), input: firstAidInputSchema }),
  z.object({ action: z.literal('contractor'), input: contractorInputSchema }),
  z.object({ action: z.literal('welfare'), input: welfareInputSchema }),
  z.object({ action: z.literal('cctv'), input: cctvInputSchema }),
  z.object({ action: z.literal('hrIntegration'), input: hrInputSchema }),
  z.object({ action: z.literal('checklist'), input: checklistInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hse:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    const asOfDefault = new Date();

    if (body.action === 'governance') {
      const verdict = evaluateHseGovernanceMatrix(
        body.input.controls,
        body.input.evidences.map((e) => ({
          controlCode: e.controlCode,
          evidencedAt: new Date(e.evidencedAt),
          evidencedBy: e.evidencedBy,
          evidenceRef: e.evidenceRef,
        })),
        body.input.asOf ? new Date(body.input.asOf) : asOfDefault
      );
      return ok({ verdict });
    }

    if (body.action === 'accountability') {
      const verdict = evaluateHseAccountability(body.input);
      return ok({ verdict });
    }

    if (body.action === 'firstAid') {
      const verdict = evaluateFirstAidCadence({
        zones: body.input.zones,
        cadenceDays: body.input.cadenceDays,
        inspections: body.input.inspections.map((i) => ({
          zone: i.zone,
          inspectedAt: new Date(i.inspectedAt),
          consumablesValid: i.consumablesValid,
          sealed: i.sealed,
        })),
        asOf: body.input.asOf ? new Date(body.input.asOf) : asOfDefault,
      });
      return ok({ verdict });
    }

    if (body.action === 'contractor') {
      const verdict = evaluateContractorHse(body.input);
      return ok({ verdict });
    }

    if (body.action === 'welfare') {
      const verdict = evaluateWelfareFacilityCadence({
        zones: body.input.zones,
        facilities: body.input.facilities,
        cadenceDays: body.input.cadenceDays,
        checks: body.input.checks.map((c) => ({
          facility: c.facility,
          zone: c.zone,
          checkedAt: new Date(c.checkedAt),
          functional: c.functional,
        })),
        asOf: body.input.asOf ? new Date(body.input.asOf) : asOfDefault,
      });
      return ok({ verdict });
    }

    if (body.action === 'cctv') {
      const verdict = evaluateCctvCadence({
        cameras: body.input.cameras,
        cadenceDays: body.input.cadenceDays,
        requiredRetentionDays: body.input.requiredRetentionDays,
        checks: body.input.checks.map((c) => ({
          cameraId: c.cameraId,
          checkedAt: new Date(c.checkedAt),
          functional: c.functional,
          retentionDays: c.retentionDays,
        })),
        asOf: body.input.asOf ? new Date(body.input.asOf) : asOfDefault,
      });
      return ok({ verdict });
    }

    if (body.action === 'hrIntegration') {
      const verdict = evaluateHrIntegration(
        body.input.links.map((l) => ({
          ...l,
          incidentAt: new Date(l.incidentAt),
        }))
      );
      return ok({ verdict });
    }

    // checklist
    const verdict = evaluateHseChecklist(body.input);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate HSE residual request', err);
  }
});
