/**
 * EPIC-36 rule-pack simulation API.
 *
 * POST {
 *   countryCode,
 *   proposedOverrides: [{ domain, ruleKey, value, effectiveFrom? }],
 *   scope?: { sampleSize?, since?, asOf? }
 * } → { result: SimulationReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { ruleSimulationService } from '@/lib/services/gcc-rule-library/rule-simulation.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

/**
 * `value` of an override is whatever the underlying rule pack stores —
 * it can be a number (rate, days), string (cohort code), boolean
 * (flag), array (rate bands), or object (structured config). Reject
 * undefined/null at the boundary so we never let the simulator
 * silently fall through; everything else is admissible.
 */
const overrideValueSchema = z.union([
  z.number(),
  z.string(),
  z.boolean(),
  z.array(z.unknown()),
  z.record(z.unknown()),
]);

const inputSchema = z.object({
  countryCode: z.string().min(2).max(3),
  proposedOverrides: z
    .array(
      z.object({
        domain: z.string().min(1),
        ruleKey: z.string().min(1),
        value: overrideValueSchema,
        effectiveFrom: z.string().datetime().optional(),
      })
    )
    .min(1),
  scope: z
    .object({
      sampleSize: z.number().int().positive().optional(),
      since: z.string().datetime().optional(),
      asOf: z.string().datetime().optional(),
    })
    .optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'rule_library:read', 'config:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const overrides = body.proposedOverrides.map((o) => ({
      domain: o.domain,
      ruleKey: o.ruleKey,
      value: o.value,
      effectiveFrom: o.effectiveFrom ? new Date(o.effectiveFrom) : undefined,
    }));
    const scope = body.scope
      ? {
          sampleSize: body.scope.sampleSize,
          since: body.scope.since ? new Date(body.scope.since) : undefined,
          asOf: body.scope.asOf ? new Date(body.scope.asOf) : undefined,
        }
      : undefined;
    const result = await ruleSimulationService.simulate({
      countryCode: body.countryCode,
      proposedOverrides: overrides,
      scope,
    });
    return ok({ result });
  } catch (err) {
    return serverError('Failed to simulate rule pack override', err);
  }
});
