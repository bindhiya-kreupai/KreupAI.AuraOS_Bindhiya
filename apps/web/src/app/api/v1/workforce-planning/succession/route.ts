/**
 * EPIC-03-S06 — Succession heat-map.
 *
 * POST { roles: SuccessionInput[] } → { verdict: SuccessionHeatmap }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { buildSuccessionHeatmap } from '@/lib/services/workforce-planning/workforce-planning.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const readinessEnum = z.enum([
  'READY_NOW',
  'READY_1_YEAR',
  'READY_2_YEARS',
  'NO_SUCCESSOR',
  'EMERGENCY_COVER',
]);

const inputSchema = z.object({
  roles: z.array(
    z.object({
      role: z.string().min(1),
      incumbent: z.string().optional(),
      successors: z.array(z.object({ employeeId: z.string().min(1), readiness: readinessEnum })),
    })
  ),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'workforce_planning:read', 'dashboard:read')) return forbidden();
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const verdict = buildSuccessionHeatmap(parsed.data.roles);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to build succession heatmap', err);
  }
});
