/**
 * EPIC-24 HSE safety management API.
 *
 * POST { action: 'ppe', input: PpeCoverageInput }     → { verdict: PpeCoverageReport }
 * POST { action: 'toolbox', input: ToolboxCoverageInput } → { verdict: ToolboxCoverageReport }
 * POST { action: 'drill', input: DrillCadenceInput }   → { verdict: DrillCadenceReport }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateDrillCadence,
  evaluatePpeCoverage,
  evaluateToolboxCoverage,
} from '@/lib/services/hse-compliance/safety-management.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

function hydrateAsOf(input: any) {
  return { ...input, asOf: input.asOf ? new Date(input.asOf) : new Date() };
}

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'hse:read', 'tenant:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!body.input) return badRequest('input required');

    if (body.action === 'ppe') {
      const input = hydrateAsOf(body.input);
      input.issuances = (input.issuances ?? []).map((i: any) => ({
        ...i,
        issuedAt: new Date(i.issuedAt),
        expiresAt: new Date(i.expiresAt),
      }));
      const verdict = evaluatePpeCoverage(input);
      return ok({ verdict });
    }
    if (body.action === 'toolbox') {
      const input = hydrateAsOf(body.input);
      input.attendances = (input.attendances ?? []).map((a: any) => ({
        ...a,
        attendedAt: new Date(a.attendedAt),
      }));
      const verdict = evaluateToolboxCoverage(input);
      return ok({ verdict });
    }
    if (body.action === 'drill') {
      const input = hydrateAsOf(body.input);
      input.drills = (input.drills ?? []).map((d: any) => ({
        ...d,
        conductedAt: new Date(d.conductedAt),
      }));
      const verdict = evaluateDrillCadence(input);
      return ok({ verdict });
    }
    return badRequest('action must be one of ppe | toolbox | drill');
  } catch (err) {
    return serverError('Failed to evaluate HSE safety management', err);
  }
});
