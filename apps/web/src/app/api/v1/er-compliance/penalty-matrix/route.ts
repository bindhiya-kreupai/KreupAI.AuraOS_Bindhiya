/**
 * EPIC-26 disciplinary penalty matrix API.
 *
 * POST {
 *   action: 'recommend',
 *   employeeId, misconductType, severity?, countryCode?, asOf?
 * } → { recommendation: PenaltyRecommendation }
 *
 * POST {
 *   action: 'findInconsistentPrecedents',
 *   misconductType, severity?, recommended, lookbackMonths?
 * } → { precedents: [...] }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { penaltyMatrixService } from '@/lib/services/er-compliance/penalty-matrix.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:read', 'employee:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();

    if (body.action === 'recommend') {
      if (!body.employeeId) return badRequest('employeeId required');
      if (!body.misconductType) return badRequest('misconductType required');
      const recommendation = await penaltyMatrixService.recommend(ctx.user.tenantId, {
        employeeId: body.employeeId,
        misconductType: body.misconductType,
        severity: body.severity,
        countryCode: body.countryCode,
        asOf: body.asOf ? new Date(body.asOf) : undefined,
      });
      return ok({ recommendation });
    }

    if (body.action === 'findInconsistentPrecedents') {
      if (!body.misconductType) return badRequest('misconductType required');
      if (!body.recommended) return badRequest('recommended action required');
      const precedents = await penaltyMatrixService.findInconsistentPrecedents(ctx.user.tenantId, {
        misconductType: body.misconductType,
        severity: body.severity,
        recommended: body.recommended,
        lookbackMonths: body.lookbackMonths,
      });
      return ok({ precedents, count: precedents.length });
    }

    return badRequest('unknown action');
  } catch (err) {
    return serverError('Failed to recommend penalty', err);
  }
});
