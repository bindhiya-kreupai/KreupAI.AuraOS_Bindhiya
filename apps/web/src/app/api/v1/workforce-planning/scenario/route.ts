/**
 * EPIC-03-S05 — Scenario modelling backend.
 *
 * POST { assumptions: ScenarioAssumptions } → { verdict: ScenarioReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { runScenario } from '@/lib/services/workforce-planning/workforce-planning.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const assumptionsSchema = z.object({
  startingHeadcount: z.number().int().min(0),
  monthlyCostPerRole: z.record(z.string(), z.number().min(0)),
  annualGrowthPctPerRole: z.record(z.string(), z.number()),
  annualAttritionPctPerRole: z.record(z.string(), z.number().min(0)),
  horizonMonths: z.number().int().min(0).max(120),
});

const inputSchema = z.object({ assumptions: assumptionsSchema });

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'workforce_planning:read', 'dashboard:read')) return forbidden();
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const verdict = runScenario(parsed.data.assumptions);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to run scenario', err);
  }
});
