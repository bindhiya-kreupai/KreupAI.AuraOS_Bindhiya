/**
 * EPIC-24 HSE safety management API.
 *
 * POST { action: 'ppe', input: PpeCoverageInput }     → { verdict: PpeCoverageReport }
 * POST { action: 'toolbox', input: ToolboxCoverageInput } → { verdict: ToolboxCoverageReport }
 * POST { action: 'drill', input: DrillCadenceInput }   → { verdict: DrillCadenceReport }
 *
 * Each input shape is validated by a Zod schema that mirrors the
 * service-layer Input interface — wire-form dates (ISO strings) are
 * hydrated to Date instances before invoking the evaluator.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateDrillCadence,
  evaluatePpeCoverage,
  evaluateToolboxCoverage,
} from '@/lib/services/hse-compliance/safety-management.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();

const ppeInputSchema = z.object({
  employees: z.array(z.object({ employeeId: z.string().min(1), role: z.string().min(1) })),
  issuances: z.array(
    z.object({
      employeeId: z.string().min(1),
      ppeType: z.string().min(1),
      issuedAt: isoDate,
      expiresAt: isoDate,
      hasSize: z.boolean(),
    })
  ),
  requirements: z.array(z.object({ role: z.string().min(1), ppeType: z.string().min(1) })),
  asOf: isoDate.optional(),
});

const toolboxInputSchema = z.object({
  employees: z.array(z.object({ employeeId: z.string().min(1) })),
  attendances: z.array(z.object({ employeeId: z.string().min(1), attendedAt: isoDate })),
  cadenceDays: z.number().int().positive().optional(),
  asOf: isoDate.optional(),
});

const drillTypeEnum = z.enum(['FIRE', 'EARTHQUAKE', 'CHEMICAL', 'EVACUATION_GENERAL']);

const drillInputSchema = z.object({
  drills: z.array(
    z.object({
      drillType: drillTypeEnum,
      conductedAt: isoDate,
      attendancePct: z.number().min(0).max(100),
      passed: z.boolean(),
    })
  ),
  cadence: z.record(drillTypeEnum, z.number().int().positive()).optional(),
  asOf: isoDate.optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('ppe'), input: ppeInputSchema }),
  z.object({ action: z.literal('toolbox'), input: toolboxInputSchema }),
  z.object({ action: z.literal('drill'), input: drillInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hse:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const asOfDefault = new Date();

    if (body.action === 'ppe') {
      const verdict = evaluatePpeCoverage({
        employees: body.input.employees,
        requirements: body.input.requirements,
        issuances: body.input.issuances.map((i) => ({
          employeeId: i.employeeId,
          ppeType: i.ppeType,
          hasSize: i.hasSize,
          issuedAt: new Date(i.issuedAt),
          expiresAt: new Date(i.expiresAt),
        })),
        asOf: body.input.asOf ? new Date(body.input.asOf) : asOfDefault,
      });
      return ok({ verdict });
    }
    if (body.action === 'toolbox') {
      const verdict = evaluateToolboxCoverage({
        employees: body.input.employees,
        cadenceDays: body.input.cadenceDays,
        attendances: body.input.attendances.map((a) => ({
          employeeId: a.employeeId,
          attendedAt: new Date(a.attendedAt),
        })),
        asOf: body.input.asOf ? new Date(body.input.asOf) : asOfDefault,
      });
      return ok({ verdict });
    }
    // drill
    const verdict = evaluateDrillCadence({
      drills: body.input.drills.map((d) => ({
        drillType: d.drillType,
        passed: d.passed,
        attendancePct: d.attendancePct,
        conductedAt: new Date(d.conductedAt),
      })),
      cadence: body.input.cadence,
      asOf: body.input.asOf ? new Date(body.input.asOf) : asOfDefault,
    });
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate HSE safety management', err);
  }
});
