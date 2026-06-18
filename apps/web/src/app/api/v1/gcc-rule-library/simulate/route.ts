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

const inputSchema = z.object({
  countryCode: z.string().min(1),
  proposedOverrides: z
    .array(
      z.object({
        domain: z.string().min(1),
        ruleKey: z.string().min(1),
        value: z.unknown(),
        effectiveFrom: z.string().datetime().optional(),
      })
    )
    .min(1),
  scope: z
    .object({
      sampleSize: z.number().optional(),
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
