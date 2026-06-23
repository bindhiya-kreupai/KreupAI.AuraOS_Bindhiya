/**
 * EPIC-17 Nitaqat / GOSI / Mudad three-way reconciliation API.
 *
 * POST {
 *   qiwa: QiwaRecord[],
 *   gosi: GosiRecord[],
 *   mudad: MudadRecord[],
 *   wageToleranceSar?: number
 * } → { result: ReconciliationReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { reconcileThreeWay } from '@/lib/services/nitaqat-compliance/three-way-reconciliation.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  qiwa: z.array(z.record(z.unknown())),
  gosi: z.array(z.record(z.unknown())),
  mudad: z.array(z.record(z.unknown())),
  wageToleranceSar: z.number().optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const result = reconcileThreeWay({
      qiwa: body.qiwa as any,
      gosi: body.gosi as any,
      mudad: body.mudad as any,
      wageToleranceSar: body.wageToleranceSar,
    });
    return ok({ result });
  } catch (err) {
    return serverError('Failed to reconcile three-way Nitaqat data', err);
  }
});
