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
import { withEnhancedAuth } from '@/lib/auth';
import { reconcileThreeWay } from '@/lib/services/nitaqat-compliance/three-way-reconciliation.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'tenant:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!Array.isArray(body.qiwa)) return badRequest('qiwa (array) required');
    if (!Array.isArray(body.gosi)) return badRequest('gosi (array) required');
    if (!Array.isArray(body.mudad)) return badRequest('mudad (array) required');
    const result = reconcileThreeWay({
      qiwa: body.qiwa,
      gosi: body.gosi,
      mudad: body.mudad,
      wageToleranceSar:
        typeof body.wageToleranceSar === 'number' ? body.wageToleranceSar : undefined,
    });
    return ok({ result });
  } catch (err) {
    return serverError('Failed to reconcile three-way Nitaqat data', err);
  }
});
