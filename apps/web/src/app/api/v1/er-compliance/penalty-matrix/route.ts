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
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { penaltyMatrixService } from '@/lib/services/er-compliance/penalty-matrix.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const severityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const actionEnum = z.enum([
  'VERBAL_WARNING',
  'WRITTEN_WARNING',
  'FINAL_WRITTEN_WARNING',
  'SUSPENSION',
  'SALARY_DEDUCTION',
  'DEMOTION',
  'TERMINATION',
  'TERMINATION_FOR_CAUSE',
]);

const inputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('recommend'),
    employeeId: z.string().min(1),
    misconductType: z.string().min(1),
    severity: severityEnum.optional(),
    countryCode: z.string().optional(),
    asOf: z.string().datetime().optional(),
  }),
  z.object({
    action: z.literal('findInconsistentPrecedents'),
    misconductType: z.string().min(1),
    severity: severityEnum.optional(),
    recommended: actionEnum,
    lookbackMonths: z.number().optional(),
  }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:read', 'employee:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;

    if (body.action === 'recommend') {
      const recommendation = await penaltyMatrixService.recommend(ctx.user.tenantId, {
        employeeId: body.employeeId,
        misconductType: body.misconductType,
        severity: body.severity,
        countryCode: body.countryCode,
        asOf: body.asOf ? new Date(body.asOf) : undefined,
      });
      return ok({ recommendation });
    }

    // findInconsistentPrecedents
    const precedents = await penaltyMatrixService.findInconsistentPrecedents(ctx.user.tenantId, {
      misconductType: body.misconductType,
      severity: body.severity,
      recommended: body.recommended,
      lookbackMonths: body.lookbackMonths,
    });
    return ok({ precedents, count: precedents.length });
  } catch (err) {
    return serverError('Failed to recommend penalty', err);
  }
});
