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
import { withEnhancedAuth } from '@/lib/auth';
import { ruleSimulationService } from '@/lib/services/gcc-rule-library/rule-simulation.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'rule_library:read', 'config:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!body.countryCode) return badRequest('countryCode required');
    if (!Array.isArray(body.proposedOverrides) || body.proposedOverrides.length === 0) {
      return badRequest('proposedOverrides (non-empty array) required');
    }
    const overrides = body.proposedOverrides.map((o: any) => {
      if (!o.domain || !o.ruleKey) {
        throw new Error('each proposedOverride needs domain + ruleKey');
      }
      return {
        domain: String(o.domain),
        ruleKey: String(o.ruleKey),
        value: o.value,
        effectiveFrom: o.effectiveFrom ? new Date(o.effectiveFrom) : undefined,
      };
    });
    const scope = body.scope
      ? {
          sampleSize: body.scope.sampleSize,
          since: body.scope.since ? new Date(body.scope.since) : undefined,
          asOf: body.scope.asOf ? new Date(body.scope.asOf) : undefined,
        }
      : undefined;
    const result = await ruleSimulationService.simulate({
      countryCode: String(body.countryCode),
      proposedOverrides: overrides,
      scope,
    });
    return ok({ result });
  } catch (err) {
    return serverError('Failed to simulate rule pack override', err);
  }
});
