/**
 * EPIC-30 — ESG / Sustainability evaluators.
 *
 * POST { action: 'diversity', input: ... }   → { verdict: DiversityReport }
 * POST { action: 'carbon', input: ... }      → { verdict: CarbonReport }
 * POST { action: 'disclosure', input: ... }  → { verdict: DisclosureReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateCarbonPerEmployee,
  evaluateDisclosureChecklist,
  evaluateDiversityMetrics,
} from '@/lib/services/esg-compliance/esg-compliance.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();

const diversityInputSchema = z.object({
  employees: z.array(
    z.object({
      employeeId: z.string().min(1),
      gender: z.enum(['M', 'F', 'O', 'UNDISCLOSED']),
      nationality: z.string().min(1),
      ageBracket: z.enum(['U30', '30-50', 'O50']),
      isPwd: z.boolean().optional(),
      jobLevel: z.enum(['EXEC', 'MANAGER', 'PROFESSIONAL', 'OPERATIONAL']),
    })
  ),
  thresholds: z
    .object({
      minFemalePct: z.number().min(0).max(1).optional(),
      minNationalsPct: z.number().min(0).max(1).optional(),
      minPwdPct: z.number().min(0).max(1).optional(),
      minFemaleInLeadershipPct: z.number().min(0).max(1).optional(),
      nationalCountry: z.string().optional(),
    })
    .optional(),
});

const carbonInputSchema = z.object({
  headcount: z.number().int().min(0),
  periodLabel: z.string().optional(),
  scope1: z.number().min(0),
  scope2: z.number().min(0),
  scope3: z.number().min(0).optional(),
  benchmarkPerFte: z.number().min(0).optional(),
});

const disclosureInputSchema = z.object({
  disclosures: z.array(
    z.object({
      code: z.string().min(1),
      label: z.string().min(1),
      labelAr: z.string().optional(),
      mandatory: z.boolean(),
      filed: z.boolean(),
      filedAt: isoDate.optional(),
      cadenceDays: z.number().int().positive().optional(),
    })
  ),
  asOf: isoDate.optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('diversity'), input: diversityInputSchema }),
  z.object({ action: z.literal('carbon'), input: carbonInputSchema }),
  z.object({ action: z.literal('disclosure'), input: disclosureInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'esg:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;

    if (body.action === 'diversity') {
      const verdict = evaluateDiversityMetrics(body.input.employees, body.input.thresholds ?? {});
      return ok({ verdict });
    }
    if (body.action === 'carbon') {
      const verdict = evaluateCarbonPerEmployee(body.input);
      return ok({ verdict });
    }
    const verdict = evaluateDisclosureChecklist(
      body.input.disclosures.map((d) => ({
        ...d,
        filedAt: d.filedAt ? new Date(d.filedAt) : undefined,
      })),
      body.input.asOf ? new Date(body.input.asOf) : new Date()
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate ESG sustainability', err);
  }
});
